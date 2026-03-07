import "./config/config.js";

import express, { urlencoded, json, static as expressStatic } from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import connectDB from "./config/db.js";

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

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;
const FE = process.env.FE;

connectDB();

app.use(urlencoded({ extended: true }));
app.use(json());
// serve static assets from the public directory (go up one level from src/)
app.use(expressStatic(join(__dirname, "..", "public")));
app.use(cookieParser());

app.use(cors({
    origin: FE,
    credentials: true
}));

app.use(express.json());

app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use("/auth", authRouter);

// protect all quiz routes

app.use("/", indexRouter);
app.use("/quizzes", quizRouter);
app.use("/questions", questionRouter);
app.use("/users", usersRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}/`);
});