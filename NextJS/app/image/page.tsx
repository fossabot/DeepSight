import { Footer, Navbar } from "@/components";
import ImagePage from "./components/ImagePage";
import "./image.css";

export const metadata = {
  title: "DeepSight | Image",
};

export default function Image() {
  return (
    <div className="bg-primary-black">
      <Navbar redirects={["", "/login"]} />
      <ImagePage />
      <Footer />
    </div>
  );
}
