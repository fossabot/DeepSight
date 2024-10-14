import { Footer, Navbar } from "@/components";
import HomePage from "./components/HomePage";
import "./home.css";

export const metadata = {
  title: "DeepSight | Home",
};

export default function Home() {
  return (
    <div className="bg-primary-black">
      <Navbar redirects={["", "/login"]} />
      <HomePage />
      <Footer />
    </div>
  );
}
