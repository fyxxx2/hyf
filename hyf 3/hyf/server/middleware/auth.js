import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "인증 토큰이 필요합니다." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.username = decoded.username;
        req.email = decoded.email;
        next();
    } catch (error) {
        console.error("토큰 검증 실패:", error);
        res.status(403).json({ error: "유효하지 않은 토큰" });
    }
};

export default authenticateToken;
