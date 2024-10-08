"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "../styles";
import { slideIn, staggerContainer, textVariant } from "../utils/motion";

const Hero: React.FC = () => (
  <section className={`${styles.yPaddings} sm:pl-16 pl-6`}>
    <motion.div
      variants={staggerContainer(0.1, 0.1)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.25 }}
      className={`${styles.innerWidth2} mx-auto flex flex-col`}
    >
      <div className="relative z-10 flex flex-col items-center justify-center mb-20">
        <motion.h1 variants={textVariant(1.1)} className={styles.heroHeading}>
          DeepSight
        </motion.h1>
      </div>

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className="relative w-full lg:-mt-[30px] md:-mt-[18px] -mt-[15px]  2xl:pl-[280px]"
      >
        <div className="absolute w-full h-[300px] hero-gradient rounded-tl-[140px] z-[0] sm:-top-[20px] -top-[10px]" />
        <Image
          src="/cover.png"
          alt="cover"
          width={1920}
          height={1430}
          className="w-full sm:h-[500px] h-[350px] object-cover rounded-tl-[140px] z-10 relative"
        />

        <a href="#explore"></a>
      </motion.div>
    </motion.div>
  </section>
);

export default Hero;
