import { useState } from "react";
import Header from "../Header/Header";
import "./Lobby.css"

function Lobby() {

	const [style, setStyle] = useState({});

	const handleMouseMove = (number, e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const rotateX = (y / rect.height - 0.5) * 20;
		const rotateY = (x / rect.width - 0.5) * -20;
		
		setStyle({
			number: number,
			transform: `perspective(350px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
			background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2), transparent 60%)`,
		});
	};

	const resetStyle = (n) => setStyle({number:n, transform: "perspective(350px) rotateX(0deg) rotateY(0deg)", trastransition: `all 3s` });
	return (
		<>
            <Header />
			<div className="Lobby">
				<div className="lobbyBox">
					<div className="lobbyButton" onMouseMove={(e) => handleMouseMove(1, e)}  onMouseLeave={() => resetStyle(1)} style={{
						transform: (style.number === 1) ? style.transform : 'none',
						background: (style.number === 1) ? style.background : 'rgba(255, 255, 255, 0.075);'
					}}>
						<img src="puzzle.png" alt="gameIcon"></img>
						<h1>GAme</h1>
						<p>GameisGOGOGO</p>
					</div>
					<div className="lobbyButton" onMouseMove={(e) => handleMouseMove(2, e)}  onMouseLeave={() => resetStyle(2)} style={{
						transform: (style.number === 2) ? style.transform : 'none',
						background: (style.number === 2) ? style.background : 'rgba(255, 255, 255, 0.075);'
					}}>
						<img src="puzzle.png" alt="gameIcon"></img>
						<h1>GAme</h1>
						<p>GameisGOGOGO</p>
					</div>
				</div>
				<div className="lobbyBox">
					<div className="lobbyButton" onMouseMove={(e) => handleMouseMove(3, e)}  onMouseLeave={() => resetStyle(3)} style={{
						transform: (style.number === 3) ? style.transform : 'none',
						background: (style.number === 3) ? style.background : 'rgba(255, 255, 255, 0.075);'
					}}>
						<img src="puzzle.png" alt="gameIcon"></img>
						<h1>GAme</h1>
						<p>GameisGOGOGO</p>
					</div>
					<div className="lobbyButton" onMouseMove={(e) => handleMouseMove(4, e)}  onMouseLeave={() => resetStyle(4)} style={{
						transform: (style.number === 4) ? style.transform : 'none',
						background: (style.number === 4) ? style.background : 'rgba(255, 255, 255, 0.075);'
					}}>
						<img src="puzzle.png" alt="gameIcon"></img>
						<h1>GAme</h1>
						<p>GameisGOGOGO</p>
					</div>
				</div>
			</div>
        </>
	);
}

export default Lobby;
