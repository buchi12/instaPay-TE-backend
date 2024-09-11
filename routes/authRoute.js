import express from "express";
import { login, signUp, logout, verifyOtp, uploads } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);            // Step 1: Login and send OTP
router.post('/verify-otp', verifyOtp);   // Step 2: Verify OTP and complete login
router.get('/logout', logout);

router.post('/uploads',uploads)


export default router;
