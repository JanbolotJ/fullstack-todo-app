"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5001/auth/login", {
        email,
        password,
      });

      const token = res.data.token;
      const expireTime = new Date().getTime() + 24 * 60 * 60 * 1000; // +1 день

      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpire", expireTime.toString());

      router.push("/");
    } catch (err) {
      alert("Ошибка входа");
      console.log(err);
    }
  };

  return (
    <div>
      <h1>Вход</h1>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Войти</button>
    </div>
  );
}
