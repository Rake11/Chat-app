import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import path from "path";

import { connectDB } from './lib/db.js';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import {app, server} from "./lib/socket.js";





dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(express.json({ limit: "500mb" })); // Increase limit for JSON payloads
app.use(express.urlencoded({ limit: "500mb", extended: true })); // Increase limit for URL-encoded payloads
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../Frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname,"../Frontend","dist","index.html"));
    });

}

server.listen(PORT, async () => {
    
    console.log(`server is running on PORT: ${PORT}`);
    try {
        await connectDB();
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
});