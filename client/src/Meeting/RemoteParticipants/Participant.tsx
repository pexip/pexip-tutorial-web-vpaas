// TODO (01)  Import useState from 'react'
import { Cell, Icon, IconTypes, Video, Audio } from '@pexip/components'
import { type Cells } from '@pexip/components/dist/types/src/components/foundation/Grid/Grid.types'

interface ParticipantProps {
  participantId: string
  md: Cells | undefined
  audioStream: MediaStream | null
  videoStream: MediaStream | null
}

export const Participant = (props: ParticipantProps): JSX.Element => {
  // TODO (02) Define state for videoMuted

  // TODO (03) Attach handlers for "onmute" and "onunmute" events
  return (
    <Cell className="Cell" xs={12} md={props.md}>
      {/* TODO (04) Add a conditional rendering for the video stream when unmuted */}
      {props.videoStream != null && (
        <Video
          className="RemoteVideo"
          title={props.participantId}
          srcObject={props.videoStream}
          style={{ objectFit: 'cover' }}
        />
      )}
      {/* TODO (05) Add a conditional rendering for the video stream when muted */}
      {props.videoStream == null && (
        <div className="NoStreamContainer">
          <Icon
            className="ParticipantIcon"
            source={IconTypes.IconParticipant}
          />
        </div>
      )}
      {props.audioStream != null && (
        <Audio srcObject={props.audioStream} autoPlay={true} />
      )}
    </Cell>
  )
}
