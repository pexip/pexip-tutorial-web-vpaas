import { Grid } from '@pexip/components'
import { type StreamInfo } from '../../types/StreamInfo'
import { type TransceiverConfig } from '@pexip/peer-connection'
import { Participant } from './Participant'

import './RemoteParticipants.css'

interface RemoteParticipantsProps {
  remoteParticipantsIds: string[]
  streamsInfo: StreamInfo[]
  remoteTransceiversConfig: TransceiverConfig[]
  sinkId: string
}

export const RemoteParticipants = (
  props: RemoteParticipantsProps
): JSX.Element => {
  const { remoteParticipantsIds, streamsInfo, remoteTransceiversConfig } = props

  const getMediaStreams = (
    participantId: string
  ): {
    audioStream: MediaStream | null
    videoStream: MediaStream | null
  } => {
    const audioMid = streamsInfo.find((streamInfo) => {
      return (
        streamInfo.participantId === participantId &&
        streamInfo.type === 'audio'
      )
    })?.mid
    const videoMid = streamsInfo.find((streamInfo) => {
      // TODO (04) Add check for semantic === 'main'
      return (
        streamInfo.participantId === participantId &&
        streamInfo.type === 'video'
      )
    })?.mid

    const audioTransceiverConfig =
      audioMid != null
        ? remoteTransceiversConfig.find(
            (transceiverConfig) =>
              transceiverConfig.transceiver?.mid === audioMid
          )
        : null
    const videoTransceiverConfig =
      videoMid != null
        ? remoteTransceiversConfig.find(
            (transceiverConfig) =>
              transceiverConfig.transceiver?.mid === videoMid
          )
        : null

    const audioStream =
      audioTransceiverConfig?.remoteStreams != null
        ? audioTransceiverConfig.remoteStreams[0]
        : null
    const videoStream =
      videoTransceiverConfig?.remoteStreams != null
        ? videoTransceiverConfig.remoteStreams[0]
        : null

    return {
      audioStream,
      videoStream
    }
  }

  // TODO (05) Filter out streams with semantic === 'presentation' and mid != null

  // TODO (06) Add length of presentationsInfo to the totalStreams
  const totalStreams = remoteParticipantsIds.length
  const columns = Math.ceil(Math.sqrt(totalStreams))
  const md = Math.max(Math.round(12 / columns), 1) as any

  const participants = remoteParticipantsIds.map((participantId) => {
    const { audioStream, videoStream } = getMediaStreams(participantId)
    return (
      <Participant
        participantId={participantId}
        md={md}
        audioStream={audioStream}
        videoStream={videoStream}
        key={participantId}
        sinkId={props.sinkId}
        // TODO (07) Add semantic="main" to Participant component
      />
    )
  })

  // TODO (08) Create Participant components for presentations

  return (
    <Grid
      className="RemoteParticipants"
      style={{
        display: totalStreams === 1 ? 'block' : 'flex',
        flexGrow: totalStreams < 3 ? '1' : 'initial'
      }}
    >
      {participants}
      {/* TODO (09) Add presentations to the grid */}
    </Grid>
  )
}
