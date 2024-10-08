"use client";

import { motion } from "framer-motion";
import { TypingText } from "../components";
import styles from "../styles";
import { fadeIn, staggerContainer } from "../utils/motion";

const About: React.FC = () => (
  <section className={`${styles.paddings} relative z-10`}>
    <div className="gradient-02 z-0" />

    <motion.div
      variants={staggerContainer(0.1, 0.1)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.25 }}
      className={`${styles.innerWidth} mx-auto ${styles.flexCenter} flex-col`}
    >
      <TypingText title="| About DeepSight" textStyles="text-center" />

      <motion.p
        variants={fadeIn("up", "tween", 0.2, 1)}
        className="mt-[8px] font-normal sm:text-[32px] text-[20px] text-center text-secondary-white"
      >
        <span className="font-extrabold"> DeepSight </span> This where we bring
        cutting-edge computer vision technology to life! Our platform showcases
        a range of <span className="font-extrabold">robust models</span>{" "}
        designed to perform complex tasks such as age detection, object
        detection, and more. Our mission is to harness the power of{" "}
        <span className="font-extrabold">artificial intelligence</span> to
        deliver accurate, efficient, and user-friendly solutions for real-world
        applications. Whether you're curious about how AI can analyze visual
        data or you're looking to integrate these powerful tools into your own
        projects, our website provides a glimpse into the{" "}
        <span className="font-extrabold">
          future of intelligent technology.
        </span>{" "}
        Explore, interact, and see our models in action as they demonstrate the
        potential of{" "}
        <span className="font-extrabold">robust computer vision systems.</span>
      </motion.p>

      <motion.img
        variants={fadeIn("up", "tween", 0.3, 1)}
        src="/arrow-down.svg"
        alt="arrow-down"
        className="w-[18px] h-[28px] object-contain mt-[28px]"
      />
    </motion.div>
  </section>
);

export default About;
