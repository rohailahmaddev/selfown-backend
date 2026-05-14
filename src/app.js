import express from "express";
import cors from "cors"
import cookieParser from 'cookie-parser'

const app = express()

//cors configrations
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true 
  }))
app.use(express.json());   
app.use(cookieParser())

//API

import router from "./routes/index.route.js"

app.use("/api",router)

export default app;