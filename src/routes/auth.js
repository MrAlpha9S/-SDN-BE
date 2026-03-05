// import dotenv from "dotenv";
// dotenv.config();

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserData from "../models/UserModel.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT;

// 📌 Show login page
router.get("/login", (req, res) => {
  res.render("auth/login", {
    title: "Login"
  });
});

// 📌 Register (for testing)
router.get("/register", (req, res) => {
  res.render("auth/register", {
    title: 'Register'
  });
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await UserData.create({
    username,
    password: hashedPassword
  });

  res.redirect("/auth/login");
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await UserData.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none",  // Required for cross-origin requests
    secure: true,      // Required when sameSite is "none"
  });

  res.json({
    user: {
      _id: user._id,
      username: user.username,
      isAdmin: user.isAdmin
    }
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.json({ message: "Logged out successfully" });
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    //console.log('Token in /me: ', token);

    if (!token) {
      return res.status(401).json({ user: null });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await UserData.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ user: null });
    }

    res.json({ user });

  } catch (err) {
    res.status(401).json({ user: null });
  }
});

export default router;