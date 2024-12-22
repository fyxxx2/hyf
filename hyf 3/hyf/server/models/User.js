// models/User.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profilePicture: { type: String, default: "/uploads/default-profile.jpg" },
        bio: { type: String, default: "" },
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        highlights: [
            {
                emotion: String,
                posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
            },
        ],
    },
    { timestamps: true }
);



// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log("비밀번호 비교 상태 (comparePassword):", isMatch);  // 디버깅 로그
        return isMatch;
    } catch (error) {
        console.error("비밀번호 비교 오류:", error);
        throw new Error("비밀번호 비교 오류");
    }
};


const User = mongoose.model("User", userSchema);

export default User;
