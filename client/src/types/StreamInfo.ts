import { type Layer } from '@pexip/vpaas-api'
import { type RTPStreamId } from './RTPStreamId'

export interface StreamInfo {
  streamId: string
  type: 'audio' | 'video'
  participantId: string
  layers: Layer[]
  mid?: string
  rid?: RTPStreamId
}
