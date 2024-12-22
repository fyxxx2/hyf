import express from "express";
import bcrypt from "bcryptjs"; // bcrypt 대신 bcryptjs 사용

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Post from "../models/Post.js"
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// 회원가입
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        console.log("받은 회원가입 데이터:", req.body); // 디버깅 로그

        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res.status(400).json({ error: "이미 등록된 사용자입니다." });
        }

        // 비밀번호 해시
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("회원가입 시 해시된 비밀번호:", hashedPassword); // 디버깅 로그

        const newUser = new User({
            username,
            email,
            password: hashedPassword, // 해시된 비밀번호만 저장
        });

        await newUser.save();
        console.log("새 사용자 저장 성공:", newUser);
        res.status(201).json({ message: "회원가입 성공" });
    } catch (error) {
        console.error("회원가입 실패:", error);
        res.status(500).json({ error: "서버 오류로 인해 회원가입 실패" });
    }
});

// 로그인 라우트
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // 사용자 찾기
        const user = await User.findOne({ email });
        if (!user) {
            console.error("사용자를 찾을 수 없습니다:", email);
            return res.status(400).json({ error: "사용자를 찾을 수 없습니다." });
        }

        // 입력된 비밀번호 확인
        console.log("입력된 비밀번호:", password);
        console.log("저장된 해시된 비밀번호:", user.password);

        // 비밀번호 비교
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("비밀번호 비교 결과:", isMatch);

        if (!isMatch) {
            return res.status(400).json({ error: "비밀번호가 틀렸습니다." });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            { email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // 응답 전송
        res.json({
            message: "로그인 성공",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("로그인 실패:", error);
        res.status(500).json({ error: "서버 오류로 인해 로그인 실패" });
    }
});

// 사용자 게시물 가져오기
router.get("/my-posts", authenticateToken, async (req, res) => {
    try {
        const posts = await Post.find({ username: req.username }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error("게시물 가져오기 실패:", error);
        res.status(500).json({ error: "게시물 가져오기 실패" });
    }
});





export default router;