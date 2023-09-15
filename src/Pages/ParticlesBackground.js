import Particles from "react-tsparticles";
import particlesOptions from "./components/particles";
import { loadFull } from "tsparticles";

export default function ParticleBackground() {
	const particlesInit = async (main) => {
		console.log(main);
		await loadFull(main);
	};
	const particlesLoaded = (container) => {
		console.log(container);
	};
	return (
		<Particles
			options={particlesOptions}
			id="tsparticles"
			init={particlesInit}
			loaded={particlesLoaded}
		/>
	);
}