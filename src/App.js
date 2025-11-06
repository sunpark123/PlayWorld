import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header/Header";
import PinBall from "./PinBall/PinBall";

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
				<Route path="/PinBall" element={<PinBall />} />

			</Routes>
		</>
	);
}

export default App;
