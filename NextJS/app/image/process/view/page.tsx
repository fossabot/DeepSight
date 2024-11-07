import { Footer, Navbar } from "@/components";
import ViewProcessedPage from "./components/ViewProcessedPage";
import "./view.css";

export const metadata = {
  title: "DeepSight | Processed Images",
};

export default function Process() {
  return (
    <div className="bg-primary-black">
      <Navbar redirects={["", "/login"]} />
      <ViewProcessedPage />
      <Footer />
    </div>
  );
}
