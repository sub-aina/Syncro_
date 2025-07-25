import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NavigationBar = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const isActive = (view) => {
		// Handle root/dashboard case
		if (view === "" && location.pathname === "/dashboard") return true;
		return location.pathname === `/dashboard/${view}`;
	};

	return (
		<nav className="border-b border-white/10 backdrop-blur-sm bg-white/5">
			<div className="max-w-7xl mx-auto px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center space-x-8">
						<h1 className="text-xl font-light tracking-wider">Syncro</h1>
						<div className="hidden md:flex space-x-6">
							<button
								onClick={() => navigate("/dashboard")}
								className={`text-sm font-light tracking-wide transition-colors ${
									isActive("") ? "text-white" : "text-gray-400 hover:text-white"
								}`}
							>
								Overview
							</button>
							<button
								onClick={() => navigate("/dashboard/projects")}
								className={`text-sm font-light tracking-wide transition-colors ${
									isActive("projects")
										? "text-white"
										: "text-gray-400 hover:text-white"
								}`}
							>
								Projects
							</button>
							<button
								onClick={() => navigate("/dashboard/checkins")}
								className={`text-sm font-light tracking-wide transition-colors ${
									isActive("checkins")
										? "text-white"
										: "text-gray-400 hover:text-white"
								}`}
							>
								Check-ins
							</button>
							<button
								onClick={() => navigate("/dashboard/team")}
								className={`text-sm font-light tracking-wide transition-colors ${
									isActive("team")
										? "text-white"
										: "text-gray-400 hover:text-white"
								}`}
							>
								Team
							</button>
						</div>
					</div>
					<div className="flex items-center space-x-4">
						<div className="text-right">
							<p className="text-sm text-gray-300">Welcome back</p>
							<p className="text-xs text-gray-500 tracking-wider">STUDENT</p>
						</div>
						<div className="w-8 h-8 bg-white/10 border border-white/20 rounded-sm flex items-center justify-center">
							<span className="text-sm font-light">S</span>
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default NavigationBar;
