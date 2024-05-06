import { Modal } from '@pexip/components'
// TODO (12) Import all dependencies

import './Settings.css'

// TODO (13) Define SettingsProps interface with isOpen, onCancel and onSave properties

// TODO (14) Define Settings functional component with SettingsProps parameter
export const Settings = (): JSX.Element => {
  // TODO (15) Define localStream and setLocalStream using useState hook with MediaStream type
  // TODO (16) Define devices and setDevices using useState hook with MediaDeviceInfoLike[] type
  // TODO (17) Define videoInput, setVideoInput, audioInput, setAudioInput, audioOutput and setAudioOutput using useState hook with MediaDeviceInfoLike type

  // TODO (18) Define handleCancel function with void return type
  // TODO (19) Stop all tracks of localStream in handleCancel function
  // TODO (20) Call onCancel function in handleCancel function

  // TODO (21) Define handleSave function with void return type
  // TODO (22) Set videoInput, audioInput and audioOutput in localStorage
  // TODO (23) Stop all tracks of localStream in handleSave function
  // TODO (24) Call onSave function in handleSave function

  // TODO (25) Define requestVideo function with Promise<void> return type
  // TODO (26) Get devices using navigator.mediaDevices.enumerateDevices
  // TODO (27) Set devices using setDevices
  // TODO (28) Filter devices using filterMediaDevices function
  // TODO (29) Set videoInput, audioInput and audioOutput using setVideoInput, setAudioInput and setAudioOutput
  // TODO (30) Get localStream using navigator.mediaDevices.getUserMedia with video deviceId
  // TODO (31) Set localStream using setLocalStream

  // TODO (32) Define useEffect hook with props.isOpen dependency
  // TODO (33) Call requestVideo function in useEffect hook

  return (
    // TODO (34) Add isOpen prop to Modal component and handleCancel function to onClose prop
    <Modal isOpen={true} className="Settings">
      {/*  TODO (35) Add h3 element with Settings text */}
      {/*  TODO (36) Add Selfview component with localMediaStream and isMirrored props */}
      {/*  TODO (37) Add DevicesSelection component with devices, videoInput, audioInput, audioOutput, onVideoInputChange, onAudioInputChange, onAudioOutputChange and setShowHelpVideo props */}
      {/*  TODO (38) Add Bar component with Button components to cancel and save the changes */}
    </Modal>
  )
}
