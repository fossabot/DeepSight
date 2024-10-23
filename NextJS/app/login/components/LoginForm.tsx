"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import { validatePassword } from "@/utils/validation";

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      validatePassword(password);

      const response = await apiFetch(
        `/auth/login`,
        {
          method: "POST",
          body: JSON.stringify({ username, password }),
        },
        false,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      sessionStorage.setItem("access", data.access);

      router.push("/home");
    } catch (error: any) {
      if (error.message === "Password is too weak.") {
        setError("Incorrect password");
      }
      else {
        setError(error.message);
      }
    }
  };

  return (
    <div className="login-container bg-gray-900">
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div
          className="error-message"
          style={{ color: "red", fontSize: "14px", marginTop: "5px" }}
        >
          {error}
        </div>
        <button type="submit" className="button_non_transparent">
          Log In
        </button>
      </form>
      <p>
        Don&apos;t have an account?{" "}
        <a href="/signup">
          <u> Sign Up </u>
        </a>
      </p>
    </div>
  );
};

export default LoginForm;
