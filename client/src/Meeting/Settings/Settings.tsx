import { useEffect, useState } from 'react'
// TODO (07): Import Select component from the @pexip/components package
import { Bar, Button, Modal } from '@pexip/components'
import { DevicesSelection, Selfview } from '@pexip/media-components'
import { type MediaDeviceInfoLike } from '@pexip/media-control'
import { LocalStorageKey } from '../../types/LocalStorageKey'
import { filterMediaDevices } from '../../filter-media-devices'
// TODO (08): Import RTPStreamId from the './RTPStreamId' file

import './Settings.css'

interface SettingsProps {
  isOpen: boolean
  onCancel: () => void
  onSave: () => void
}

export const Settings = (props: SettingsProps): JSX.Element => {
  const [localStream, setLocalStream] = useState<MediaStream>()

  const [devices, setDevices] = useState<MediaDeviceInfoLike[]>([])

  const [videoInput, setVideoInput] = useState<MediaDeviceInfoLike>()
  const [audioInput, setAudioInput] = useState<MediaDeviceInfoLike>()
  const [audioOutput, setAudioOutput] = useState<MediaDeviceInfoLike>()

  // TODO (09) Define a new state variable named incomingVideoQuality of type RTPStreamId

  const handleCancel = (): void => {
    localStream?.getTracks().forEach((track) => {
      track.stop()
    })
    props.onCancel()
  }

  const handleSave = (): void => {
    localStorage.setItem(
      LocalStorageKey.VideoInputKey,
      videoInput?.deviceId ?? ''
    )
    localStorage.setItem(
      LocalStorageKey.AudioInputKey,
      audioInput?.deviceId ?? ''
    )
    localStorage.setItem(
      LocalStorageKey.AudioOutputKey,
      audioOutput?.deviceId ?? ''
    )
    // TODO (10) Save the incomingVideoQuality state variable to the local storage
    localStream?.getTracks().forEach((track) => {
      track.stop()
    })
    props.onSave()
  }

  const requestVideo = async (): Promise<void> => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    setDevices(devices)

    const filteredDevices = await filterMediaDevices(devices)

    setVideoInput(filteredDevices.videoInput)
    setAudioInput(filteredDevices.audioInput)
    setAudioOutput(filteredDevices.audioOutput)

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: videoInput?.deviceId
      }
    })
    setLocalStream(localStream)
  }

  useEffect(() => {
    if (props.isOpen) {
      requestVideo().catch((e) => {
        console.error(e)
      })

      // TODO (11) Load the incoming video quality from the local storage
      // TODO (12) Set the incomingVideoQuality state variable to the loaded value
    }
  }, [props.isOpen])

  return (
    <Modal isOpen={props.isOpen} className="Settings" onClose={handleCancel}>
      <h3>Settings</h3>

      <Selfview
        isVideoInputMuted={false}
        shouldShowUserAvatar={false}
        username="Video"
        localMediaStream={localStream}
        isMirrored={true}
      />

      <DevicesSelection
        devices={devices}
        videoInputError={{
          title: '',
          description: undefined,
          deniedDevice: undefined
        }}
        audioInputError={{
          title: '',
          description: undefined,
          deniedDevice: undefined
        }}
        videoInput={videoInput}
        audioInput={audioInput}
        audioOutput={audioOutput}
        onVideoInputChange={setVideoInput}
        onAudioInputChange={setAudioInput}
        onAudioOutputChange={setAudioOutput}
        setShowHelpVideo={() => {}}
      />

      {/* TODO (13) Add a Select component to select the incoming video quality */}

      <Bar className="ButtonBar">
        <Button onClick={handleCancel} modifier="fullWidth" variant="tertiary">
          Cancel
        </Button>
        <Button title="Save" onClick={handleSave} modifier="fullWidth">
          Save
        </Button>
      </Bar>
    </Modal>
  )
}
