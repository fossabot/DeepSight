import LandingPage from "@/app/components/LandingPage";
import { Navbar, Footer } from "@/components";

export const metadata = {
  title: "DeepSight",
  description: "AI-powered vision solutions for real-world applications.",
};

export default function Home() {
  return (
    <main>
      <Navbar redirects={["", ""]} />
      <LandingPage />
    </main>
  );
}
