import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Twozerofoureight from './2048/2048'
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
				<Route path="/" element={<Twozerofoureight />} />
			</Routes>
		</>
	);
}

export default App;
