import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, ThumbsDown, Smile, Clock, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HistoryItem, Insight } from '../lib/types';
import { SenseAnalysisModal } from './SenseAnalysisModal';
import { configureStatusColor } from '@/lib/utils';
import { useAppSelector } from '@/store/store';

type SenseTabProps = {
  rawText: string
  setRawText: React.Dispatch<React.SetStateAction<string>>
  caretakerInsight: Insight[]
  showThumb: boolean
  senseIndex: number
  history: HistoryItem[]
}

export function SenseTab({
  rawText,
  setRawText,
  caretakerInsight,
  showThumb,
  senseIndex,
  history
}: SenseTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPlaceholder, setShowPlacehoder] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const conversationData = useAppSelector(
    (state) => state.ConversationReducer.conversationData
  );

  const canAnalyze = history.length >= 3;



  const appendMessages = (text:string) => {
    const messages = text.split('\n').filter(msg => msg.trim() !== ''); // Split text into individual messages

    messages.forEach(msg => {
      const colonIndex = msg.indexOf(':');
      if (colonIndex !== -1) {
        const sender = msg.substring(0, colonIndex).trim();
        const message = msg.substring(colonIndex + 1).trim();

        const uniqueMessageId = `${sender}-${message}`;

        
        //if (!document.querySelector(`[data-message-id="${uniqueMessageId}"]`)) {
          const messageElem = document.createElement('div');
          messageElem.setAttribute('data-message-id', uniqueMessageId); // Set the unique ID
          const senderSpan = document.createElement('span');
          const messageContent = document.createElement('span');
          senderSpan.textContent = sender;
          messageContent.textContent = message;

          if (sender === 'User') {
            messageElem.className = "message flex my-5 user-message justify-end gap-2";
            senderSpan.className = "message-sender order-2 bg-chatbox-user w-14 h-14 rounded-full text-transparent bg-user bg-center bg-no-repeat bg-[length:100px_36px]";
            messageContent.className = "message-content w-72 bg-chatbox-user rounded-2xl rounded-tr-none w-72 px-8 py-2.5";
          } else if (sender === 'AI Assist') {
            messageElem.className = "message flex my-5 ai-message gap-2";
            senderSpan.className = "message-sender bg-chatbox-agent w-14 h-14 rounded-full text-transparent bg-agent bg-center bg-no-repeat bg-[length:100px_36px]";
            messageContent.className = "message-content bg-chatbox-agent rounded-2xl rounded-tl-none w-72 px-8 py-4";
          }

          messageElem.appendChild(senderSpan);
          messageElem.appendChild(messageContent);
          setShowPlacehoder(false);
          if(chatContainerRef.current) {
            chatContainerRef.current.appendChild(messageElem);
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        //}
      }
    });
  }

  useEffect(() => {
    if(rawText.trim() !== '') {
      appendMessages(rawText)
    }
  }, [rawText])

  useEffect(() => {
    if(conversationData && conversationData.length) {
      console.log('CONVERSATION DATA:', conversationData)
      conversationData.map((item:string) => {
        if(item) {
          appendMessages(item)
        }
      })
    }
  }, [])

  return (
    <div className="space-y-4 mt-8">

      <div className="hidden">
        <Label htmlFor="rawText" className="text-sm font-medium">
          Raw Text
        </Label>
        <Textarea
          id="rawText"
          placeholder="Your conversation will appear here..."
          value={rawText}
          readOnly
          className="h-32 resize-none"
        />
      </div>
      <div className="border border-secondary rounded-md p-4">
        <p className={`text-primary-foreground ${showPlaceholder ? "" : "hidden"}`}>Your conversation will appear here...</p>
        <div className="text-black h-80 overflow-hidden">
          <div className="overflow-y-auto h-full" id="chat-container" ref={chatContainerRef}>
          </div>
        </div>
      </div>
      {rawText === "" && (!caretakerInsight || caretakerInsight.length === 0) && (
        <div className="text-center text-gray-500 mt-4">
          <MessageSquare className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm">No conversation data yet. Start talking!</p>
        </div>
      )}
      {showThumb && (
        <motion.div
          className="flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {senseIndex >= 3 ? (
            <ThumbsUp className="w-6 h-6 text-emerald-400" />
          ) : (
            <ThumbsDown className="w-6 h-6 text-red-400" />
          )}
        </motion.div>
      )}
      {caretakerInsight && caretakerInsight.length > 0 &&
        <div>
          <Label htmlFor="caretakerInsight" className="font-semibold text-accent">
            Caretaker Insight
          </Label>
          <div className="bg-white overflow-y-auto flex flex-wrap gap-3 py-4">
            {caretakerInsight.map((insight, index) => (
              <div key={index} className="rounded-md p-4 bg-slate-100 shadow-md w-[48%] sm:w-[23.4%] relative">
                <div className="flex justify-center h-[50px] w-[50px] bg-primary mx-auto mb-2 rounded-full items-center">
                  {insight.title.toLowerCase().includes('time') && <Clock size="25" className="text-white" />}
                  {insight.title.toLowerCase().includes('duration') && <Timer size="25" className="text-white" />}
                  {insight.title.toLowerCase().includes('mood') && <Smile size="25" className="text-white" />}
                  {insight.title.toLowerCase().includes('interaction') && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-users-round text-white"
                    >
                      <path d="M18 21a8 8 0 0 0-16 0" />
                      <circle cx="10" cy="8" r="5" />
                      <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
                    </svg>
                  )}
                </div>
                <h4 className="text-sm text-primary-foreground">{insight.title}</h4>
                {insight?.time && <p className="font-semibold text-primary-foreground py-2.5">{insight.time}</p>}
                <p className={`text-[#769aba] text-base pt-2.5 font-bold ${configureStatusColor(insight.status)}`}>
                  {insight.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      }
      {history && history.length > 0 && (
        <div>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant={canAnalyze ? "default" : "disabled"}
              size="sm"
              className={`text-xs ${canAnalyze ? "bg-blue-500 hover:bg-blue-600" : ""}`}
              disabled={!canAnalyze}
              onClick={() => {
                router.push('/history')
              }}
            >
              View History
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant={canAnalyze ? "default" : "disabled"}
              size="sm"
              className={`text-xs ${canAnalyze ? "bg-blue-500 hover:bg-blue-600" : ""}`}
              disabled={!canAnalyze}
            >
              Insights
            </Button>
          </div>
        </div>
      )}
      <SenseAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        history={history}
      />
    </div>
  )
}