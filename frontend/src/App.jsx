import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuthForm from "./components/authform";
import Dashboard from "./components/Dashboard";
import CreateProject from "./components/createProject";
import ProjDashboard from "./components/projDashboard";
import DailyCheckin from "./components/DailyCheckin";
import TeamResources from "./components/Resources";

import socket from "./socket";

function App() {
	const [isSocketReady, setIsSocketReady] = useState(false);
	const token = localStorage.getItem("token");

	let user = null;
	try {
		const userStr = localStorage.getItem("user");
		if (userStr && userStr !== "undefined") {
			user = JSON.parse(userStr);
		}
	} catch (_) {}

	const userId = user?._id || user?.id;

	useEffect(() => {
		if (!token || !userId) return;

		const registerSocket = () => {
			socket.emit("register", userId);
		};

		if (socket.connected) {
			registerSocket();
		} else {
			socket.on("connect", () => {
				registerSocket();
				setIsSocketReady(true);
			});
		}

		socket.on("registered", () => {
			// toast.success(`Welcome back ${user?.name || "User"}!`);
		});

		socket.on("notification", (data) => {
			toast.info(data.message, {
				position: "bottom-right",
				autoClose: 4000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
		});

		socket.on("disconnect", () => setIsSocketReady(false));

		return () => {
			socket.off("connect");
			socket.off("registered");
			socket.off("notification");
			socket.off("disconnect");
			socket.off("connect_error");
		};
	}, [token, userId]);

	return (
		<Router>
			<Routes>
				<Route path="/" element={<AuthForm />} />
				<Route
					path="/dashboard/*"
					element={token ? <Dashboard /> : <Navigate to="/" />}
				/>
				<Route path="/create-project" element={<CreateProject />} />
				<Route path="/project-Dashboard" element={<ProjDashboard />} />
				<Route path="/daily-checkin" element={<DailyCheckin />} />
				<Route path="/team/:teamId/resources" element={<TeamResources />} />
			</Routes>

			<ToastContainer
				position="bottom-right"
				autoClose={4000}
				hideProgressBar={false}
				newestOnTop={true}
				closeOnClick
				pauseOnHover
				draggable
				theme="dark"
			/>
		</Router>
	);
}

export default App;
