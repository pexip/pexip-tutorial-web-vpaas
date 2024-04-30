import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  createVpaas,
  createVpaasSignals,
  createRecvTransceivers,
  type Vpaas,
  type RosterEntry
} from '@pexip/vpaas-sdk'
import type { MediaInit, TransceiverConfig } from '@pexip/peer-connection'
import { type Participant } from '@pexip/vpaas-api'
import { type StreamInfo } from '../types/StreamInfo'
import { config } from '../config'
import { RemoteParticipants } from './RemoteParticipants/RemoteParticipants'
import { Selfview } from '@pexip/media-components'
import { Toolbar } from './Toolbar/Toolbar'

import './Meeting.css'

const RECV_AUDIO_COUNT = 9
const RECV_VIDEO_COUNT = 9

let vpaas: Vpaas

export const Meeting = (): JSX.Element => {
  const { meetingId } = useParams()

  const [participant, setParticipant] = useState<Participant>()
  const [localStream, setLocalStream] = useState<MediaStream>()

  const [remoteTransceiversConfig, setRemoteTransceiversConfig] = useState<
    TransceiverConfig[]
  >([])
  const [roster, setRoster] = useState<Record<string, RosterEntry>>()
  const [streamsInfo, setStreamsInfo] = useState<StreamInfo[]>([])

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

  const subscribeStream = async (streamInfo: StreamInfo): Promise<void> => {
    const response = await vpaas.requestStream({
      producer_id: streamInfo.participantId,
      stream_id: streamInfo.streamId,
      rid: null,
      receive_mid: null
    })

    streamInfo.mid = response.receive_mid
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

  const isStreamActive = (stream: MediaStream | undefined): boolean => {
    return (
      stream?.getVideoTracks().some((track) => track.readyState === 'live') ??
      false
    )
  }

  useEffect(() => {
    const bootstrap = async (): Promise<void> => {
      if (vpaas == null) {
        vpaas = initVpaas()
      }

      const participant = await createParticipant()

      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })

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
        />
      )}

      {remoteParticipantsIds.length === 0 && (
        <h2 className="NoParticipants">Waiting for other participants...</h2>
      )}

      <div className="PipContainer">
        {isStreamActive(localStream) && selfie}
      </div>

      {vpaas != null && (
        <Toolbar
          vpaas={vpaas}
          localStream={localStream}
          onLocalStreamChange={setLocalStream}
        />
      )}
    </div>
  )
}
