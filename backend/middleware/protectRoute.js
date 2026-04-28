import jwt from "jsonwebtoken";
import User from "../model/User.model.js";

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        // if (!token) return res.status(400).json({ error : "Unauthorized - No token Provided "});
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(400).json({ error : "Unauthorized : Invalid Token" });

        const user = await User.findOne({ _id : decoded.userId }).select("-password");
        if (!user) return res.status(400).json({ error : "User is not found!" });

        req.user=user;
        next();
    } catch (error) {
        console.log('Error in ProtectRoute : '+error);
        res.status(500).json({
            error : "Internet Server Error"
        });
    }
}

export default protectRoute;