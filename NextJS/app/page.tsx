import Head from "next/head";
import { Footer, Navbar } from "../components";
import { About, Feedback, GetStarted, Hero } from "../sections";

const Page = () => (
  <div className="bg-primary-black overflow-hidden">
    <Head>
      <title>DeepSight</title>{" "}
    </Head>
    <Navbar />
    <Hero />
    <div className="relative">
      <About />
      <div className="gradient-03 z-0" />
    </div>

    <div className="relative">
      <GetStarted />
      <div className="gradient-04 z-0" />
    </div>
    <div className="relative">
      <div className="gradient-04 z-0" />
      <Feedback />
    </div>
    <Footer />
  </div>
);

export default Page;
