import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lobby from './Lobby/Lobby'

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
				<Route path="/" element={<Lobby />} />
				<Route path="/" element={<Lobby />} />
				
			</Routes>
		</>
	);
}

export default App;
