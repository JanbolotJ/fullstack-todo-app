'use client'

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Расширяем интерфейс Request
declare module "express-serve-static-core" {
  interface Request {
    user?: { userId: number };
  }
}

                                    // АУТЕНТИФИКАЦИЯ 

// Регистрация
app.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email и пароль обязательны" });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser)
    return res.status(400).json({ error: "Пользователь уже существует" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  res.json({ message: "Регистрация успешна", user: { id: user.id, email } });
});

// Логин
app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Неверный email или пароль" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Неверный email или пароль" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Middleware аутентификации
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Нет токена" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Неверный или истекший токен" });
  }
};

// Профиль пользователя
app.get("/profile", authMiddleware, async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });

  res.json({ id: user.id, email: user.email });
});

                              // TODO 

// Получить все задачи
app.get("/todos", async (req: Request, res: Response) => {
  const todos = await prisma.todo.findMany({ orderBy: { createdAt: "desc" } });
  res.json(todos);
});

// Добавить задачу
app.post("/todos", async (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const todo = await prisma.todo.create({ data: { title } });
  res.json(todo);
});

// Обновить задачу
app.put("/todos/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  try {
    const todo = await prisma.todo.update({
      where: { id: Number(id) },
      data: { title, completed },
    });
    res.json(todo);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// Удалить задачу
app.delete("/todos/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.todo.delete({ where: { id: Number(id) } });
    res.json({ message: "Deleted" });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// финал
app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Backend работает! Используй /todos для API");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
