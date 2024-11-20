// useConversation.ts

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ConversationStatus, HistoryItem, InsightsArray } from '../lib/types';
import { log } from '../lib/logger';
import { setConversationData } from "@/store/features/conversation-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

let greetOnce = false;

export function useConversation(
  isListening: boolean,
  startListening: () => void,
  stopListening: () => void
) {
  // State variables
  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [rawText, setRawText] = useState("Welcome! Click the microphone to start talking.");
  const [caretakerInsight, setCaretakerInsight] = useState<InsightsArray>([]);
  const [showThumb, setShowThumb] = useState(false);
  const [senseIndex, setSenseIndex] = useState(4);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const isRecognizingRef = useRef<boolean>(false);
  
  // Refs
  const conversationStartTime = useRef<Date | null>(null);
  const wordCountRef = useRef<number>(0);
  const hasReceivedInput = useRef<boolean>(false);
  const currentTranscript = useRef<string>(''); // Accumulates the entire conversation
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isProcessingResponseRef = useRef<boolean>(false);
  const ignoreRecognitionResults = useRef<boolean>(false);
  const [mood, setMood] = useState<'Stressed' | 'Anxious' | 'Normal' | 'Cheerful'>('Cheerful');
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  
  let speechTimeout: NodeJS.Timeout | null = null;
  
  const speakResponse = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Check if SpeechSynthesis is supported
        if (!window.speechSynthesis) {
          log.error('SpeechSynthesis not supported in this browser.');
          reject('SpeechSynthesis not supported.');
          return;
        }
        
        // Ignore recognition results while speaking
        ignoreRecognitionResults.current = true;

        //stop recognition so it won't recognize what is being spoken
        if(recognitionRef.current) {
          recognitionRef.current.stop();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.pitch = 1.3; // Adjust pitch for friendliness
        utterance.rate = 1;    // Normal rate
        utterance.volume = 1;  // Full volume
  
        const setVoiceAndSpeak = () => {
          const voices = window.speechSynthesis.getVoices();
          // Filter for female voices in 'en-US' language
          const femaleVoices = voices.filter((voice) =>
            voice.lang === 'en-US' &&
            (voice.name.includes('Female') ||
             ['Google US English', 'Samantha', 'Victoria', 'Susan', 'Moira', 'Tessa'].includes(voice.name))
          );
  
          if (femaleVoices.length > 0) {
            utterance.voice = femaleVoices[0]; // Select the first matching female voice
          } 

          // Speak the utterance
          window.speechSynthesis.speak(utterance);
        };
  
        // Error handling
        utterance.onerror = (event) => {
          log.error('Speech synthesis error:', event.error);
          ignoreRecognitionResults.current = false;
          reject(event.error);
        };
  
        utterance.onend = () => {
          ignoreRecognitionResults.current = false;
          console.log('UTTER END')
          //after response is spoken and isRecognizingRef is false, start the recognition so it can recognize the user's voice again.
          if(!isRecognizingRef.current && recognitionRef.current) {
            recognitionRef.current.start();
          }
          resolve();
        };
  
        // Ensure the audio context is resumed on user interaction (mainly for iOS)
        if (typeof window.AudioContext !== 'undefined') {
          const audioContext = new AudioContext();
          if (audioContext.state === 'suspended') {
            audioContext.resume();
          }
        }
  
        // Check if voices are already loaded
        if (window.speechSynthesis.getVoices().length > 0) {
          setVoiceAndSpeak();
        } else {
          // Wait for voices to be loaded
          window.speechSynthesis.onvoiceschanged = () => {
            setVoiceAndSpeak();
          };
        }
      });
    },
    []
  );

  // Function to send transcript to ChatGPT and get the response
  const handleChatGPTRequest = useCallback(
    async (text: string) => {
      //log.info('Sending to chatGPT message:', text);
      isProcessingResponseRef.current = true;
      ignoreRecognitionResults.current = true;
      let err=false;
      let endConversation=false;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: text, 
            history: history.map(item => item.rawText).join('\n\n')
          }),
        });
        const data = await res.json();
        if (res.ok) {
          // Accumulate the conversation in currentTranscript
          currentTranscript.current += `AI Assist: ${data.response}\n`;
          setRawText(currentTranscript.current);
          await speakResponse(data.response);

          endConversation = data.endConversation;

        } else {
          log.error('Error:', data.error);
          await speakResponse("I'm sorry, I couldn't process your request.");
        }
      } catch (error) {
        err=true;
        log.error('API call failed:', error);
        await speakResponse("I'm sorry, I encountered an error. Please try again.");
      } finally {
        if(!err) {
          if(endConversation) {
            stopListening();
            setStatus('idle');
            setShowThumb(false);
            recognitionRef.current?.abort();
            recognitionRef.current = null;
            generateCaretakerInsight();
          } else {
            setStatus('listening');
            setShowThumb(true);
          }
        } else {
          stopListening();
          setStatus('idle');
          setShowThumb(false);
          recognitionRef.current?.abort();
          recognitionRef.current = null;
        }
        isProcessingResponseRef.current = false;
        ignoreRecognitionResults.current = false;
      }
    },
    [speakResponse]
  );

  const generateCaretakerInsight = useCallback(async () => {
    const endTime = new Date()
    const duration = conversationStartTime.current
      ? Math.round((endTime.getTime() - conversationStartTime.current.getTime()) / 1000)
      : 0

    const hour = endTime.getHours()
    const isTimeNormal = hour >= 6 && hour < 22
    const isDurationNormal = duration < 180 // 3 minutes

    try {
      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: currentTranscript.current }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze emotion')
      }

      const { mood: analyzedMood } = await response.json()
      setMood(analyzedMood)

      let newSenseIndex = 4
      if (!isTimeNormal) newSenseIndex--
      if (analyzedMood !== 'Cheerful') newSenseIndex--
      setSenseIndex(newSenseIndex)

      const insights: InsightsArray = [
        {
          title: 'Time of conversation',
          time: `${endTime.toLocaleTimeString()}`,
          status: isTimeNormal ? 'Normal' : 'Unusual',
        },
        {
          title: 'Duration of conversation',
          time: `${duration} seconds`,
          status: isDurationNormal ? 'Normal' : 'Unusual',
        },
        {
          title: 'Your mood today',
          status: `${analyzedMood}`,
        },
        {
          title: 'Do you need a gentle human interaction today?',
          status: newSenseIndex <= 2 ? 'Most likely yes' : 'No',
        }
      ]

      setCaretakerInsight(insights);

      setHistory(prevHistory => {
        const newHistory = [{ id: Date.now(), duration: duration , timestamp: endTime.toISOString(), rawText: currentTranscript.current, caretakerInsight: insights }, ...prevHistory]
        return newHistory.slice(0, 10)
      })

    } catch (error) {
      console.error('Error analyzing emotion:', error);
      setCaretakerInsight([]);
    }
  }, [conversationStartTime, setSenseIndex]);

  // Function to start speech recognition
  const startSpeechRecognition = useCallback(() => {
    let recognition: SpeechRecognition | any;

    if (recognitionRef.current) {
      recognition = recognitionRef.current;
    } else {
      const SpeechRecognition =
        window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        log.error('SpeechRecognition not supported in this browser.');
        return;
      }
      recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (ignoreRecognitionResults.current) {
          return;
        } 

        console.log('is recognizing voice')

        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          transcript += result[0].transcript;
        }
        transcript = transcript.trim();
        //console.log(`Transcript: "${transcript}"`);
        setRawText(transcript);



        // Reset the speech timeout
        if (speechTimeout) {
          clearTimeout(speechTimeout);
        }
        speechTimeout = setTimeout(() => {
          // No speech detected for 1.5 seconds, consider end of utterance
          if (!isProcessingResponseRef.current && transcript !== '') {
            setStatus('thinking');
            handleChatGPTRequest(transcript);
            // Append to currentTranscript
            currentTranscript.current += `\nUser: ${transcript}\n`;
          }
        }, 1500);
        
      };

      recognition.onend = () => {
        console.log('recognition ONEND called');
        // Reset flags
        isProcessingResponseRef.current = false;
        ignoreRecognitionResults.current = false;
        isRecognizingRef.current = false
        if (isListening) {
          recognition.start();
        }
      };

      recognition.onstart = () => {
        console.log('recognition ONSTART called')
        isRecognizingRef.current = true;
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.log('recognition ONERROR called:', event.error);
        if (isListening) {
          // Restart recognition on error
          recognitionRef.current?.abort();
          recognition = new SpeechRecognition();
          recognitionRef.current = recognition;

          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.start();
        } else {
          terminateListeningAndGenerateInsights();
        }
      };
    }

    //recognition.start();
  }, [isListening, handleChatGPTRequest]);

  // Function to speak the greeting
  const speakGreeting = useCallback(() => {
    const greetings = [
      `Hello${session?.user?.name ? ` ${session.user.name}` : ''}! How are you doing today?`,
      `Hi there${session?.user?.name ? ` ${session.user.name}` : ''}! What's on your mind?`,
      `Good to see you${session?.user?.name ? ` ${session.user.name}` : ''}! How can I help?`,
      `Welcome back${session?.user?.name ? ` ${session.user.name}` : ''}! How are you feeling?`,
      `Hello${session?.user?.name ? ` ${session.user.name}` : ''}! Ready for a chat?`,
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    currentTranscript.current += `AI Assist: ${greeting}\n`;
    // Ignore recognition results while speaking the greeting
    speakResponse(greeting);
    return greeting;
  }, [session, speakResponse]);


  // Function to toggle the conversation
  const toggleConversation = useCallback(() => {
    const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('SpeechRecognition not supported in this browser.');
      alert('Speech recognition is not supported or permissions not given');
      return;
    }

    if (isListening) {
      // User clicked stop
      terminateListeningAndGenerateInsights();
    } else {
      // User clicked start
      setStatus('listening');
      currentTranscript.current = ''; // Reset the transcript for new conversation
      if (!greetOnce) {
        speakGreeting();
        greetOnce = true;
      } else {
        currentTranscript.current += `AI Assist: ${"Let's continue our conversation ..."}\n`;
        speakResponse("Let's continue our conversation ...");
      }
      setRawText('');
      
      setCaretakerInsight([]);
      setShowThumb(false);
      conversationStartTime.current = new Date();
      wordCountRef.current = 0;
      setSenseIndex(4);
      hasReceivedInput.current = false;
      // Start speech recognition
      startListening();
      startSpeechRecognition();
    }
  }, [
    isListening,
    startListening,
    stopListening,
    startSpeechRecognition,
    generateCaretakerInsight,
    speakGreeting,
  ]);

  const terminateListeningAndGenerateInsights = () => {
    setStatus('idle');
    stopListening();
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    // Stop any ongoing speech synthesis
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // Generate caretaker insights using accumulated transcript
    generateCaretakerInsight();
  }
  

  return {
    status,
    rawText,
    setRawText,
    caretakerInsight,
    showThumb,
    senseIndex,
    history,
    toggleConversation,
    wordCountRef,
  };
}