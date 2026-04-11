import express from 'express';
import { getMe, signup, login, logout } from '../controllers/auth.controller.js';
import { productRoute } from '../middleware/protuctRoute.js';

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Auth route");
})

router.get("/me", productRoute, getMe)
router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

export default router;