export interface StreamInfo {
  streamId: string
  type: 'audio' | 'video'
  participantId: string
  mid?: string
}
