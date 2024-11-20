import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, Settings, Square } from 'lucide-react';
import { ConversationStatus } from '../lib/types';
import { log } from '../lib/logger';
import { useAnalytics } from '../lib/useAnalytics'

type ConversationTabProps = {
  isListening: boolean;
  toggleConversation: () => void;
  status: ConversationStatus;
  isAudioSupported: boolean;
  permissionStatus: PermissionState | null;
};

export function ConversationTab({
  isListening,
  toggleConversation,
  status,
  isAudioSupported,
  permissionStatus,
}: ConversationTabProps) {
  const { trackEvent } = useAnalytics()

  const handleToggleConversation = () => {
    toggleConversation()
    trackEvent('toggle_conversation', { action: isListening ? 'stop' : 'start' })
  }
  
  useEffect(() => {
    // Request microphone permission when the component mounts
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => log.info('Microphone permission granted'))
        .catch((err) => log.error('Error getting microphone permission:', err));
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <motion.div
        className="bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg p-4"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={handleToggleConversation}
          className={`w-24 h-24 rounded-full transition-colors duration-300 border-4 border-white flex justify-center items-center ${
            isListening
              ? 'bg-primary'
              : status === 'thinking'
              ? 'bg-primary'
              : 'bg-none bg-[#A2BCD3]'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
          disabled={!isAudioSupported || permissionStatus === 'denied'}
        >
          {isListening ? (
            <Square className="w-12 h-12 text-white" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </button>
      </motion.div>
      <motion.div
        className="text-center text-lg font-semibold text-primary-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {status === 'idle' && 'Click to chat ...'}
        {status === 'listening' && 'Listening...'}
        {status === 'thinking' && 'Speaking...'}
      </motion.div>
    </div>
  );
}