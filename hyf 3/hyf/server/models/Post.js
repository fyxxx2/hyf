import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    username: { type: String, required: true },  
    content: { type: String, required: true },
    music: { type: String },
    imageUrl: { type: String },
    highlight: { 
        type: String, 
        enum: ["Happiness", "Sadness", "Love", "Anger", "Sensibility"], 
        required: true 
    },
    createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model("Post", postSchema);

export default Post;