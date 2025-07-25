const Navigationbar = () => {
	const [activeView, setActiveView] = useState("overview");
	return (
		<nav className="border-b border-white/10 backdrop-blur-sm bg-white/5">
			<div className="max-w-7xl mx-auto px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center space-x-8">
						<h1 className="text-xl font-light tracking-wider">Syncro</h1>
						<div className="hidden md:flex space-x-6">
							<button
								onClick={() => setActiveView("overview")}
								className={`text-sm font-light tracking-wide transition-colors ${
									activeView === "overview"
										? "text-white"
										: "text-gray-400 hover:text-white"
								}`}
							>
								Overview
							</button>
							<button
								onClick={() => setActiveView("projects")}
								className={`text-sm font-light tracking-wide transition-colors ${
									activeView === "projects"
										? "text-white"
										: "text-gray-400 hover:text-white"
								}`}
							>
								Projects
							</button>
							<button
								onClick={() => setActiveView("checkins")}
								className={`text-sm font-light tracking-wide transition-colors ${
									activeView === "checkins"
										? "text-white"
										: "text-gray-400 hover:text-white"
								}`}
							>
								Check-ins
							</button>
							<button
								onClick={() => setActiveView("team")}
								className={`text-sm font-light tracking-wide transition-colors ${
									activeView === "team"
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

export default Navigationbar;
