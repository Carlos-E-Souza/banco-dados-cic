import type { Metadata } from "next";
import AppFooter from "../components/AppFooter";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
	title: "Ouvidoria",
	description: "Canal oficial de comunicação com a ouvidoria institucional.",
};

const HomePage = () => {
	return (
		<div className="min-h-screen bg-white text-neutral-900">
			<div className="flex min-h-screen flex-col">
				<Navbar />
				<main className="flex flex-1 items-center justify-center">
					<HeroSection />
				</main>
				<AppFooter />
			</div>
		</div>
	);
};

export default HomePage;
