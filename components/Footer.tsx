'use client'

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '../lib/useAnalytics';
import { Settings, FileStack } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAudioContext } from '@/lib/useAudioContext';
import { AudioSettingsDialog } from './AudioSettingsDialog'


type SettingsProps = {
  setIsAudioSettingsOpen: (open: boolean) => void;
};

export function Footer() {
	const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false)
	const { trackEvent } = useAnalytics();
	const router = useRouter();

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

  const handleAudioSettingsOpenChange = (isOpen: boolean) => {
    setIsAudioSettingsOpen(isOpen)
    trackEvent('audio_settings_dialog', { action: isOpen ? 'open' : 'close' })
  }

	return (
		<>
		<footer className="max-w-[584px] lg:w-3/5 w-full mx-auto py-4 relative z-[3]">
			<div className="flex justify-end w-full gap-x-2">
				<button 
					className="text-gray-400"
					onClick={() => {
	        	router.push('/history')
	        }}
	      >
	      	<FileStack className="w-6 h-6 mr-2" />
	      </button>
				<button 
					className="text-gray-400"
					onClick={() => {
	        	router.push('/insights')
	        }}
	      >
	        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-no-axes-column-increasing"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
	      </button>
				<button 
					className="text-gray-400"
	        onClick={() => {
	        	setIsAudioSettingsOpen(true)
	          trackEvent('open_audio_settings')
	        }}
	      >
	        <Settings className="w-6 h-6 mr-2" />
	      </button>
			</div>
		</footer>
		<AudioSettingsDialog
      isOpen={isAudioSettingsOpen}
      onOpenChange={handleAudioSettingsOpenChange}
      audioDevices={audioDevices}
      selectedMicrophone={selectedMicrophone}
      setSelectedMicrophone={setSelectedMicrophone}
      selectedSpeaker={selectedSpeaker}
      setSelectedSpeaker={setSelectedSpeaker}
      microphoneVolume={microphoneVolume}
      setMicrophoneVolume={setMicrophoneVolume}
      speakerVolume={speakerVolume}
      setSpeakerVolume={setSpeakerVolume}
      echoCancellation={echoCancellation}
      setEchoCancellation={setEchoCancellation}
      enumerateDevices={enumerateDevices}
    />
		</>
	)
}