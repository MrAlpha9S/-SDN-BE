import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Question Schema (Subdocument)
 */
const QuestionSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v.length >= 2;
        },
        message: "A question must have at least 2 options"
      }
    },

    keywords: {
      type: [String],
      default: []
    },

    correctAnswerIndex: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return value >= 0 && value < this.options.length;
        },
        message: "correctAnswerIndex must match an index in options array"
      }
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData"
    }
  },
  {
    _id: true, // keep ObjectId for each question
    timestamps: false
  }
);

/**
 * Quiz Schema
 */
const QuizSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    questions: {
      type: [QuestionSchema],
      default: []
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("QuestionData", QuizSchema, "A1");
