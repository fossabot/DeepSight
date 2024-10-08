"use client";
import React, { useState } from "react";
import { Footer, Navbar } from "../../components";
import "./login.css";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", { email, password });
    // Login logic here
  };

  return (
    <div className="bg-primary-black">
      <Navbar />
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="button_non_transparent">
            Let&apos;s Get Started
          </button>
        </form>
        <p>
          Don&apos;t have an account?{" "}
          <a href="/signup">
            <u> Sign Up </u>
          </a>
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
