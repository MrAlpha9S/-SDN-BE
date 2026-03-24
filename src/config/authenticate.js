import jwt from "jsonwebtoken";
import UserData from "../models/UserModel.js";
import QuestionData from "../models/QuestionModel.js";

const JWT_SECRET = process.env.JWT;

export const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  console.log('Token in verifyUser: ', token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" }); // ← return JSON, not redirect
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ===== Verify Admin ===== */
export const verifyAdmin = async (req, res, next) => {
  console.log('admin: ', req.user)
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    next();

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/* ===== Verify Author ===== */
export const verifyAuthor = async (req, res, next) => {
  try {
    const quiz = await QuestionData.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (
      quiz.author.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Access denied. Not your quiz." });
    }

    next();

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/* ===== Author OR Admin ===== */
export const verifyAuthorOrAdmin = async (req, res, next) => {
  try {
    const quiz = await QuestionData.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const isAuthor = quiz.author.toString() === req.user.id.toString(); // ← _id → id
    const isAdmin = req.user.isAdmin;

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    req.quiz = quiz;
    next();

  } catch (err) {
    console.error("verifyAuthorOrAdmin error:", err.message); // ← add this too
    return res.status(500).json({ message: err.message });
  }
};

