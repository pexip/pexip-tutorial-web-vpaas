import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  createVpaas,
  createVpaasSignals,
  createRecvTransceivers,
  type Vpaas,
  type RosterEntry
} from '@pexip/vpaas-sdk'
// TODO (14) Import MediaEncodingParameters type from '@pexip/peer-connection' package
import type { MediaInit, TransceiverConfig } from '@pexip/peer-connection'
import { type Participant } from '@pexip/vpaas-api'
import { type StreamInfo } from '../types/StreamInfo'
import { config } from '../config'
import { RemoteParticipants } from './RemoteParticipants/RemoteParticipants'
import { Selfview } from '@pexip/media-components'
import { Toolbar } from './Toolbar/Toolbar'
import { filterMediaDevices } from '../filter-media-devices'
import { Settings } from './Settings/Settings'
// TODO (15) Import RTPStreamId from the './RTPStreamId' file
// TODO (16) Import LocalStorageKey from the './LocalStorageKey' file

import './Meeting.css'

const RECV_AUDIO_COUNT = 9
const RECV_VIDEO_COUNT = 9

let vpaas: Vpaas

export const Meeting = (): JSX.Element => {
  const { meetingId } = useParams()

  const [participant, setParticipant] = useState<Participant>()
  const [localStream, setLocalStream] = useState<MediaStream>()
  const [sinkId, setSinkId] = useState<string>('')

  const [remoteTransceiversConfig, setRemoteTransceiversConfig] = useState<
    TransceiverConfig[]
  >([])
  const [roster, setRoster] = useState<Record<string, RosterEntry>>()
  const [streamsInfo, setStreamsInfo] = useState<StreamInfo[]>([])

  const [settingsOpen, setSettingOpen] = useState(false)

  const initVpaas = (): Vpaas => {
    const vpaasSignals = createVpaasSignals()
    vpaasSignals.onRosterUpdate.add(handleRosterUpdate)
    vpaasSignals.onRemoteStreams.add(handleRemoteStreams)

    return createVpaas({ vpaasSignals, config: {} })
  }

  const handleRosterUpdate = (roster: Record<string, RosterEntry>): void => {
    setRoster(roster)

    // Check if we have a new stream
    const activeStreamsIds: string[] = []
    for (const [participantId, rosterEntry] of Object.entries(roster)) {
      for (const [streamId, stream] of Object.entries(rosterEntry.streams)) {
        activeStreamsIds.push(streamId)
        const found = streamsInfo.some(
          (streamInfo) => streamInfo.streamId === streamId
        )
        if (!found) {
          // TODO (17) Get the layers from the stream object

          // TODO (18) Add the layers property to the streamInfo object
          streamsInfo.push({
            streamId,
            type: stream.type,
            participantId
          })
        }
      }
    }

    // Check if we should disconnect old streams
    streamsInfo.forEach((streamInfo) => {
      const found = activeStreamsIds.includes(streamInfo.streamId)
      if (!found) {
        // Disconnect stream
        unsubscribeStream(streamInfo).catch((e) => {
          console.error(e)
        })
        const index = streamsInfo.findIndex(
          (stream) => stream.streamId === streamInfo.streamId
        )
        streamsInfo.splice(index, 1)
      }
      return found
    })

    setStreamsInfo([...streamsInfo])
  }

  const handleRemoteStreams = (config: TransceiverConfig): void => {
    const index = remoteTransceiversConfig.findIndex((transceiverConfig) => {
      return transceiverConfig.transceiver?.mid !== config.transceiver?.mid
    })
    if (index > 0) {
      remoteTransceiversConfig[index] = config
    } else {
      remoteTransceiversConfig.push(config)
    }
    setRemoteTransceiversConfig([...remoteTransceiversConfig])
  }

  // TODO (19) Add preferredRid parameter to the subscribeStream function
  const subscribeStream = async (streamInfo: StreamInfo): Promise<void> => {
    // TODO (20) Get the requestedRid from the streamInfo object

    const response = await vpaas.requestStream({
      producer_id: streamInfo.participantId,
      stream_id: streamInfo.streamId,
      // TODO (21) Pass the requestedRid to the requestStream function
      rid: null,
      receive_mid: null
    })

    streamInfo.mid = response.receive_mid
    // TODO (22) Set the rid property of the streamInfo object to the requestedRid
    setStreamsInfo([...streamsInfo])
  }

  const unsubscribeStream = async (streamInfo: StreamInfo): Promise<void> => {
    const mid = streamInfo.mid
    if (mid != null) {
      await vpaas.disconnectStream({
        receive_mid: mid
      })
    }
    streamInfo.mid = undefined
    setStreamsInfo([...streamsInfo])
  }

  const getApiAddress = async (): Promise<string> => {
    const response = await fetch(`${config.server}/api-address`)
    const url = await response.text()
    return url
  }

  const createParticipant = async (): Promise<Participant> => {
    const response = await fetch(
      `${config.server}/meetings/${meetingId}/participants`,
      {
        method: 'POST'
      }
    )
    const participant = await response.json()
    return participant
  }

  const connectMeeting = async (
    apiAddress: string,
    participant: Participant,
    mediaStream: MediaStream
  ): Promise<void> => {
    if (meetingId == null) {
      throw new Error('meetingId not defined')
    }

    const mediaInits: MediaInit[] = [
      {
        content: 'main',
        direction: 'sendonly',
        kindOrTrack: mediaStream.getAudioTracks()[0],
        streams: [mediaStream]
      },
      {
        content: 'main',
        direction: 'sendonly',
        kindOrTrack: mediaStream.getVideoTracks()[0],
        streams: [mediaStream]
        // TODO (23) Add sendEncodings property to the video MediaInit object
      },
      ...createRecvTransceivers('audio', RECV_AUDIO_COUNT),
      ...createRecvTransceivers('video', RECV_VIDEO_COUNT)
    ]

    await vpaas.joinMeeting({
      meetingId,
      participantId: participant.id,
      participantSecret: participant.participant_secret,
      apiAddress
    })

    vpaas.connect({ mediaInits })
  }

  // TODO (24) Add getEncodings function

  const isStreamActive = (stream: MediaStream | undefined): boolean => {
    return (
      stream?.getVideoTracks().some((track) => track.readyState === 'live') ??
      false
    )
  }

  const isAnyTrackActive = (
    tracks: MediaStreamTrack[] | undefined
  ): boolean => {
    return tracks?.some((track) => track.readyState === 'live') ?? false
  }

  const getNewLocalStream = async (
    requestAudio: boolean,
    requestVideo: boolean
  ): Promise<MediaStream> => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const filteredDevices = await filterMediaDevices(devices)

    setSinkId(filteredDevices.audioOutput?.deviceId ?? '')

    const newLocalStream = await navigator.mediaDevices.getUserMedia({
      audio: requestAudio
        ? {
            deviceId: filteredDevices.audioInput?.deviceId
          }
        : false,
      video: requestVideo
        ? {
            deviceId: filteredDevices.videoInput?.deviceId
          }
        : false
    })
    return newLocalStream
  }

  const handleSaveSettings = async (): Promise<void> => {
    setSettingOpen(false)

    const audioActive = isAnyTrackActive(localStream?.getAudioTracks())
    const videoActive = isAnyTrackActive(localStream?.getVideoTracks())

    if (audioActive || videoActive) {
      const newLocalStream = await getNewLocalStream(audioActive, videoActive)

      localStream?.getTracks().forEach((track) => {
        track.stop()
      })

      setLocalStream(newLocalStream)
      vpaas.setStream(newLocalStream)

      // TODO (25) For each streamInfo object, check if it's a video stream
      // TODO (26) If it's a video stream, get the preferredRid from the local storage
      // TODO (27) If the streamInfo object has a different rid property, unsubscribe to it and subscribe it again
    }
  }

  useEffect(() => {
    const bootstrap = async (): Promise<void> => {
      if (vpaas == null) {
        vpaas = initVpaas()
      }

      const participant = await createParticipant()

      const audioActive = true
      const videoActive = true

      const localStream = await getNewLocalStream(audioActive, videoActive)

      setParticipant(participant)
      setLocalStream(localStream)

      const apiAddress = await getApiAddress()
      await connectMeeting(apiAddress, participant, localStream)
    }
    bootstrap().catch((e) => {
      console.error(e)
    })
    return () => {
      vpaas.disconnect()
    }
  }, [])

  useEffect(() => {
    // Check if it's connected (we received all the transceivers)
    if (
      remoteTransceiversConfig.length ===
      RECV_AUDIO_COUNT + RECV_VIDEO_COUNT
    ) {
      streamsInfo.forEach((streamInfo) => {
        if (
          streamInfo.mid == null &&
          streamInfo.participantId !== participant?.id
        ) {
          // TODO (28) Get the preferredRid from the local storage
          // TODO (29) Add the preferredRid to the subscribeStream function
          subscribeStream(streamInfo).catch((e) => {
            console.error(e)
          })
        }
      })
    }
  }, [streamsInfo, remoteTransceiversConfig])

  let remoteParticipantsIds: string[] = []
  if (roster != null) {
    remoteParticipantsIds = Object.keys(roster)
    remoteParticipantsIds = remoteParticipantsIds.filter(
      (id) => id !== participant?.id
    )
  }

  const videoTracks = localStream?.getVideoTracks()
  const videoTrackId =
    videoTracks != null && videoTracks.length !== 0 ? videoTracks[0].id : ''

  // Only re-render the selfie if the videoTrack id changes
  const selfie = useMemo(
    (): JSX.Element => (
      <Selfview
        className="SelfView"
        isVideoInputMuted={false}
        shouldShowUserAvatar={false}
        username="User"
        localMediaStream={localStream}
      />
    ),
    [videoTrackId]
  )

  return (
    <div className="Meeting">
      {remoteParticipantsIds.length > 0 && (
        <RemoteParticipants
          remoteParticipantsIds={remoteParticipantsIds}
          streamsInfo={streamsInfo}
          remoteTransceiversConfig={remoteTransceiversConfig}
          sinkId={sinkId}
        />
      )}

      {remoteParticipantsIds.length === 0 && (
        <h2 className="NoParticipants">Waiting for other participants...</h2>
      )}

      <div className="PipContainer">
        {isStreamActive(localStream) && selfie}
      </div>

      <Settings
        isOpen={settingsOpen}
        onCancel={() => {
          setSettingOpen(false)
        }}
        onSave={() => {
          handleSaveSettings().catch((e) => {
            console.error(e)
          })
        }}
      />

      {vpaas != null && (
        <Toolbar
          vpaas={vpaas}
          localStream={localStream}
          onLocalStreamChange={setLocalStream}
          onSettingsOpen={() => {
            setSettingOpen(true)
          }}
        />
      )}
    </div>
  )
}
