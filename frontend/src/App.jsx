import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import AuthForm from "./components/authform";
import Dashboard from "./components/Dashboard";
import CreateProject from "./components/createProject";
import ProjDashboard from "./components/projDashboard";
import DailyCheckin from "./components/DailyCheckin";
function App() {
	const token = localStorage.getItem("token");
	return (
		<Router>
			<Routes>
				<Route path="/" element={<AuthForm />} />
				<Route
					path="/dashboard"
					element={token ? <Dashboard /> : <Navigate to="/" />}
				/>
				<Route path="/create-project" element={<CreateProject />} />
				<Route path="/project-Dashboard" element={<ProjDashboard />} />
				<Route path="/daily-checkin" element={<DailyCheckin />} />
			</Routes>
		</Router>
	);
}

export default App;
