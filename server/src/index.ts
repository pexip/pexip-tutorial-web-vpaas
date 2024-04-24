// TODO (01) Import type RequestHandler from express
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import https from 'https'
import config from 'config'
// TODO (02) Import uuid and jsonwebtoken
// TODO (03) Import createApi and withToken from '@pexip/vpaas-api'

const port: string = config.get('server.port')

const app = express()

// TODO (02) Define function to generate a JWT token

// TODO (03) Create the api object using withToken

app.use(
  cors({
    origin: 'https://localhost:4000'
  })
)

// TODO (05) Add a new route to get the api address

// TODO (06) Add a new route to create the meeting ID

// TODO (07) Add a new route to create the participant

const options = {
  key: fs.readFileSync('dev-certs/key.pem'),
  cert: fs.readFileSync('dev-certs/cert.pem')
}
const server = https.createServer(options, app)

server.listen(port, () => {
  console.log(
    `VPaaS server listening on port ${port}: https://localhost:${port}`
  )
})
