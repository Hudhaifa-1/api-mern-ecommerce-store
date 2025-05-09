import User from '../models/user.model';
const jwt = require('jsonwebtoken');

export const protectRoute = async (req, res, next) => {
  try {
    let accessToken = req.cookies.accessToken; // Changed from const to let

    // Check for Bearer token if no cookie
    if (!accessToken && req.headers?.authorization?.startsWith("Bearer ")) {
      accessToken = req.headers.authorization.split(" ")[1];
    }

    
    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }
    
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Unauthorized - Token expired" });
      }
      throw error;
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Authentication failed", error: error.message });
  }
};


export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role == "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied - Admin only" });
  }
};

