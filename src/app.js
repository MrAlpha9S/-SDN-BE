import "./config/config.js";

import express, { urlencoded, json, static as expressStatic } from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import connectDB from "./config/db.js";
import {verifyUser} from "./config/authenticate.js"

import { authMiddleware } from "./middleware/auth.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";

import indexRouter from "./routes/index.js";
import quizRouter from "./routes/quiz.js";
import questionRouter from "./routes/questions.js";

import cookieParser from "cookie-parser";
import cors from "cors"

const JWT_SECRET = process.env.JWT;
console.log('JWT: ', JWT_SECRET)

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // D:\VSCode\SDN\AS2\src

const app = express();

const PORT = process.env.PORT || 3000;
const FE = process.env.FE;
console.log('FE: ', FE)

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  FE
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(urlencoded({ extended: true }));
app.use(json());
// serve static assets from the public directory (go up one level from src/)
app.use(expressStatic(join(__dirname, "..", "public")));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use("/auth", authRouter);

// protect all quiz routes

app.use("/", indexRouter);
app.use("/quizzes", quizRouter);
app.use("/questions", verifyUser, questionRouter);
app.use("/users", usersRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});