import jwt from "jsonwebtoken";
import BlackListTokens from "../DB/models/black-list-tokens.model.js";
import User from "../DB/models/users.model.js";

const buildAdminUser = (email) => ({
  _id: "admin",
  email,
  role: "admin",
  fullName: "Admin",
  status: "approved",
  isEmailVerified: true,
});

/* =========================
   REFRESH TOKEN MIDDLEWARE
========================= */
export const checkRefreshToken = () => {
  return async (req, res, next) => {
    try {
      // ✅ standard header
      const refreshToken = req.headers["x-refresh-token"];

      if (!refreshToken) {
        return res.status(400).json({
          message: "No refresh token provided",
        });
      }

      let decoded;

      try {
        decoded = jwt.verify(
          refreshToken,
          process.env.JWT_SECRET_REFRESH
        );
      } catch (err) {
        return res.status(401).json({
          message: "Invalid or expired refresh token",
        });
      }

      const user = await User.findById(decoded._id).select(
        "-password -__v"
      );

      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      req.refreshtoken = {
        tokenId: decoded.jti,
        expiryDate: decoded.exp,
      };

      req.user = user;

      next();
    } catch (error) {
      console.error("checkRefreshToken Error:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  };
};

/* =========================
   AUTHENTICATION MIDDLEWARE
========================= */
export const authenticationMiddleware = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          message: "No access token provided",
        });
      }

      const accesstoken = authHeader.split(" ")[1];

      let decodedData;
      try {
        decodedData = jwt.verify(
          accesstoken,
          process.env.JWT_SECRET_LOGIN
        );
      } catch (err) {
        return res.status(401).json({
          message: "Invalid or expired access token",
        });
      }

      // blacklist
      const isBlacklisted = await BlackListTokens.findOne({
        tokenId: decodedData.jti,
      });

      if (isBlacklisted) {
        return res.status(401).json({
          message: "Token is blacklisted",
        });
      }

      // admin shortcut
      if (decodedData.role === "admin") {
        const adminUser = buildAdminUser(decodedData.email);
        req.authUser = adminUser;
        req.user = adminUser;
        return next();
      }

      if (!decodedData._id) {
        return res.status(401).json({
          message: "Invalid access token payload",
        });
      }

      const user = await User.findById(decodedData._id).select("-password -__v");

      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      // doctor validation
      if (user.role === "doctor") {
        if (user.status === "pending") {
          return res.status(403).json({
            message: "Your account is pending admin approval.",
          });
        }

        if (user.status === "rejected") {
          return res.status(403).json({
            message: "Your application was rejected. Please contact support.",
          });
        }
      }

      req.authUser = {
        _id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      };

      req.user = user;

      next();
    } catch (error) {
      console.error("Auth Error:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  };
};
