import { type Layer } from '@pexip/vpaas-api'
import { type RTPStreamId } from './RTPStreamId'

export interface StreamInfo {
  streamId: string
  type: 'audio' | 'video'
  participantId: string
  layers: Layer[]
  // TODO (01) Add semantic property to StreamInfo type
  mid?: string
  rid?: RTPStreamId
}
