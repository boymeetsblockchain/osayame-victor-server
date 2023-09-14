const express = require('express')
const dotenv = require("dotenv").config()
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser= require('cookie-parser')
const userRoute= require('./routes/userRoute')
const errorHandler = require('./middlewares/errorMiddleware')
const corsOptions = {
    origin: 'https://graphic-password-auth.vercel.app/',
    credentials: true,
  }; 
const app = express()
// Middlewares
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))
app.use(cookieParser()) 
app.use(cors());
// app.use(cookieParser())
app.use(bodyParser.json())
app.use(errorHandler)

app.use("/api/user",userRoute)

mongoose.connect(process.env.MONGO_URI).then(()=>{
    app.listen(5000,()=>{
        console.log("server ready")
    })
})
.catch(err=>console.log(err))

app.get("/", (req,res)=>{
 res.send("Homepage")
})