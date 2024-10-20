"use client";

import React, { useState, useEffect } from "react";

const Profile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);

  useEffect(() => {
    const checkSessionData = () => {
      const email = sessionStorage.getItem("email");
      const username = sessionStorage.getItem("username");
      const firstName = sessionStorage.getItem("firstName");
      const lastName = sessionStorage.getItem("lastName");

      if (email && username && firstName && lastName) {
        setEmail(email);
        setUsername(username);
        setFirstName(firstName);
        setLastName(lastName);
        setIsLoading(false);
      }
    };

    checkSessionData();
    const intervalId = setInterval(checkSessionData, 500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="profile-container bg-gray-900">
      <div className="profile-info bg-white p-6 rounded-lg shadow-md text-black">
        <h2 className="text-2xl font-bold mb-4">User Information</h2>
        {isLoading ? (
          <p>Loading user data...</p>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Profile;
