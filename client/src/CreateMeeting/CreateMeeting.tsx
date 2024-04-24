import { Box, BoxHeader, Button } from '@pexip/components'
// TODO (01) Import useNavigate from react-router-dom
// TODO (02) Import config

import './CreateMeeting.css'

export const CreateMeeting = (): JSX.Element => {
  // TODO (03) Create a navigate function using useNavigate
  const handleClick = async (): Promise<void> => {
    // TODO (04) Use the our API to create the meeting
    // TODO (05) Navigate to the meeting page
  }

  return (
    <div className="CreateMeeting">
      <Box colorScheme="light">
        <BoxHeader>
          <h3>Create Meeting</h3>
        </BoxHeader>
        <div className="BoxContainer">
          <p>
            Click on <b>Create Meeting</b> and share the link with other
            participants.
          </p>
          <Button
            variant="primary"
            colorScheme="light"
            onClick={() => {
              handleClick().catch((e) => {
                console.error(e)
              })
            }}
          >
            Create Meeting
          </Button>
        </div>
      </Box>
    </div>
  )
}
