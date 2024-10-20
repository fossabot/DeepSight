"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import {
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
} from "@/utils/validation";

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [first_name, setfirst_name] = useState("");
  const [last_name, setlast_name] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      validateEmail(email);
      validatePassword(password);
      validatePasswordConfirmation(password, confirmPassword);

      const response = await apiFetch(
        `/auth/register`,
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            username,
            first_name,
            last_name,
          }),
        },
        false,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }

      try {
        await apiFetch(`/auth/logout`, {
          method: "POST",
        });
        sessionStorage.clear();
      } catch (error) {
        console.error("Error logging out:", error);
      }

      router.push("/login");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="signup-container bg-gray-900">
      <form onSubmit={handleSignup} className="signup-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="First Name"
          value={first_name}
          onChange={(e) => setfirst_name(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={last_name}
          onChange={(e) => setlast_name(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && (
          <div
            className="error-message"
            style={{ color: "red", fontSize: "14px", marginTop: "5px" }}
          >
            {error}
          </div>
        )}
        <button type="submit" className="button_non_transparent">
          Sign Up
        </button>
      </form>
      <p>
        Already have an account?{" "}
        <a href="/login">
          <u>Login</u>
        </a>
      </p>
    </div>
  );
};

export default SignupForm;
