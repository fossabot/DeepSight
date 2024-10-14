"use client";

import React from "react";

const Home: React.FC = () => {
  const email =
    typeof window !== "undefined" ? sessionStorage.getItem("email") : null;
  const username =
    typeof window !== "undefined" ? sessionStorage.getItem("username") : null;
  const firstName =
    typeof window !== "undefined" ? sessionStorage.getItem("firstName") : null;
  const lastName =
    typeof window !== "undefined" ? sessionStorage.getItem("lastName") : null;

  return (
    <div className="home-container bg-gray-900">
      <div className="home-info bg-white p-6 rounded-lg shadow-md text-black">
        <h2 className="text-2xl font-bold mb-4">User Information</h2>
        <ul>
          {email && (
            <li>
              <strong>Email:</strong> {email}
            </li>
          )}
          {username && (
            <li>
              <strong>Username:</strong> {username}
            </li>
          )}
          {firstName && (
            <li>
              <strong>First Name:</strong> {firstName}
            </li>
          )}
          {lastName && (
            <li>
              <strong>Last Name:</strong> {lastName}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Home;
