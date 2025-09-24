"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Получить все задачи
app.get("/todos", async (req, res) => {
    const todos = await prisma.todo.findMany({ orderBy: { createdAt: "desc" } });
    res.json(todos);
});
// Добавить задачу
app.post("/todos", async (req, res) => {
    const { title } = req.body;
    if (!title)
        return res.status(400).json({ error: "Title is required" });
    const todo = await prisma.todo.create({ data: { title } });
    res.json(todo);
});
// Обновить задачу
app.put("/todos/:id", async (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;
    try {
        const todo = await prisma.todo.update({
            where: { id: Number(id) },
            data: { title, completed },
        });
        res.json(todo);
    }
    catch {
        res.status(404).json({ error: "Not found" });
    }
});
// Удалить задачу
app.delete("/todos/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.todo.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted" });
    }
    catch {
        res.status(404).json({ error: "Not found" });
    }
});
app.get("/", (req, res) => {
    res.send("🚀 Backend работает! Используй /todos для API");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
