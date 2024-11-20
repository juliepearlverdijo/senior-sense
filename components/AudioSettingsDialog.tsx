import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { RefreshCw } from 'lucide-react'

type AudioSettingsDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
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
  enumerateDevices: () => Promise<void>
}

export function AudioSettingsDialog({
  isOpen,
  onOpenChange,
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
  enumerateDevices,
}: AudioSettingsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white text-gray-900" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-accent">Audio Settings</DialogTitle>
          <DialogDescription className="text-gray-600">
            Configure your microphone and speaker settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="microphone" className="text-gray-700">Microphone</Label>
            <Button
              variant="outline"
              size="icon"
              onClick={enumerateDevices}
              title="Refresh device list"
              className="text-gray-700 hover:text-primary border-gray-300 hover:bg-white hover:border-primary"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Select
            value={selectedMicrophone}
            onValueChange={setSelectedMicrophone}
          >
            <SelectTrigger id="microphone" className="border-gray-300 text-gray-900">
              <SelectValue placeholder="Select microphone" />
            </SelectTrigger>
            <SelectContent>
              {audioDevices
                .filter(device => device.kind === 'audioinput')
                .map(device => (
                  <SelectItem key={device.deviceId} value={device.deviceId} className="text-gray-900">
                    {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div>
            <Label htmlFor="micVolume" className="text-gray-700">Microphone Volume</Label>
            <Slider
              id="micVolume"
              min={0}
              max={1}
              step={0.1}
              value={[microphoneVolume]}
              onValueChange={([value]) => setMicrophoneVolume(value)}
              className="mt-2"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="echoCancellation"
              checked={echoCancellation}
              onCheckedChange={setEchoCancellation}
            />
            <Label htmlFor="echoCancellation" className="text-gray-700">Echo Cancellation</Label>
          </div>
          <div>
            <Label htmlFor="speaker" className="text-gray-700">Speaker</Label>
            <Select
              value={selectedSpeaker}
              onValueChange={setSelectedSpeaker}
            >
              <SelectTrigger id="speaker" className="border-gray-300 text-gray-900">
                <SelectValue placeholder="Select speaker" />
              </SelectTrigger>
              <SelectContent>
                {audioDevices
                  .filter(device => device.kind === 'audiooutput')
                  .map(device => (
                    <SelectItem key={device.deviceId} value={device.deviceId} className="text-gray-900">
                      {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="speakerVolume" className="text-gray-700">Speaker Volume</Label>
            <Slider
              id="speakerVolume"
              min={0}
              max={1}
              step={0.1}
              value={[speakerVolume]}
              onValueChange={([value]) => setSpeakerVolume(value)}
              className="mt-2"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}