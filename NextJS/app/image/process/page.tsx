import { Footer, Navbar } from "@/components";
import ProcessPage from "./components/ProcessPage";
import "./process.css";

export const metadata = {
  title: "DeepSight | Process",
};

export default function Process() {
  return (
    <div className="bg-primary-black">
      <Navbar redirects={["", "/login"]} />
      <ProcessPage />
      <Footer />
    </div>
  );
}
