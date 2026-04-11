import User from "../models/user.model.js";

export const productRoute = async (req, res, next) => {
    try {
        const cookie = req.cookies.jwt; // Assuming the token is stored in a cookie named "token"

        if (!cookie) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        
        const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
        if (!decoded) { 
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user  = user; // Attach the user object to the request for use in subsequent middleware or route handlers
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Error in productRoute middleware:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}  