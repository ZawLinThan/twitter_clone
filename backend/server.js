import express from 'express';
import dotenv from 'dotenv';
import authRoute from './routes/auth.route.js';
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 3000;

app.use(express.json()); // to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded request bodies
app.use(cookieParser()); // to parse cookies

app.use("/api/auth", authRoute)
 
app.get("/", (req, res) => {
    res.send("Hello World");
})

app.listen(PORT, () => {
    connectDB(); 
    console.log(`Server is running on port ${PORT}`);
});