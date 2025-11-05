import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


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
				<Route path="/" element={<Login />} />
			</Routes>
		</>
	);
}

export default App;
