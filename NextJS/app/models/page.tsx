import { Footer, Navbar } from "@/components";
import ModelsPage from "./components/ModelsPage";
import "./models.css";

export const metadata = {
  title: "DeepSight | Models",
};

export default function Home() {
  return (
    <div className="bg-primary-black">
      <Navbar redirects={["", ""]} />
      <ModelsPage />
      <Footer />
    </div>
  );
}
