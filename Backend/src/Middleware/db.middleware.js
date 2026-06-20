import mongoose from "mongoose";

// Returns true if mongoose is connected (readyState === 1)
export const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// Middleware to ensure DB is connected before proceeding to route handlers
export const requireDb = (req, res, next) => {
    if (isDbConnected()) return next();
    return res.status(503).json({ message: "Service Unavailable: database is not connected" });
};

// Attach db status to request for downstream handlers
export const attachDbStatus = (req, res, next) => {
    req.dbConnected = isDbConnected();
    next();
};
