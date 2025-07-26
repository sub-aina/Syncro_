import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const ResponsiveNavigation = () => {
	// Uncomment these lines and remove the demo state below
	const navigate = useNavigate();
	const location = useLocation();

	// Demo state - replace with actual router hooks
	const [currentPath, setCurrentPath] = useState("/dashboard");

	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

	const isActive = (view) => {
		// Handle root/dashboard case
		if (view === "" && location.pathname === "/dashboard") return true;
		return location.pathname === `/dashboard/${view}`;
	};

	const toggleMobileSidebar = () => {
		setIsMobileSidebarOpen(!isMobileSidebarOpen);
	};

	const closeMobileSidebar = () => {
		setIsMobileSidebarOpen(false);
	};

	const navigationItems = [
		{ label: "Overview", path: "/dashboard", view: "" },
		{ label: "Projects", path: "/dashboard/projects", view: "projects" },
		{ label: "Check-ins", path: "/dashboard/checkins", view: "checkins" },
		{ label: "Team", path: "/dashboard/team", view: "team" },
	];

	const handleNavigation = (path) => {
		navigate(path);
		closeMobileSidebar();
	};

	return (
		<>
			{/* Desktop Navigation Bar */}
			<nav className="hidden md:block border-b border-white/10 backdrop-blur-sm bg-white/5">
				<div className="max-w-7xl mx-auto px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-8">
							<h1 className="text-xl font-light tracking-wider">Syncro</h1>
							<div className="flex space-x-6">
								{navigationItems.map((item) => (
									<button
										key={item.view}
										onClick={() => handleNavigation(item.path)}
										className={`text-sm font-light tracking-wide transition-colors ${
											isActive(item.view)
												? "text-white"
												: "text-gray-400 hover:text-white"
										}`}
									>
										{item.label}
									</button>
								))}
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<div className="text-right">
								<p className="text-sm text-gray-300">Welcome back</p>
								<p className="text-xs text-gray-500 tracking-wider"></p>
							</div>
							{/* <div className="w-8 h-8 bg-white/10 border border-white/20 rounded-sm flex items-center justify-center">
								<span className="text-sm font-light"></span>
							</div> */}
						</div>
					</div>
				</div>
			</nav>

			{/* Mobile Header */}
			<div className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-sm bg-white/5">
				<div className="flex justify-between items-center h-16 px-4">
					<h1 className="text-xl font-light tracking-wider">Syncro</h1>
					<button
						onClick={toggleMobileSidebar}
						className="p-2 text-gray-400 hover:text-white transition-colors"
					>
						<Menu size={24} />
					</button>
				</div>
			</div>

			{/* Mobile Overlay */}
			{isMobileSidebarOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 md:hidden"
					onClick={closeMobileSidebar}
				/>
			)}

			{/* Mobile Sidebar */}
			<div
				className={`md:hidden fixed left-0 top-0 h-full w-64 bg-black/80 backdrop-blur-sm border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${
					isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex flex-col h-full">
					{/* Mobile Sidebar Header */}
					<div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
						<h1 className="text-xl font-light tracking-wider">Syncro</h1>
						<button
							onClick={closeMobileSidebar}
							className="p-2 text-gray-400 hover:text-white transition-colors"
						>
							<X size={20} />
						</button>
					</div>

					{/* Mobile Navigation */}
					<nav className="flex-1 px-6 py-8">
						<div className="space-y-2">
							{navigationItems.map((item) => (
								<button
									key={item.view}
									onClick={() => handleNavigation(item.path)}
									className={`w-full text-left px-4 py-3 rounded-lg text-sm font-light tracking-wide transition-all duration-200 ${
										isActive(item.view)
											? "text-white bg-white/10 border border-white/20"
											: "text-gray-400 hover:text-white hover:bg-white/5"
									}`}
								>
									{item.label}
								</button>
							))}
						</div>
					</nav>

					{/* Mobile User Section */}
					<div className="px-6 py-6 border-t border-white/10">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
								<span className="text-sm font-light"></span>
							</div>
							<div className="flex-1">
								<p className="text-sm text-gray-300">Welcome back</p>
								<p className="text-xs text-gray-500 tracking-wider"></p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ResponsiveNavigation;
