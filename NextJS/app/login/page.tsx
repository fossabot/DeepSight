"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Footer, Navbar } from "../../components";
import "./login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken");
    if (authToken) {
      const fetchUserData = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/user`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            },
          );

          if (response.ok) {
            router.push("/home");
          } else {
            sessionStorage.removeItem("authToken");
          }
        } catch (error: any) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      validatePassword(password);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.sucess) {
        throw new Error(data.message || "Something went wrong");
      }

      sessionStorage.setItem("authToken", data.data.token);
      router.push("/home");
    } catch (error: any) {
      setError(error.message);
    }
  };

  const validatePassword = (password: string) => {
    if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      )
    ) {
      throw new Error("Password is incorrect");
    }
  };

  return (
    <div className="bg-primary-black">
      <Navbar />
      <div className="login-container">
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
