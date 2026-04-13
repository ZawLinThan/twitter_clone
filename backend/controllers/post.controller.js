import Post from "../models/Post.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString(); // Assuming the user ID is available in req.user from the protectRoute middleware
        
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!text && !img) {
            return res.status(400).json({ message: "Post must contain text or an image" });
        }

        const newPost = new Post({
            user: userId,
            text,
            img
        })

        await newPost.save();
        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        console.error("Error creating post:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id; 
        const userId = req.user._id;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        const hasLiked = post.likes.includes(userId);
        if (hasLiked) {
            post.likes.pull(userId); // Remove the user ID from the likes array
            await post.save();

            user.likedPosts.pull(postId); // Remove the post ID from the user's hasLikedPosts array
            await user.save();

            res.status(200).json({ message: "Post unliked successfully" });
        } else {
            post.likes.push(userId); // Add the user ID to the likes array
            await post.save();
            res.status(200).json({ message: "Post liked successfully" });
            
            user.likedPosts.push(postId); // Add the post ID to the user's hasLikedPosts array
            await user.save();

            const notification = new Notification({
                from: userId,
                to: post.user, // The owner of the post
                type: "like",
            });
            await notification.save();
        }
    } catch (error) {
        console.error("Error liking/unliking post:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id; 

        if (!text) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        const comment = {
            user: userId,
            text,
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();
        
        res.status(200).json({ message: "Comment added successfully", comment });
    } catch (error) {
        console.error("Error commenting on post:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id); 
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: You can only delete your own posts" });
        }

        if (post.img) {
            // If the post has an image, delete it from Cloudinary
            const imgId = post.img.split("/").pop().split(".")[0]; // Extract the public ID from the image URL
            await cloudinary.uploader.destroy(imgId); // Delete the image from Cloudinary
        }

        await Post.findByIdAndDelete(req.params.id); // Delete the post from the database
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 }) // Sort posts by creation date (newest first)
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comments.user",
                select: "-password"
            }); 

        if (!posts) {
            return res.status(404).json({ message: "No posts found" });
        }

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error retrieving posts:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getLikedPosts = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId) 

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
        .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        }); 

        res.status(200).json(likedPosts);
    } catch (error) {
        console.error("Error retrieving liked posts:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getFollowingPosts = async (req, res) => {
    const userId = req.user._id;
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const followingPosts = await Post.find({ user: { $in: user.following } })
            .sort({ createdAt: -1 }) // Sort posts by creation date (newest first)
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comments.user",
                select: "-password"
            }); 
            
        res.status(200).json(followingPosts);
    } catch (error) {
        console.error("Error retrieving following posts:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getUserPosts = async (req, res) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userPosts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 }) // Sort posts by creation date (newest first)
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comments.user",
                select: "-password"
            });
            
        res.status(200).json(userPosts);
    } catch (error) {
        console.error("Error retrieving user posts:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}