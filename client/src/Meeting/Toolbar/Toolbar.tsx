import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type Vpaas } from '@pexip/vpaas-sdk'
import { Button, Icon, IconTypes, Tooltip } from '@pexip/components'
// TODO (43) Import filterMediaDevices function from filter-media-devices.ts

import './Toolbar.css'

interface ToolbarProps {
  vpaas: Vpaas
  localStream: MediaStream | undefined
  onLocalStreamChange: (stream: MediaStream | undefined) => void
  // TODO (44) Add onSettingsOpen property with void return type
}

export const Toolbar = (props: ToolbarProps): JSX.Element => {
  const navigate = useNavigate()

  const [audioMuted, setAudioMuted] = useState(false)
  const [videoMuted, setVideoMuted] = useState(false)

  const handlePressMuteAudio = async (): Promise<void> => {
    if (!audioMuted) {
      props.localStream?.getAudioTracks().forEach((track) => {
        track.stop()
      })
    } else {
      // TODO (45) Get devices using navigator.mediaDevices.enumerateDevices
      // TODO (46) Filter devices using filterMediaDevices function
      // TODO (47) Get newStream using navigator.mediaDevices.getUserMedia with audio deviceId
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      })
      if (!videoMuted) {
        const audioTrack = props.localStream?.getVideoTracks()[0]
        if (audioTrack != null) {
          newStream.addTrack(audioTrack)
        }
      }
      props.vpaas.setStream(newStream)
      props.onLocalStreamChange(newStream)
    }
    setAudioMuted(!audioMuted)
  }

  const handlePressMuteVideo = async (): Promise<void> => {
    if (!videoMuted) {
      props.localStream?.getVideoTracks().forEach((track) => {
        track.stop()
      })
      const clonedStream = props.localStream?.clone()
      props.localStream?.getAudioTracks().forEach((track) => {
        track.stop()
      })
      props.onLocalStreamChange(clonedStream)
    } else {
      // TODO (45) Get devices using navigator.mediaDevices.enumerateDevices
      // TODO (46) Filter devices using filterMediaDevices function
      // TODO (47) Get newStream using navigator.mediaDevices.getUserMedia with video deviceId
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
      })
      if (!audioMuted) {
        const audioTrack = props.localStream?.getAudioTracks()[0]
        if (audioTrack != null) {
          newStream.addTrack(audioTrack)
        }
      }
      props.onLocalStreamChange(newStream)
      props.vpaas.setStream(newStream)
    }
    setVideoMuted(!videoMuted)
  }

  const handlePressDisconnect = (): void => {
    props.localStream?.getTracks().forEach((track) => {
      track.stop()
    })
    props.vpaas.disconnect()
    navigate('/meetings')
  }

  return (
    <div className="Toolbar">
      <Tooltip text={`${audioMuted ? 'Unmute' : 'Mute'} audio`}>
        <Button
          variant="translucent"
          modifier="square"
          onClick={() => {
            handlePressMuteAudio().catch((e) => {
              console.error(e)
            })
          }}
          isActive={audioMuted}
        >
          <Icon
            source={
              audioMuted
                ? IconTypes.IconMicrophoneOff
                : IconTypes.IconMicrophoneOn
            }
          />
        </Button>
      </Tooltip>

      <Tooltip text={`${videoMuted ? 'Unmute' : 'Mute'} video`}>
        <Button
          variant="translucent"
          modifier="square"
          onClick={() => {
            handlePressMuteVideo().catch((e) => {
              console.error(e)
            })
          }}
          isActive={videoMuted}
        >
          <Icon
            source={videoMuted ? IconTypes.IconVideoOff : IconTypes.IconVideoOn}
          />
        </Button>
      </Tooltip>

      {/* TODO (48) Add Button component to display the settings */}

      <Tooltip text="Disconnect">
        <Button
          variant="danger"
          modifier="square"
          onClick={handlePressDisconnect}
        >
          <Icon source={IconTypes.IconLeave} />
        </Button>
      </Tooltip>
    </div>
  )
}
