import { useState, useEffect, useCallback } from 'react'
import { log } from './logger'

export function useAudioContext() {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('')
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('')
  const [microphoneVolume, setMicrophoneVolume] = useState(1)
  const [speakerVolume, setSpeakerVolume] = useState(1)
  const [echoCancellation, setEchoCancellation] = useState(true)
  const [isAudioSupported, setIsAudioSupported] = useState(true)
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null)

  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioDevices = devices.filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput')
      setAudioDevices(audioDevices)
      
      const defaultMicrophone = audioDevices.find(device => device.kind === 'audioinput')
      const defaultSpeaker = audioDevices.find(device => device.kind === 'audiooutput')
      
      if (defaultMicrophone && !selectedMicrophone) setSelectedMicrophone(defaultMicrophone.deviceId)
      if (defaultSpeaker && !selectedSpeaker) setSelectedSpeaker(defaultSpeaker.deviceId)
      
      log.info('Audio devices enumerated:', audioDevices)
    } catch (err) {
      log.error('Error enumerating audio devices:', err)
      setIsAudioSupported(false)
    }
  }, [selectedMicrophone, selectedSpeaker])

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setPermissionStatus(result.state)
        result.onchange = () => {
          setPermissionStatus(result.state)
          if (result.state === 'granted') {
            enumerateDevices()
          }
        }
      } catch (error) {
        log.error('Error checking microphone permissions:', error)
      }
    }

    checkPermissions()
    enumerateDevices()
  }, [enumerateDevices])

  return {
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
  }
}