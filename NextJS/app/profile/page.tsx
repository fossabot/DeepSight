import { Footer, Navbar } from "@/components";
import ProfilePage from "./components/ProfilePage";
import "./profile.css";

export const metadata = {
  title: "DeepSight | Home",
};

export default function Home() {
  return (
    <div className="bg-primary-black">
      <Navbar redirects={["", "/login"]} />
      <ProfilePage />
      <Footer />
    </div>
  );
}
