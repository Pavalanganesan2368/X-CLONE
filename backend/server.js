import express from "express";
import connectDB from "./config/db.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import notificationRoute from "./routes/notification.route.js"
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import cors from "cors";
import path from "path";
import dns from "dns";

import dotenv from "dotenv";
dotenv.config();

dns.setServers(["0.0.0.0", "8.8.8.8"]);

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_SECRET_KEY
});

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}));

app.use(express.json({
    limit : "5mb"
}));
app.use(cookieParser());
app.use(express.urlencoded({
    extended : true
}));
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/notification", notificationRoute);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.use((req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
    })
}

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is Now Started : ${PORT}`);
    });
}).catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
});
