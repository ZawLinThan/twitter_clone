import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary} from "cloudinary";

export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getUserProfile:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params; // ID of the user to follow/unfollow
        const userToModify = await User.findById(id);
        const currentUser  = await User.findById(req.user._id); 

        if (id === req.user._id.toString()) {
            return res.status(400).json({ error : "You cannot follow/unfollow yourself" });
        }

        if (!userToModify || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow logic
            currentUser.following.pull(id);
            userToModify.follower.pull(req.user._id);
            await currentUser.save();
            await userToModify.save();

            // Create a notification for the unfollowed user
            const notification = new Notification({
                type: "unfollow",
                from: req.user._id,
                to: id
            });
            await notification.save();


            res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            // Follow logic
            currentUser.following.push(id);
            userToModify.follower.push(req.user._id);
            await currentUser.save();
            await userToModify.save();
            
            // Create a notification for the followed user
            const notification = new Notification({
                type: "follow",
                from: req.user._id,
                to: id
            });
            await notification.save();

            // TODO: return the ID of the user as a response 
            res.status(200).json({ message: "User followed successfully" });
        }

    } catch (error) {
        console.error("Error in followUnfollowUser:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const userFollowedByMe = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }, // Exclude the current user
                }
            }, 
            {
                $sample: { size: 10 } // Randomly select 5 users from the remaining pool
            }
        ]); 
userId
        const filteredUsers = users.filter(user => !userFollowedByMe.following.includes(user._id)); // Exclude users who are following the current user
        const suggestedUsers = filteredUsers.slice(0, 4); // Limit to 4 users

        suggestedUsers.forEach(user => {user.password = null;}); // Exclude password field from the response

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.error("Error in getSuggestedUsers:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const updateUser = async (req, res) => {
    try {
        const {fullName, email, currentPassword, newPassword, bio, link} = req.body;
        let {profileImg, coverImg} = req.body;

        const userId = req.user._id;

        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if ((!newPassword & currentPassword) || (newPassword && !currentPassword)) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }

        if (newPassword && currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters long" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if (profileImg) {
            if (user.profileImage) {
                await cloudinary.uploader.destroy(user.profileImage.split("/").pop().split(".")[0]); // Delete the old profile image from Cloudinary
            }
            const uploadedRes = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedRes.secure_url;
        }

        if (coverImg) {
            if (user.coverImage) {
                await cloudinary.uploader.destroy(user.coverImage.split("/").pop().split(".")[0]); // Delete the old cover image from Cloudinary
            }
            const uploadedRes = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedRes.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.link = link || user.link; 
        user.profileImage = profileImg|| user.profileImage;
        user.coverImage = coverImg || user.coverImage;

        user = await user.save();
        user.password = null; // Exclude password from the response
        
        res.status(200).json(user);
    } catch (error) {
        console.error("Error in updateUser:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
