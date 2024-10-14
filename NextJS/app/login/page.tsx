import { Footer, Navbar } from "@/components";
import LoginForm from "./components/LoginForm";
import "./login.css";

export const metadata = {
  title: "DeepSight | Login",
};

export default function Login() {
  return (
    <div className="bg-primary-black">
      <Navbar redirects={["/home", ""]} />
      <LoginForm />
      <Footer />
    </div>
  );
}
