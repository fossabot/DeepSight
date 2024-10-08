"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles";
import { navVariants } from "../utils/motion";

const Navbar = () => (
  <motion.nav
    variants={navVariants}
    initial="hidden"
    whileInView="show"
    className={`${styles.xPaddings} py-4 fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-lg`}
  >
    <div
      className={`${styles.innerWidth} mx-auto flex justify-between items-center gap-8`}
    >
      <Link href="/" passHref>
        <span className="font-extrabold text-[24px] text-white leading-[30px] cursor-pointer">
          DEEPSIGHT
        </span>
      </Link>

      <div className="flex gap-4">
        <Link
          href="/signup"
          className="bg-white text-black py-2 px-4 rounded-md"
        >
          Sign Up
        </Link>
        <Link
          href="/login"
          className="bg-white text-black py-2 px-4 rounded-md"
        >
          Login
        </Link>
      </div>
    </div>
  </motion.nav>
);

export default Navbar;
