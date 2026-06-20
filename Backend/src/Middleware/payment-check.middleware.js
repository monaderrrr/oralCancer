export const paymentCheckMiddleware = () => {
  return async (req, res, next) => {
    try {
      // بدون أي check للدفع
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};