import { StringChain } from "cypress/types/lodash"

export type ConversationStatus = 'idle' | 'listening' | 'thinking'

export interface HistoryItem {
  id: number
  duration: number
  timestamp: string
  rawText: string
  caretakerInsight: InsightsArray
}

export interface AudioDevice {
  deviceId: string
  kind: MediaDeviceKind
  label: string
}

export interface AudioContextState {
  audioDevices: MediaDeviceInfo[]
  selectedMicrophone: string
  setSelectedMicrophone: (deviceId: string) => void
  selectedSpeaker: string
  setSelectedSpeaker: (deviceId: string) => void
  microphoneVolume: number
  setMicrophoneVolume: (volume: number) => void
  speakerVolume: number
  setSpeakerVolume: (volume: number) => void
  echoCancellation: boolean
  setEchoCancellation: (enabled: boolean) => void
  isAudioSupported: boolean
  permissionStatus: PermissionState | null
  enumerateDevices: () => Promise<void>
}

export interface SpeechRecognitionState {
  isListening: boolean
  startListening: () => void
  stopListening: () => void
  recognitionRef: React.MutableRefObject<any | null>
}

export interface ConversationState {
  status: ConversationStatus
  rawText: string
  setRawText: React.Dispatch<React.SetStateAction<string>>
  caretakerInsight: string[]
  showThumb: boolean
  senseIndex: number
  history: HistoryItem[]
  toggleConversation: () => void
  wordCountRef: React.MutableRefObject<number>
}

// Define a more flexible SpeechRecognition type
export interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((this: ISpeechRecognition, ev: any) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: any) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export interface Insight {
    title: string;
    time?: string; // Optional, since some items do not have a time property
    status: string;
}

export type InsightsArray = Insight[];

// Type guard to check if SpeechRecognition is available
export function isSpeechRecognitionSupported(): boolean {
  return !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));
}

// Helper function to get the appropriate SpeechRecognition constructor
export function getSpeechRecognition(): new () => ISpeechRecognition {
  if (typeof window === 'undefined') {
    throw new Error('SpeechRecognition is not supported in this environment');
  }
  const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionConstructor) {
    throw new Error('SpeechRecognition is not supported in this browser');
  }
  return SpeechRecognitionConstructor as unknown as new () => ISpeechRecognition;
}