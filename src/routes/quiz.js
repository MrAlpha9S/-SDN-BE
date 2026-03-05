import express from "express";
import QuestionData from "../models/QuestionModel.js";
import {
  verifyUser,
  verifyAuthorOrAdmin,
} from "../config/authenticate.js";

const router = express.Router();

// GET all quizzes
router.get("/", verifyUser, async (req, res) => {
  try {
    const quizzes = await QuestionData.find();
    return res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single quiz by ID
router.get("/:id", verifyUser, async (req, res) => {
  try {
    const quiz = await QuestionData.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    return res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create quiz
router.post("/create", verifyUser, async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    const newQuiz = new QuestionData({
      title,
      description,
      questions: questions || [],
      author: req.user.id,
    });

    const saved = await newQuiz.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create quiz" });
  }
});

// PUT update quiz
router.put("/update/:id", verifyAuthorOrAdmin, async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    const updated = await QuestionData.findByIdAndUpdate(
      req.params.id,
      { title, description, questions },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Quiz not found" });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
});

// DELETE quiz
router.delete("/:id", verifyAuthorOrAdmin, async (req, res) => {
  try {
    const deleted = await QuestionData.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Quiz not found" });
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error.message); // ← change this
    res.status(500).json({ message: error.message }); // ← return actual error
  }
});

export default router;