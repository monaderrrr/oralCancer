import upload from "../config/multer.config.js";
import { globalErrorHandler } from "../Middleware/error-handler.middleware.js";
import authController from "../Modules/Auth/auth.controller.js";
import userController from "../Modules/User/user.controller.js";
import communityController from "../Modules/Community/posts.controller.js";
import communityCommentsController from "../Modules/Community/comments.controller.js";
import contentController from "../Modules/Content/content.controller.js";
import bookingRoutes from "../Modules/Booking/booking.routes.js";
import consultationRoutes from "../Modules/Consultation/consultation.routes.js";
import chatRoutes from "../Modules/Chat/chat.routes.js";
import adminRoutes from "../Modules/Admin/admin.routes.js";
import dashboardRoutes from "../Modules/PatientDashboard/dashboard.routes.js";
import doctorRoutes from "../Modules/Doctor/doctor.routes.js";
import notificationRoutes from "../Modules/Notifications/notification.routes.js";
import mongoose from "mongoose";
import { attachDbStatus } from "../Middleware/db.middleware.js";
import { verifyOtpService } from "../Modules/Auth/Services/auth.service.js";
import { requireDb } from "../Middleware/db.middleware.js";
import { errorHandler } from "../Middleware/error-handler.middleware.js";
const routerHandler = (app) => {
    // attach DB status on every request (available as req.dbConnected)
    app.use(attachDbStatus);

    // simple health route to inspect server + DB status
    app.get('/health', (req, res) => {
        return res.status(200).json({
            ok: true,
            dbConnected: mongoose.connection && mongoose.connection.readyState === 1,
        });
    });

    // ==================== PREDICT ROUTE ====================
    app.post('/api/v1/patient/predict', upload.single('image'), (req, res) => {
        try {
            console.log('File received:', req.file?.path);
            const patterns = ['ulcer', 'patches', 'swelling', 'high-risk', 'normal'];
            const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
            return res.status(200).json({ pattern: randomPattern });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Prediction failed' });
        }
    });

    // ==================== AUTH ROUTES ====================
    app.use('/auth', authController);

    authController.post('/verify-otp', requireDb, errorHandler(verifyOtpService));

    // ==================== OTHER ROUTES ====================
    app.use('/user', userController);
    app.use('/api/v1/community', communityController);
    app.use('/api/v1/community', communityCommentsController);
    app.use('/api/v1/content', contentController);
    app.use('/api/v1/booking', bookingRoutes);
    app.use('/api/v1/consultation', consultationRoutes);
    app.use('/api/v1/chat', chatRoutes);
    app.use('/api/v1/notifications', notificationRoutes);
    app.use('/api/v1/admin', adminRoutes);
    app.use('/api/v1/patient', dashboardRoutes);
    app.use('/api/v1/doctor', doctorRoutes);
    app.use('/api/doctor', doctorRoutes);

    // Also mount dashboard routes at /api/v1 so clients can call endpoints like /api/v1/scans
    app.use('/api/v1', dashboardRoutes);

    app.use((req, res, next) => {
        console.warn('[RouteNotFound]', req.method, req.originalUrl);
        return res.status(404).json({
            success: false,
            message: `Route not found: ${req.method} ${req.originalUrl}`,
        });
    });

    // ==================== GLOBAL ERROR HANDLER ====================
    app.use(globalErrorHandler);
};

export default routerHandler;
