import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";
import multer from "multer";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const sanitizedFilename = file.originalname.replace(/\s+/g, "-").toLowerCase();
        cb(null, `${timestamp}-${sanitizedFilename}`);
    },
});

// 파일 필터링 설정
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);  // 허용된 파일
    } else {
        cb(new Error("이미지 파일만 업로드할 수 있습니다."), false);  // 오류 발생
    }
};

// 업로드 미들웨어 설정
const upload = multer({ storage, fileFilter });

// 모든 게시물 가져오기
router.get("/posts", async (req, res) => {
    const { highlight } = req.query;
    try {
        const query = highlight && highlight !== "전체" ? { highlight } : {};
        const posts = await Post.find(query).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error("게시물 가져오기 실패:", error);
        res.status(500).json({ error: "게시물 조회 실패" });
    }
});

router.get("/search", async (req, res) => {
    const { query } = req.query; // 클라이언트에서 보낸 검색어
    try {
        // 검색 기준을 highlight로 변경
        const searchCriteria = query ? { highlight: { $regex: query, $options: "i" } } : {};
        const posts = await Post.find(searchCriteria).sort({ createdAt: -1 }); // 검색 후 최신 순 정렬
        res.json(posts);
    } catch (error) {
        console.error("검색 실패:", error);
        res.status(500).json({ error: "게시물 검색 실패" });
    }
});

// 사용자 프로필 정보 가져오기
router.get("/me", authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.username }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
        }
        res.json(user);
    } catch (error) {
        console.error("프로필 가져오기 실패:", error);
        res.status(500).json({ error: "서버 오류" });
    }
}); 

// 사용자 게시물 가져오기
router.get("/my-posts", authenticateToken, async (req, res) => {
    try {
        const posts = await Post.find({ username: req.username })
            .sort({ createdAt: -1 })
            .select("content imageUrl createdAt");

        res.status(200).json(posts);
    } catch (error) {
        console.error("게시물 가져오기 실패:", error);
        res.status(500).json({ error: "게시물 가져오기 실패" });
    }
});

// 게시글 업로드
router.post("/upload", authenticateToken, upload.single("photo"), async (req, res) => {
    try {
        console.log("요청 본문:", req.body);
        console.log("업로드된 파일:", req.file);

        const { content, music, highlight } = req.body;

        // 필수 필드 검증
        if (!req.username || !content?.trim() || !highlight || !req.file) {
            console.error("필수 필드 누락:", { username: req.username, content, highlight, file: req.file });
            return res.status(400).json({ error: "모든 필드를 입력하세요." });
        }

        const newPost = new Post({
            username: req.username,
            content: content.trim(),
            music: music || null,
            highlight,
            imageUrl: `/uploads/${req.file.filename}`,
        });

        await newPost.save();
        res.status(201).json({ message: "게시글 업로드 성공", post: newPost });
    } catch (error) {
        console.error("게시글 업로드 실패:", error);
        res.status(500).json({ error: "서버 오류" });
    }
});

export default router;
