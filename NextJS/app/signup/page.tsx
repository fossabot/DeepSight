"use client";
import React, { useState } from "react";
import { Footer, Navbar } from "../../components";
import "./signup.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Signup:", { email, password });
    // Signup logic here
  };

  return (
    <div className="bg-primary-black overflow-hidden">
      <Navbar />
      <div className="signup-container">
        <form onSubmit={handleSignup} className="signup-form">
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
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
      <Footer />
    </div>
  );
};

export default Signup;
