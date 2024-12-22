// routes/profileRoutes.js
import express from "express";
import User from "../models/User.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// 사용자 프로필 가져오기
router.get("/me", authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.email }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
        }
        res.json(user);
    } catch (error) {
        console.error("프로필 가져오기 실패:", error);
        res.status(500).json({ error: "서버 오류" });
    }
});

// 프로필 업데이트
router.put("/update-profile", authenticateToken, async (req, res) => {
    const { profilePic, bio } = req.body;

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email: req.email },
            { profilePicture: profilePic, bio },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("프로필 업데이트 실패:", error);
        res.status(500).json({ error: "서버 오류" });
    }
});

export default router;