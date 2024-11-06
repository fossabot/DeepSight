"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "@/styles";
import { navVariants } from "@/utils/motion";
import { isAuthenticated, apiFetch } from "@/utils/api";

interface NavbarProps {
  redirects: string[];
}

const Navbar: React.FC<NavbarProps> = ({ redirects }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      isAuthenticated(
        () => {
          setLoggedIn(true);

          const storedProfile = JSON.parse(
            localStorage.getItem("userProfile") || "{}",
          );

          if (storedProfile.first_name) {
            setUserName(storedProfile.first_name);
          } else {
            apiFetch("/user/profile/")
              .then((response) => response.json())
              .then((data) => {
                if (data.success && data.data) {
                  const { first_name, email, username, last_name } = data.data;
                  setUserName(first_name);

                  localStorage.setItem(
                    "userProfile",
                    JSON.stringify({
                      first_name: first_name,
                      last_name: last_name,
                      email: email,
                      username: username,
                    }),
                  );
                }
              })
              .catch((error) => {
                console.error("Failed to fetch user profile:", error);
              });
          }

          if (redirects[0]) {
            router.push(redirects[0]);
          }
        },
        () => {
          setLoggedIn(false);
          if (redirects[1]) {
            router.push(redirects[1]);
          }
        },
      );
    }
  }, [redirects, router]);

  const handleSignOut = async () => {
    try {
      const response = await apiFetch("/auth/logout/", { method: "POST" });
      if (response.ok) {
        setLoggedIn(false);
        if (typeof window !== "undefined") {
          localStorage.clear();
        }
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getButtonStyle = (path: string) => {
    const baseStyle = "text-gray-300 hover:text-white";
    const activeStyle = "bg-white text-black";

    return pathname === path ? activeStyle : baseStyle;
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      whileInView="show"
      className={`py-8 fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-lg px-4 sm:px-8`}
    >
      <div
        className={`${styles.innerWidth} mx-auto flex justify-between items-center gap-6`}
      >
        <div className="flex items-center gap-6">
          <Link href="/" passHref>
            <span className="font-extrabold text-[32px] text-white leading-[40px] cursor-pointer">
              DEEPSIGHT
            </span>
          </Link>
        </div>

        <div className="flex gap-4 items-center">
          {loggedIn && (
            <>
              <Link
                href="/home"
                className={`py-2 px-4 rounded-md transition duration-300 ${getButtonStyle("/home")}`}
              >
                Home
              </Link>
              <Link
                href="/image"
                className={`py-2 px-4 rounded-md transition duration-300 ${getButtonStyle("/image")}`}
              >
                Upload
              </Link>
              <Link
                href="/models"
                className={`py-2 px-4 rounded-md transition duration-300 ${getButtonStyle("/models")}`}
              >
                Browse Models
              </Link>
              <Link
                href="/image/process"
                className={`py-2 px-4 rounded-md transition duration-300 ${getButtonStyle("/image/process")}`}
              >
                Process Image
              </Link>
            </>
          )}

          {loggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md flex items-center gap-2 transition duration-300"
              >
                <span className="font-medium">{userName}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 py-2 w-48 bg-gray-800 rounded-md shadow-lg"
                >
                  {pathname !== "/profile" && (
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition duration-300"
                    >
                      My Profile
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left transition duration-300"
                  >
                    Sign Out
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <>
              {pathname !== "/signup" && (
                <Link
                  href="/signup"
                  className="text-gray-300 hover:text-white py-2 px-4 rounded-md transition duration-300"
                >
                  Sign Up
                </Link>
              )}
              {pathname !== "/login" && (
                <Link
                  href="/login"
                  className="bg-white hover:bg-gray-100 text-black py-2 px-4 rounded-md transition duration-300"
                >
                  Log In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
