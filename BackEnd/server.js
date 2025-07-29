import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import { dbConnection } from "./Config/config.js"
import { authRoutes } from "./Routes/authRoutes.js"
const app = express()

dotenv.config()
const port = 3000 || process.env.PORT
app.use(cookieParser())
app.use(express.urlencoded({limit: "50mb"}))
app.use("/api/auth", authRoutes)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  dbConnection()
})
