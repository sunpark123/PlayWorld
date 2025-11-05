import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lobby from './Lobby/Lobby'
import Header from "./Header/Header";
import Map from "./Map/Map";

function App() {
	
  return (
		<Router>
			<AppContent />
		</Router>
	);
}

function AppContent() {

	return (
		<>	
			<Routes>
				<Route path="/header" element={<Header />} />
				<Route path="/" element={<Lobby />} />
				<Route path="/Map" element={<Map />} />
			</Routes>
		</>
	);
}

export default App;
