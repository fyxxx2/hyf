// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 라우트 임포트
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import spotifyRoutes from "./routes/spotify.js";

// 환경 변수 설정
dotenv.config();

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 앱 초기화
const app = express();
app.use(express.urlencoded({ extended: true }));

// 미들웨어 설정
app.use(cors({
    origin: "http://localhost:3000", // 프론트엔드 URL
    credentials: true,
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static('public')); // 정적 파일 제공

// 라우트 연결
app.use("/api", userRoutes);
app.use("/api", profileRoutes);
app.use("/api", postRoutes);
app.use("/api/spotify", spotifyRoutes);

// 데이터베이스 연결
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ MongoDB 연결 성공"))
    .catch((err) => console.error("❌ MongoDB 연결 실패:", err));

// 서버 실행
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
