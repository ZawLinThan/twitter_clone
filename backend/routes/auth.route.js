import express from 'express';
import { signup, login, logout } from '../controllers/auth.controller.js';

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Auth route");
})

router.post("/signup", signup)
router.get("/login", login)

router.get("/logout", logout)

export default router;