import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import fs from 'fs'
import https from 'https'
import config from 'config'

const port: string = config.get('server.port')

const app = express()
app.use(helmet())

app.use(
  cors({
    origin: 'https://localhost:4000'
  })
)

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
