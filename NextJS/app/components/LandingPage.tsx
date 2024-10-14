"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  fadeIn,
  slideIn,
  staggerContainer,
  textVariant,
  planetVariants,
} from "@/utils/motion";
import { TypingText, TitleText, StartSteps, Footer } from "@/components";
import styles from "@/styles";
import { startingFeatures, testimonials } from "@/constants";
import { useState, useEffect } from "react";

const LandingPage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 overflow-hidden">
      <section className={`${styles.yPaddings} sm:pl-16 pl-6 relative z-10`}>
        <motion.div
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
          className={`${styles.innerWidth2} mx-auto flex flex-col`}
        >
          <div className="relative z-10 flex flex-col items-center justify-center mb-20 pt-12">
            <motion.h1
              variants={textVariant(1.1)}
              style={{
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                backgroundImage: "linear-gradient(to right, #8A2BE2, #00FFFF)",
              }}
              className={`${styles.heroHeading}`}
            >
              DeepSight
            </motion.h1>
          </div>

          <motion.div
            variants={slideIn("right", "tween", 0.2, 1)}
            className="relative w-full lg:-mt-[30px] md:-mt-[18px] -mt-[15px] 2xl:pl-[280px]"
          >
            <Image
              src="/images/cover.png"
              alt="cover"
              width={1920}
              height={1430}
              className="w-full sm:h-[500px] h-[350px] object-cover rounded-tl-[140px] z-10 relative"
              priority
            />
          </motion.div>
        </motion.div>
      </section>

      <section className={`${styles.paddings} relative z-10`}>
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
            className="mt-[8px] font-normal sm:text-[32px] text-[20px] text-center text-gray-300"
          >
            <span className="font-extrabold text-white"> DeepSight </span> is
            where we bring cutting-edge computer vision technology to life! Our
            platform showcases a range of{" "}
            <span className="font-extrabold text-white">robust models</span>{" "}
            designed to perform complex tasks such as age detection, object
            detection, and more. Our mission is to harness the power of{" "}
            <span className="font-extrabold text-white">
              artificial intelligence
            </span>{" "}
            to deliver accurate, efficient, and user-friendly solutions for
            real-world applications. Whether you&apos;re curious about how AI
            can analyze visual data or you&apos;re looking to integrate these
            powerful tools into your own projects, our website provides a
            glimpse into the{" "}
            <span className="font-extrabold text-white">
              future of intelligent technology.
            </span>{" "}
            Explore, interact, and see our models in action as they demonstrate
            the potential of{" "}
            <span className="font-extrabold text-white">
              robust computer vision systems.
            </span>
          </motion.p>

          <motion.img
            variants={fadeIn("up", "tween", 0.3, 1)}
            src="/images/arrow-down.svg"
            alt="arrow-down"
            className="w-[18px] h-[28px] object-contain mt-[28px]"
          />
        </motion.div>
      </section>

      <section className={`${styles.paddings} relative z-10`}>
        <motion.div
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
          className={`${styles.innerWidth} mx-auto flex lg:flex-row flex-col gap-8`}
        >
          <motion.div
            variants={planetVariants("left")}
            className={`${styles.flexCenter} flex-1`}
          >
            <Image
              src="/images/get-started.png"
              alt="Get-Started"
              width={700}
              height={798}
              className="w-[90%] h-[90%] object-contain"
              priority
            />
          </motion.div>
          <motion.div
            variants={fadeIn("left", "tween", 0.2, 1)}
            className="flex-[0.75] flex justify-center flex-col"
          >
            <TypingText title="| How DeepSight Works " />
            <TitleText title={<> Get Started with just a few clicks </>} />
            <div className="mt-[31px] flex flex-col max-w-[370px] gap-[24px]">
              {startingFeatures.map((features, index) => (
                <StartSteps key={features} number={index + 1} text={features} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className={`${styles.paddings} relative z-10`}>
        <motion.div
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
          className={`${styles.innerWidth} mx-auto flex lg:flex-row flex-col gap-6`}
        >
          <motion.div
            variants={fadeIn("right", "tween", 0.2, 1)}
            style={{
              height: "400px",
              overflow: "hidden",
            }}
            className="flex-[0.4] lg:max-[470px] flex justify-end lg:justify-center flex-col bg-gray-800 sm:p-8 p-4 rounded-[32px] border-[1px] border-gray-700 relative"
          >
            <div>
              <h4 className="font-bold sm:text-[32px] text-[26px] sm:leading-[40px] leading-[36px] text-white">
                {testimonials[currentTestimonial].name}
              </h4>
              <p className="mt-[8px] font-normal sm:text-[18px] text-[12px] sm:leading-[22px] leading-[16px] text-gray-400">
                {testimonials[currentTestimonial].role}
              </p>
            </div>
            <p
              className="mt-[24px] font-normal sm:text-[24px] text-[18px] sm:leading-[45px] leading-[39px] text-gray-200"
              style={{
                display: "-webkit-box",
                height: "100%",
                width: "100%",
              }}
            >
              {testimonials[currentTestimonial].text}
            </p>
          </motion.div>

          <motion.div
            variants={fadeIn("left", "tween", 0.2, 1)}
            className="relative flex-1 flex justify-center item-center"
          >
            <Image
              src="/images/planet.png"
              alt="planet"
              width={1500}
              height={688}
              className="rounded-[40px] w-[102%] h-[102%]"
              priority
            />
          </motion.div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};
export default LandingPage;
