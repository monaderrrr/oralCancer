import 'dotenv/config';
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { database_connection } from "./DB/connection.js";
import routerHandler from "./utils/router-handler.utils.js";
import { initializeChatSocket } from "./Services/socket.service.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

/* ================= EXISTING CODE (UNCHANGED) ================= */

console.log('main.js: loading environment and starting bootstrap');

const maskSecret = (s = "") => {
    try {
        if (!s) return { set: false, len: 0 };
        const len = s.length;
        const prefix = s.slice(0, 4);
        const suffix = s.slice(-4);
        return { set: true, len, prefix, suffix };
    } catch (e) {
        return { set: false, len: 0 };
    }
};

const jwtSecretInfo = maskSecret(process.env.JWT_SECRET);
const jwtLoginInfo = maskSecret(process.env.JWT_SECRET_LOGIN);
const jwtRefreshInfo = maskSecret(process.env.JWT_SECRET_REFRESH);

console.info('[env-debug] JWT_SECRET set:', jwtSecretInfo.set);
console.info('[env-debug] JWT_SECRET_LOGIN set:', jwtLoginInfo.set);
console.info('[env-debug] JWT_SECRET_REFRESH set:', jwtRefreshInfo.set);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= BOOTSTRAP ================= */

const bootstrap = async () => {
    console.log('main.js: bootstrap() start');

    const app = express();
    const httpServer = createServer(app);

    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    /* ================= ADDITION (SAFE EXTENSION) ================= */

    // make io globally available in all controllers
    app.set('io', io);

    // 🔥 helper function for real-time notifications
    app.set('emitEvent', (userId, event, data = {}) => {
        console.log(`📢 Emitting event to user ${userId}: ${event}`);
        io.to(userId.toString()).emit(event, data);
    });

    /* ================= CORS ================= */

    app.use(
        cors({
            origin: [
                "http://localhost:5173",
                "https://oralcancer-ashen.vercel.app",
                "https://oralcancer-ou8ze0fc9-mohamed-nader.vercel.app",
            ],
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            credentials: true,
            allowedHeaders: [
                "Content-Type",
                "Authorization",
                "x-refresh-token",
            ],
        })
    );

    app.options("*", cors());
    app.use(express.json());

    // app.use((req, res, next) => {
    //     res.header(
    //         "Access-Control-Allow-Origin",
    //         process.env.FRONTEND_URL || "http://localhost:5173"
    //     );
    //     res.header("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS");
    //     res.header(
    //         "Access-Control-Allow-Headers",
    //         "Content-Type, Authorization, x-refresh-token"
    //     );

    //     if (req.method === "OPTIONS") {
    //         return res.sendStatus(200);
    //     }
    //     next();
    // });

    app.use((req, res, next) => {
        console.log(`[Request] ${req.method} ${req.url}`);
        console.log(`[Headers] Authorization: ${req.headers.authorization ? 'Found' : 'NOT FOUND'}`);
        res.on("finish", () => {
            console.log(`[Response] ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
        });
        next();
    });

    app.use(express.static("public"));
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

    /* ================= DB ================= */

    await database_connection();

    /* ================= ROUTES ================= */

    routerHandler(app);

    /* ================= SOCKET SERVICES ================= */

    initializeChatSocket(io);

    /* ================= START SERVER ================= */

    const port = process.env.PORT || 5000;
    httpServer.listen(port, () => {
        console.log(`Server is running on port ${port}!`);
    });
};

export default bootstrap;
