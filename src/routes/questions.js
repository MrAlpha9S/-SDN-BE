import { Router } from "express";
import QuestionData from "../models/QuestionModel.js";
import axios from "axios";
import { verifyUser, verifyAuthor, verifyAdmin, verifyAuthorOrAdmin } from "../config/authenticate.js";

const router = Router();

// List
router.get("/", verifyUser, async (req, res) => {
  const quizzes = await QuestionData.find();

  const questions = quizzes.flatMap(quiz =>
    quiz.questions.map(question => ({
      ...question.toObject(),
      quizId: quiz._id,
      quizTitle: quiz.title
    }))
  );

  res.render("questions/list", {
    title: "Question List",
    questions: questions
  });
});

// Create form
router.get("/create", verifyUser, async (req, res) => {
  const quizzes = await QuestionData.find();

  res.render("questions/create", {
    title: "Create Question",
    quizzes
  });
});

router.post("/create", verifyUser, async (req, res) => {
  try {
    const { quizId, text, options, correctAnswerIndex, keywords } = req.body;

    const quiz = await QuestionData.findById(quizId);

    if (!quiz) return res.status(404).send("Quiz not found");

    quiz.questions.push({
      text,
      options: options.filter(o => o.trim() !== ""),
      correctAnswerIndex: Number(correctAnswerIndex),
      keywords: keywords
        ? keywords.split(",").map(k => k.trim())
        : []
    });

    await quiz.save();

    res.redirect("/questions");

  } catch (err) {
    console.error(err);
    res.status(500).send("Create failed");
  }
});

// Edit form
router.get("/edit/:quizId/:questionId", verifyAuthorOrAdmin, async (req, res) => {
  const { quizId, questionId } = req.params;

  try {
    const quiz = await QuestionData.findById(quizId);
    const quizzes = await QuestionData.find();

    if (!quiz) return res.send("Quiz not found");

    const question = quiz.questions.id(questionId);

    if (!question) return res.send("Question not found");

    res.render("questions/edit", {
      title: "Edit Question",
      question,
      quizId,
      quizzes
    });

  } catch (err) {
    console.error(err);
    res.send("Error");
  }
});

router.post("/edit/:quizId/:questionId", verifyAuthorOrAdmin, async (req, res) => {
  const { quizId, questionId } = req.params;
  const { newQuizId, text, options, correctAnswerIndex, keywords } = req.body;

  try {
    const oldQuiz = await QuestionData.findById(quizId);
    const question = oldQuiz.questions.id(questionId);

    if (!question) return res.send("Question not found");

    const updatedData = {
      text,
      options: options.filter(o => o.trim() !== ""),
      correctAnswerIndex: Number(correctAnswerIndex),
      keywords: keywords ? keywords.split(",").map(k => k.trim()) : []
    };

    // 🔥 if quiz changed → move question
    if (newQuizId !== quizId) {
      question.deleteOne();
      await oldQuiz.save();

      const newQuiz = await QuestionData.findById(newQuizId);
      newQuiz.questions.push(updatedData);
      await newQuiz.save();
    } else {
      Object.assign(question, updatedData);
      await oldQuiz.save();
    }

    res.redirect("/questions");

  } catch (err) {
    console.error(err);
    res.send("Update failed");
  }
});


router.post("/delete/:quizId/:questionId", verifyAuthorOrAdmin, async (req, res) => {
  try {
    const { quizId, questionId } = req.params;

    const quiz = await QuestionData.findByIdAndUpdate(
      quizId,
      {
        $pull: {
          questions: { _id: questionId }
        }
      },
      { new: true }
    );

    await quiz.save();

    res.redirect(`/questions`);

  } catch (error) {
    console.log(error);
    res.status(500).send("Delete failed");
  }
});

export default router;