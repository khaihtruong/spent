import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Middleware to verify JWT token sent by the client
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // attaching the user id to the request object, this will make it available in the endpoints that use this middleware
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// this is a public endpoint because it doesn't have the requireAuth middleware
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/register", async (req, res) => {
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
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
  res.cookie("token", token, { httpOnly: true, maxAge: 15 * 60 * 1000 });

  res.json(newUser);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  // password: 123456
  // user.password: $2b$10$naV1eAwirV13nyBYVS96W..52QzN8U/UQ7mmi/IEEVJDtCAdDmOl2
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const payload = { userId: user.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
  res.cookie("token", token, { httpOnly: true, maxAge: 15 * 60 * 1000 });

  // ensure that the password is not sent to the client
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  res.json(userData);
});

app.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// requireAuth middleware will validate the access token sent by the client and will return the user information within req.auth
app.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true },
  });
  res.json(user);
});

// api for income
app.get("/income", requireAuth, async (req, res) => {
  const userId = req.userId;
  const income = await prisma.Income.findMany({ where: { userId } });
  res.json(income);
});

app.post("/income", requireAuth, async (req, res) => {
  const userId = req.userId;

  const { title } = req.body;

  if (!title) {
    res.status(400).send("title is required");
  } else {
    const newItem = await prisma.Income.create({
      data: {
        title,
        userId,
      },
    });

    res.status(201).json(newItem);
  }
});

app.delete("/income/:id", requireAuth, async (req, res) => {
  const id = req.params.id;
  const deletedIncome = await prisma.income.delete({
    where: {
      id,
    },
  });
  res.json(deletedIncome);
});

app.get("/todos", requireAuth, async (req, res) => {
  const userId = req.userId;
  const expense = await prisma.Expense.findMany({ where: { userId } });
  res.json(expense);
});

app.post("/todos", requireAuth, async (req, res) => {
  const userId = req.userId;

  const { title } = req.body;

  if (!title) {
    res.status(400).send("title is required");
  } else {
    const newItem = await prisma.Expense.create({
      data: {
        title,
        userId,
      },
    });

    res.status(201).json(newItem);
  }
});

app.delete("/todos/:id", requireAuth, async (req, res) => {
  const id = req.params.id;
  const deletedExpense = await prisma.expense.delete({
    where: {
      id,
    },
  });
  res.json(deletedExpense);
});

app.get("/todos/:id", requireAuth, async (req, res) => {
  const id = req.params.id;
  const expense = await prisma.Expense.findUnique({
    where: {
      id,
    },
  });
  res.json(expense);
});

app.put("/todos/:id", requireAuth, async (req, res) => {
  const id = req.params.id;
  const { title } = req.body;
  const updatedExpense = await prisma.Expense.update({
    where: {
      id,
    },
    data: {
      title,
    },
  });
  res.json(updatedExpense);
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});
