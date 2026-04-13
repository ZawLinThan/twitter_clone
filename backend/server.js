import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from "cloudinary";

import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import postRoute from './routes/post.route.js';
import notificationRoute from './routes/notification.route.js';

import { connectDB } from './config/db.js';


dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLAUDINARY_CLOUD_NAME,
    api_key: process.env.CLAUDINARY_API_KEY,
    api_secret: process.env.CLAUDINARY_API_SECRET
});

const app = express(); 
const PORT = process.env.PORT || 3000;

app.use(express.json()); // to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded request bodies
app.use(cookieParser()); // to parse cookies

app.use("/api/auth", authRoute)
app.use("/api/users", userRoute)
app.use("/api/posts", postRoute)
app.use("/notifications", notificationRoute)

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.listen(PORT, () => {
    connectDB(); 
    console.log(`Server is running on port ${PORT}`);
});