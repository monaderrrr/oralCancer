// Role-based access control middleware
// Check if user has one of the allowed roles

export const checkRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Get user from auth middleware (req.authUser set by authenticationMiddleware)
      const user = req.user || req.authUser;
      
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized: user not found' });
      }

      const userRole = user.role;
      
      if (!userRole) {
        return res.status(401).json({ message: 'User role not found' });
      }

      // Check if user role is in allowed roles
      if (allowedRoles.length && !allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: `Forbidden: Only ${allowedRoles.join(', ')} can access this resource` });
      }

      // Ensure role is attached to authUser for convenience
      if (req.authUser) {
        req.authUser.role = userRole;
      }
      
      next();
    } catch (err) {
      return res.status(500).json({ message: 'Error checking role', error: err.message });
    }
  };
};

// Alias for better naming convention
export const roleCheck = checkRole;
