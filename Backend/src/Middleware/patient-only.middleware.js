// Middleware to ensure only patients can access patient dashboard APIs
export const patientOnlyMiddleware = () => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.authUser) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Check if user is a patient
      if (req.authUser?.role !== "patient") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only patients can access this resource.",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};
