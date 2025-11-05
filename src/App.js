import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lobby from './Lobby/Lobby'
import Header from "./Header/Header";

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
			</Routes>
		</>
	);
}

export default App;
