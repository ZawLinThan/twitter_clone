import express from 'express';
import mongoose from 'mongoose';    
import dotenv from 'dotenv';
import authRoute from './routes/auth.route.js';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express(); 


app.use("/api/auth", authRoute)
const PORT = process.env.PORT || 3000;
 
app.get("/", (req, res) => {
    res.send("Hello World");
})

app.listen(PORT, () => {
    connectDB(); 
    console.log(`Server is running on port ${PORT}`);
});