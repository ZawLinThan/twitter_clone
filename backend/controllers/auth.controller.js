import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/util/generateToken.js";
import { getLikedPosts } from "./post.controller.js";

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        const isPasswordValid = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordValid) {
            return res.status(400).json({ message: "Invalid username or password" });
        }
        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            follower: user.follower,
            following: user.following,
            profileImage: user.profileImage,
            coverImage: user.coverImage,
            bio: user.bio,
            link: user.link,
        });
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
export const signup = async (req, res) => {
    try { 
        const { username, fullName, password, email } = req.body;  
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const existingEmail = await User.findOne({ email}); 
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already taken" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        
        // hash the password before saving to the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username: username,
            fullName: fullName,
            password: hashedPassword,
            email: email
        });

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                follower: newUser.follower,
                following: newUser.following,
                profileImage: newUser.profileImage,
                coverImage: newUser.coverImage,
                bio: newUser.bio,
                link: newUser.link,
                likedPosts: []
            });
        } else {
            res.status(500).json({ message: "Failed to create user" }); 
        }
    } catch (error) {
        console.error("Error during signup:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge : 0 })
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error during logout:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user data:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}