import { useState, useEffect, useRef } from 'react'
import { log } from '../lib/logger'
import { isSpeechRecognitionSupported, getSpeechRecognition, ISpeechRecognition } from '../lib/types'

let speechError=false

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<ISpeechRecognition | null>(null)

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start()
      setIsListening(true)
    } else {
      const SpeechRecognition = getSpeechRecognition()
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  return {
    isListening,
    startListening,
    stopListening,
    recognitionRef,
  }
}