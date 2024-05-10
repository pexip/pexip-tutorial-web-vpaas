import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type Vpaas } from '@pexip/vpaas-sdk'
import { Button, Icon, IconTypes, Tooltip } from '@pexip/components'
import { filterMediaDevices } from '../../filter-media-devices'

import './Toolbar.css'

interface ToolbarProps {
  vpaas: Vpaas
  localStream: MediaStream | undefined
  onLocalStreamChange: (stream: MediaStream | undefined) => void
  // TODO (10) Add presentationStream property to ToolbarProps type
  // TODO (11) Add onPresentationStreamChange property to ToolbarProps type
  onSettingsOpen: () => void
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
      const devices = await navigator.mediaDevices.enumerateDevices()
      const filteredDevices = await filterMediaDevices(devices)
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: filteredDevices.audioInput?.deviceId
        },
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
      const devices = await navigator.mediaDevices.enumerateDevices()
      const filteredDevices = await filterMediaDevices(devices)
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: filteredDevices.audioInput?.deviceId
        }
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

  // TODO (12) Add handlePressShareScreen function

  // TODO (13) Add handleEndShareScreen function

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

      <Tooltip text="Change devices">
        <Button
          variant="translucent"
          modifier="square"
          onClick={props.onSettingsOpen}
        >
          <Icon source={IconTypes.IconSettings} />
        </Button>
      </Tooltip>

      {/* TODO (14) Add share screen button */}

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
