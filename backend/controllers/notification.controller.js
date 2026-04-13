export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming the user ID is available in the request object after authentication
        const notifications = await Notification.find({ to: userId })
            .sort({ createdAt: -1 }) // Fetch notifications for the user, sorted by most recent
            .populate({
                "path": "from",
                "select": "username profileImg"
            }); 

        await Notification.updateMany({ to: userId} , {read: true }); // Mark all notifications as read

        res.status(200).json({ notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const notificationId = req.params.id; // Assuming the notification ID is passed as a URL parameter
        const userId = req.user._id; // Assuming the user ID is available in the request object after authentication
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        
        if (notification.to.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Forbidden: You can only delete your own notifications" });
        }

        await Notification.deleteMany({ to: userId }); // Delete all notifications for the user
        res.status(200).json({ message: "Notifications deleted successfully" });
    } catch (error) {
        console.error("Error deleting notifications:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}