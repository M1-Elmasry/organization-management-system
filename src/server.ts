import express from 'express';
import { SERVER_HOST, SERVER_PORT } from './utils/constants';

const app = express()

app.get('/', (_req, res) => {
  res.status(200).send("Hello World");
})

app.listen(SERVER_PORT, () => {
  console.log(`server running on ${SERVER_HOST}:${SERVER_PORT}`)
})
