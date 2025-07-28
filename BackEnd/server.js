import express from "express"
import dotenv from "dotenv"
import { dbConnection } from "./Config/config.js"
const app = express()

dotenv.config()
const port = 3000 || process.env.PORT

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  dbConnection()
})
