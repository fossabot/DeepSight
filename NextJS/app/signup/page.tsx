import { Footer, Navbar } from "@/components";
import SignupForm from "./components/SignupForm";
import "./signup.css";

export const metadata = {
  title: "DeepSight | Sign Up",
};

export default function Signup() {
  return (
    <div className="bg-primary-black overflow-hidden">
      <Navbar redirects={["", ""]} />
      <SignupForm />
      <Footer />
    </div>
  );
}
