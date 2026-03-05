import express from "express";
import UserData from "../models/UserModel.js";
import { verifyUser, verifyAdmin } from "../config/authenticate.js";

const router = express.Router();

/* ===== GET /users (Admin only) ===== */
router.get("/", verifyUser, verifyAdmin, async (req, res) => {
  try {
    const users = await UserData.find().select("-password");

    res.status(200).json({
      count: users.length,
      users
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }
});

export default router;