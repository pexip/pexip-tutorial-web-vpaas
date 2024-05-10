// TODO (02) Import Layer type from the '@pexip/vpaas-api' package
// TODO (03) Import RTPStreamId type from the './RTPStreamId' file

export interface StreamInfo {
  streamId: string
  type: 'audio' | 'video'
  participantId: string
  // TODO (04) Add a new property named layers of type Layer[]
  mid?: string
  // TODO (05) Add a new property named rid of type RTPStreamId
}
