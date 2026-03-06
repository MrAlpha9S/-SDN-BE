import express from "express";
import UserData from "../models/UserModel.js";
import { verifyAdmin } from "../config/authenticate.js";

const router = express.Router();

/* ===== GET /users (Admin only) ===== */
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const users = await UserData.find().select("-password");
    res.status(200).json({ count: users.length, users });
  } catch (err) {
    console.error("GET /users error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* ===== PATCH /users/:id/admin — Toggle isAdmin (Admin only) ===== */
router.patch("/:id/admin", verifyAdmin, async (req, res) => {
  try {
    const { isAdmin } = req.body;

    if (typeof isAdmin !== "boolean") {
      return res.status(400).json({ message: "isAdmin must be a boolean" });
    }

    const user = await UserData.findByIdAndUpdate(
      req.params.id,
      { isAdmin },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("PATCH /users/:id/admin error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* ===== DELETE /users/:id (Admin only) ===== */
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const user = await UserData.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE /users/:id error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;