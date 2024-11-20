'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAudioContext } from '@/lib/useAudioContext'
import { useSpeechRecognition } from '@/lib/useSpeechRecognition'
import { useConversation } from '@/lib/useConversation'
import { AudioSettingsDialog } from '@/components/AudioSettingsDialog'
import Header from '@/components/Header';
import AuthWrapper from '@/components/AuthWrapper';

import { Footer } from '@/components/Footer';

import { HistoryDialog } from '@/components/HistoryDialog'
import { HistoryItem } from '@/lib/types'
import { useAnalytics } from '@/lib/useAnalytics'
import { useAppSelector } from '@/store/store';
import { formatDate } from '@/lib/utils';

export default function SeniorSenseDemo() {
  const [activeTab, setActiveTab] = useState('conversation')
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<HistoryItem | null>(null)
  const [contentHeight, setContentHeight] = useState('auto');
  const [sortedHistoryData, setSortedHistoryData] = useState<any>(null)
  const conversationRef = useRef<HTMLDivElement>(null)
  const senseRef = useRef<HTMLDivElement>(null)
  const { data: session, status } = useSession()
  const router = useRouter()
  const { trackEvent } = useAnalytics();
  const historyData = useAppSelector(
    (state) => state.HistoryReducer.history
  );

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
    if (status === 'authenticated') {
      trackEvent('user_login', { email: session?.user?.email })
    }
  }, [status, session, trackEvent])

  useEffect(() => {
    console.log('history:', historyData)
    if(historyData && historyData.length > 0) {
      const sortedData = [...historyData].sort((a, b) => {
        const dateA = typeof a.timestamp === 'string' ? new Date(a.timestamp) : new Date(0);
        const dateB = typeof b.timestamp === 'string' ? new Date(b.timestamp) : new Date(0);
        
        return dateB.getTime() - dateA.getTime(); // Sorting in descending order
      });
      setSortedHistoryData(sortedData)
    }
  }, [historyData])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    const updateHeight = () => {
      const activeRef = activeTab === 'conversation' ? conversationRef : senseRef
      if (activeRef.current) {
        const height = activeRef.current.scrollHeight
        setContentHeight(`${height}px`)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)

    return () => window.removeEventListener('resize', updateHeight)
  }, [activeTab, rawText, caretakerInsight, history])

  const flipVariants = {
    enter: (direction: number) => {
      return {
        rotateY: direction > 0 ? 90 : -90,
        opacity: 0
      }
    },
    center: {
      rotateY: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        rotateY: direction < 0 ? 90 : -90,
        opacity: 0
      }
    }
  }

  const [[page, direction], setPage] = useState([0, 0])

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection])
  }

  useEffect(() => {
    paginate(activeTab === 'conversation' ? -1 : 1)
  }, [activeTab])

  const handleSignOut = async () => {
    trackEvent('user_logout', { email: session?.user?.email })
    await signOut({ callbackUrl: '/' })
  }

  const handleHome = () => {
    router.push('/senior-sense-demo');
  }

  const handleAudioSettingsOpenChange = (isOpen: boolean) => {
    setIsAudioSettingsOpen(isOpen)
    trackEvent('audio_settings_dialog', { action: isOpen ? 'open' : 'close' })
  }

  const handleSelectedConversationChange = (conversation: HistoryItem | null) => {
    setSelectedConversation(conversation)
    if (conversation) {
      trackEvent('view_conversation_history', { conversationId: conversation.id })
    } else {
      trackEvent('close_conversation_history')
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }



  return (
    <AuthWrapper>
    <div className="h-full flex flex-col">
      <div className="w-full h-screen overflow-hidden absolute left-0 top-0 z-[2] pointer-events-none">
        <div className="border-0 bg-[url('/background.svg')] bg-center bg-no-repeat bg-cover w-full h-1/2 absolute left-0 top-0 z-[1] max-h-[400px]"></div>
        <div className="absolute left-1/2 top-[270px] w-[670px] lg:w-3/5 lg:min-w-[907px] aspect-square rounded-full bg-white z-[2] -translate-x-1/2"></div>
      </div>
      <Card className="w-full flex-1 border-0 relative z-[3] bg-transparent shadow-none flex flex-col">
        <Header />
        <CardContent className="py-12 max-w-[614px] lg:w-3/5 w-full mx-auto min-h-[500px] flex-1">
          <h1 className="font-semibold text-primary-foreground text-center text-2xl">History</h1>
          <div className="pt-24">
           
            {sortedHistoryData && sortedHistoryData.length > 0 ? (
                <ul className="flex flex-wrap gap-4">
                  {sortedHistoryData.map((item:any, index:number) => (
                    <li key={`history-${index}`}>
                      <Button
                        variant="tertiary"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setSelectedConversation(item)}
                      >
                        {index === 0 ? 'Recent' : `${formatDate(item.timestamp)} (${index})`}

                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No history available</p>
              )}
            
          </div>
        </CardContent>
      </Card>
      <Footer/>
      <HistoryDialog
        selectedConversation={selectedConversation}
        setSelectedConversation={handleSelectedConversationChange}
      />
    </div>
    </AuthWrapper>
  )
}