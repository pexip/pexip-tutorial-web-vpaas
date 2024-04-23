import { Box, BoxHeader, Button } from '@pexip/components'

import './CreateMeeting.css'

export const CreateMeeting = (): JSX.Element => {
  const handleClick = async (): Promise<void> => {}

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
