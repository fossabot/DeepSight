"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "../styles";
import { fadeIn, staggerContainer } from "../utils/motion";

const Feedback: React.FC = () => (
  <section className={`${styles.paddings} relative z-10`}>
    <motion.div
      variants={staggerContainer(0.1, 0.1)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.25 }}
      className={`${styles.innerWidth} mx-auto flex lg:flex-row flex-col gap-6`}
    >
      <div className="flex-[0.4] lg:max-[370px] flex justify-end lg:justify-center flex-col gradient-05 sm:p-8 p-4 rounded-[32px] border-[1px] border-[#6a6a6a] relative">
        <div className="feedback-gradient" />
        <div>
          <h4 className="font-bold sm:text-[32px] text-[26px] sm:leading-[40px] leading-[36px] text-white">
            Adith
          </h4>
          <p className="mt-[8px] font-normal sm:text-[18px] text-[12px] sm:leading-[22px] leading-[16px] text-white">
            Founder of DeepSight
          </p>
        </div>
        <p className="mt-[24px] font-normal sm:text-[24px] text-[18px] sm:leading-[45px] leading-[39px] text-white">
          "With DeepSight, the future of information exploration is here. Our
          cutting-edge AI models break down barriers, providing you with the
          ability to analyze vast amounts of data and uncover hidden
          connections."
        </p>
      </div>

      <motion.div
        variants={fadeIn("left", "tween", 0.2, 1)}
        className="relative flex-1 flex justify-center item-center"
      >
        <Image
          src="/planet.png"
          alt="planet"
          width={1500}
          height={688}
          className="rounded-[40px]"
          priority
        />
      </motion.div>
    </motion.div>
  </section>
);

export default Feedback;
