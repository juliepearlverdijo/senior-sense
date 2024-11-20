'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setHistory } from "@/store/features/history-slice";
import { emptyConversationData, setConversationData } from "@/store/features/conversation-slice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Header from './Header';
import { useAudioContext } from '../lib/useAudioContext'
import { useSpeechRecognition } from '../lib/useSpeechRecognition'
import { useConversation } from '../lib/useConversation'
import { ConversationTab } from './ConversationTab'
import { Footer } from './Footer';
import { SenseTab } from './SenseTab'
import { HistoryDialog } from './HistoryDialog'
import { HistoryItem } from '../lib/types'
import { useAnalytics } from '../lib/useAnalytics'

export default function SeniorSenseDemo() {
  const [activeTab, setActiveTab] = useState('conversation')
  const conversationRef = useRef<HTMLDivElement>(null)
  const senseRef = useRef<HTMLDivElement>(null)
  const { data: session, status } = useSession()
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { trackEvent } = useAnalytics()

  const {
    audioDevices,
    selectedMicrophone,
    setSelectedMicrophone,
    selectedSpeaker,
    setSelectedSpeaker,
    microphoneVolume,
    setMicrophoneVolume,
    speakerVolume,
    setSpeakerVolume,
    echoCancellation,
    setEchoCancellation,
    isAudioSupported,
    permissionStatus,
    enumerateDevices,
  } = useAudioContext()

  const {
    isListening,
    startListening,
    stopListening,
  } = useSpeechRecognition()

  const {
    status: conversationStatus,
    rawText,
    setRawText,
    caretakerInsight,
    showThumb,
    senseIndex,
    history,
    toggleConversation,
  } = useConversation(isListening, startListening, stopListening)

  useEffect(() => {
    dispatch(setHistory(history))
  }, [history])

  useEffect(() => {
    if(caretakerInsight.length > 0) {
      console.log(rawText)
      dispatch(setConversationData(rawText))
    }
  }, [caretakerInsight])

  const [[page, direction], setPage] = useState([0, 0])

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection])
  }

  useEffect(() => {
    paginate(activeTab === 'conversation' ? -1 : 1)
  }, [activeTab])

  return (
    <div className="h-full flex flex-col">
      <div className="w-full h-screen overflow-hidden absolute left-0 top-0 z-[2] pointer-events-none">
        <div className="border-0 bg-[url('/background.svg')] bg-center bg-no-repeat bg-cover w-full h-1/2 absolute left-0 top-0 z-[1] max-h-[400px]"></div>
        <div className="absolute left-1/2 top-[270px] w-[670px] lg:w-3/5 lg:min-w-[907px] aspect-square rounded-full bg-white z-[2] -translate-x-1/2"></div>
      </div>
      <Card className="w-full flex-1 border-0 relative z-[3] bg-transparent shadow-none flex flex-col">
        <Header />
        <CardContent className="py-12 max-w-[614px] lg:w-3/5 w-full mx-auto flex-1">
          <div ref={conversationRef}>
            <ConversationTab
              isListening={isListening}
              toggleConversation={toggleConversation}
              status={conversationStatus}
              isAudioSupported={isAudioSupported}
              permissionStatus={permissionStatus}
            />
          </div>
          <div ref={senseRef}>
              <SenseTab
                rawText={rawText}
                setRawText={setRawText}
                caretakerInsight={caretakerInsight}
                showThumb={showThumb}
                senseIndex={senseIndex}
                history={history}
              />
          </div>
          
        </CardContent>
      </Card>
      <Footer />
      
      {/*<HistoryDialog
        selectedConversation={selectedConversation}
        setSelectedConversation={handleSelectedConversationChange}
      />*/}
    </div>
  )
}