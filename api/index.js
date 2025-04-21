import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";

const allowedOrigins = [
  "http://localhost:3000",
  "https://spent-beta.vercel.app",
  "https://spent-bk8wb3w1y-khaihtruongs-projects.vercel.app",
];

const app = express();
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

function requireAuth(req, res, next) {
  const token = req.cookies.token;
  console.log("Auth cookie received:", token);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    console.error("JWT Verification Failed:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, email: true, name: true },
    });

    const payload = { userId: newUser.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    console.log("JWT Token Created (register):", token);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });

    res.json(newUser);
  } catch (err) {
    console.error("Register error:", err);
    res
      .status(500)
      .json({ error: "An error occurred while registering the user" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    console.log("JWT Token Created (login):", token);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    res.json(userData);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred while logging in" });
  }
});

app.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

app.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true },
  });
  res.json(user);
});

app.get("/budget", requireAuth, async (req, res) => {
  const userId = req.userId;

  try {
    const incomes = await prisma.income.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ incomes, expenses });
  } catch (error) {
    console.error("Error loading budget data:", error);
    res.status(500).json({ error: "Failed to load budget data" });
  }
});

app.post("/income", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { title, amount } = req.body;

  if (!title || typeof amount !== "number") {
    return res.status(400).json({ error: "Missing title or amount" });
  }

  const newIncome = await prisma.income.create({
    data: { title, amount, userId },
  });

  res.status(201).json(newIncome);
});

app.post("/expense", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { title, amount } = req.body;

  if (!title || typeof amount !== "number") {
    return res.status(400).json({ error: "Missing title or amount" });
  }

  const newExpense = await prisma.expense.create({
    data: { title, amount, userId },
  });

  res.status(201).json(newExpense);
});

app.delete("/income/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const deleted = await prisma.income.delete({ where: { id } });
    res.json(deleted);
  } catch (error) {
    console.error("Error deleting income:", error);
    res.status(404).json({ error: "Income not found" });
  }
});

app.delete("/expense/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const deleted = await prisma.expense.delete({ where: { id } });
    res.json(deleted);
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(404).json({ error: "Expense not found" });
  }
});

app.put("/income/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, amount } = req.body;

  if (!title || isNaN(amount)) {
    return res
      .status(400)
      .json({ error: "Title and valid amount are required." });
  }

  try {
    const updatedIncome = await prisma.income.update({
      where: { id },
      data: {
        title,
        amount,
      },
    });
    res.status(200).json(updatedIncome);
  } catch (error) {
    console.error("Error updating income:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Income not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/expense/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, amount } = req.body;

  if (!title || isNaN(amount)) {
    return res
      .status(400)
      .json({ error: "Title and valid amount are required." });
  }

  try {
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        title,
        amount,
      },
    });
    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}🎉 🚀`);
});
