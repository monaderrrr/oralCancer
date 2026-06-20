import "dotenv/config";
import fs from "fs";
import path from "path";
import { database_connection } from "../src/DB/connection.js";
import User from "../src/DB/models/users.model.js";
import Notification from "../src/DB/models/notification.model.js";
import Scan from "../src/DB/models/scan.model.js";
import SharedScanAccess from "../src/DB/models/shared-scan-access.model.js";
import Review from "../src/DB/models/review.model.js";
import Recommendation from "../src/DB/models/recommendation.model.js";
import Conversation from "../src/DB/models/conversation.model.js";
import Message from "../src/DB/models/message.model.js";
import Consultation from "../src/DB/models/consultation.model.js";
import Slot from "../src/DB/models/slot.model.js";
import Post from "../src/DB/models/post.model.js";
import Comment from "../src/DB/models/comment.model.js";
import Content from "../src/DB/models/content.model.js";
import BlackListTokens from "../src/DB/models/black-list-tokens.model.js";
import { signInService } from "../src/Modules/Auth/Services/auth.service.js";

const safeLog = (...args) => console.log("[cleanup]", ...args);

const uploadDir = path.resolve("uploads");

const summary = {
    usersDeleted: 0,
    notificationsDeleted: 0,
    scansDeleted: 0,
    sharedScanAccessDeleted: 0,
    reviewsDeleted: 0,
    recommendationsDeleted: 0,
    conversationsDeleted: 0,
    messagesDeleted: 0,
    consultationsDeleted: 0,
    slotsDeleted: 0,
    postsDeleted: 0,
    commentsDeleted: 0,
    contentsDeleted: 0,
    blackListTokensDeleted: 0,
    uploadFilesDeleted: 0,
};

const deleteFilesRecursively = (dir) => {
    if (!fs.existsSync(dir)) return 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let removed = 0;
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            removed += deleteFilesRecursively(fullPath);
            fs.rmdirSync(fullPath, { recursive: true });
            removed += 1;
        } else {
            fs.unlinkSync(fullPath);
            removed += 1;
        }
    }
    return removed;
};

const createFakeRes = () => {
    const res = {};
    res._status = null;
    res._data = null;
    res.status = function (code) {
        this._status = code;
        return this;
    };
    res.json = function (payload) {
        this._data = payload;
        return payload;
    };
    return res;
};

const run = async () => {
    safeLog("Connecting to database...");
    const ok = await database_connection();
    if (!ok) {
        safeLog("Database connection failed. Aborting.");
        process.exit(1);
    }

    const countsBefore = {
        users: await User.countDocuments({ role: { $in: ["patient", "doctor"] } }),
        notifications: await Notification.countDocuments(),
        scans: await Scan.countDocuments(),
        sharedScanAccess: await SharedScanAccess.countDocuments(),
        reviews: await Review.countDocuments(),
        recommendations: await Recommendation.countDocuments(),
        conversations: await Conversation.countDocuments(),
        messages: await Message.countDocuments(),
        consultations: await Consultation.countDocuments(),
        slots: await Slot.countDocuments(),
        posts: await Post.countDocuments(),
        comments: await Comment.countDocuments(),
        contents: await Content.countDocuments(),
        blackListTokens: await BlackListTokens.countDocuments(),
    };

    safeLog("Counts before cleanup:", countsBefore);

    summary.usersDeleted = (await User.deleteMany({ role: { $in: ["patient", "doctor"] } })).deletedCount || 0;
    summary.notificationsDeleted = (await Notification.deleteMany({})).deletedCount || 0;
    summary.scansDeleted = (await Scan.deleteMany({})).deletedCount || 0;
    summary.sharedScanAccessDeleted = (await SharedScanAccess.deleteMany({})).deletedCount || 0;
    summary.reviewsDeleted = (await Review.deleteMany({})).deletedCount || 0;
    summary.recommendationsDeleted = (await Recommendation.deleteMany({})).deletedCount || 0;
    summary.conversationsDeleted = (await Conversation.deleteMany({})).deletedCount || 0;
    summary.messagesDeleted = (await Message.deleteMany({})).deletedCount || 0;
    summary.consultationsDeleted = (await Consultation.deleteMany({})).deletedCount || 0;
    summary.slotsDeleted = (await Slot.deleteMany({})).deletedCount || 0;
    summary.postsDeleted = (await Post.deleteMany({})).deletedCount || 0;
    summary.commentsDeleted = (await Comment.deleteMany({})).deletedCount || 0;
    summary.contentsDeleted = (await Content.deleteMany({})).deletedCount || 0;
    summary.blackListTokensDeleted = (await BlackListTokens.deleteMany({})).deletedCount || 0;

    if (fs.existsSync(uploadDir)) {
        summary.uploadFilesDeleted = deleteFilesRecursively(uploadDir);
    } else {
        safeLog("Uploads directory not found; skipping file cleanup.");
    }

    const countsAfter = {
        users: await User.countDocuments({ role: { $in: ["patient", "doctor"] } }),
        notifications: await Notification.countDocuments(),
        scans: await Scan.countDocuments(),
        sharedScanAccess: await SharedScanAccess.countDocuments(),
        reviews: await Review.countDocuments(),
        recommendations: await Recommendation.countDocuments(),
        conversations: await Conversation.countDocuments(),
        messages: await Message.countDocuments(),
        consultations: await Consultation.countDocuments(),
        slots: await Slot.countDocuments(),
        posts: await Post.countDocuments(),
        comments: await Comment.countDocuments(),
        contents: await Content.countDocuments(),
        blackListTokens: await BlackListTokens.countDocuments(),
        uploadsDirectoryExists: fs.existsSync(uploadDir),
        uploadsDirectoryEntries: fs.existsSync(uploadDir)
            ? fs.readdirSync(uploadDir).length
            : 0,
    };

    safeLog("Counts after cleanup:", countsAfter);

    safeLog("Verifying admin login path...");
    const fakeReq = { body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } };
    const fakeRes = createFakeRes();
    await signInService(fakeReq, fakeRes);

    safeLog("Admin login verification status:", fakeRes._status);
    safeLog("Admin login response:", fakeRes._data);

    safeLog("=== Cleanup summary ===");
    safeLog(`Deleted users (doctors + patients): ${summary.usersDeleted}`);
    safeLog(`Deleted notifications: ${summary.notificationsDeleted}`);
    safeLog(`Deleted scans: ${summary.scansDeleted}`);
    safeLog(`Deleted shared scan access: ${summary.sharedScanAccessDeleted}`);
    safeLog(`Deleted reviews: ${summary.reviewsDeleted}`);
    safeLog(`Deleted recommendations: ${summary.recommendationsDeleted}`);
    safeLog(`Deleted conversations: ${summary.conversationsDeleted}`);
    safeLog(`Deleted messages: ${summary.messagesDeleted}`);
    safeLog(`Deleted consultations: ${summary.consultationsDeleted}`);
    safeLog(`Deleted slots: ${summary.slotsDeleted}`);
    safeLog(`Deleted posts: ${summary.postsDeleted}`);
    safeLog(`Deleted comments: ${summary.commentsDeleted}`);
    safeLog(`Deleted contents: ${summary.contentsDeleted}`);
    safeLog(`Deleted black list tokens: ${summary.blackListTokensDeleted}`);
    safeLog(`Deleted upload files/folders: ${summary.uploadFilesDeleted}`);

    process.exit(0);
};

run().catch((err) => {
    console.error("[cleanup] Unexpected error:", err);
    process.exit(1);
});
