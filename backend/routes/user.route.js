import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { followUnfollow, getProfile, getSuggestedUsers, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", getProfile);
router.post("/follow/:id", protectRoute, followUnfollow);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/update", protectRoute, updateUser);

export default router;