'use client';

import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { Todo } from "../types";
import { useRouter } from "next/navigation"; 
import cls from './page.module.scss'

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login"); 
      return;
    }

    fetch("http://localhost:5001/todos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTodos(data));
  }, [router]);

  const fetchTodos = async () => {
    try {
      const res = await api.get<Todo[]>("/todos");
      setTodos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async () => {
    if (!newTodo) return;
    try {
      const res = await api.post<Todo>("/todos", { title: newTodo });
      setTodos([res.data, ...todos]);
      setNewTodo("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTodo = async (id: number) => {
    if (!editTitle) return;
    try {
      const res = await api.put<Todo>(`/todos/${id}`, { title: editTitle });
      setTodos(todos.map((t) => (t.id === id ? res.data : t)));
      setEditId(null);
      setEditTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleExitClick = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <div>
      <div className={cls.header}>
        <div className={cls.header__title} onClick={() => router.push("/")}>
          <h2>Todo-App</h2>
        </div>
        <div className={cls.header__exit} onClick={handleExitClick}>exit</div>
      </div>
      <div className={cls.main}>
        <div className={cls.main__form}>
          <input
            className={cls.main__form__input}
            type="text"
            placeholder="Новая задача"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <div className={cls.main__form__addClick} onClick={handleAddTodo}>
            Добавить
          </div>
        </div>

        <ul className={cls.main__todos}>
          {todos.map((todo) => (
            <li key={todo.id} style={{ marginBottom: 10 }} className={cls.main__todos__todo}>
              {editId === todo.id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <div className={cls.buttons}>
                    <button onClick={() => handleUpdateTodo(todo.id)} className={cls.first_button}>Сохранить</button>
                    <button onClick={() => setEditId(null)} className={cls.second_button}>Отмена</button>
                  </div>
                </>
              ) : (
                <>
                  <span
                    style={{
                      textDecoration: todo.completed ? "line-through" : "none",
                      marginLeft: 8,
                    }}
                  >
                    {todo.title}
                  </span>
                  <div className={cls.buttons}>
                    <button
                      className={cls.first_button}
                      onClick={() => {
                        setEditId(todo.id);
                        setEditTitle(todo.title);
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      Редактировать
                    </button>
                    <button
                      className={cls.second_button}
                      onClick={() => handleDeleteTodo(todo.id)}
                      style={{ marginLeft: 4 }}
                    >
                      Удалить
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
