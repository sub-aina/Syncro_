import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import CheckinDashboard from "./checkindash";

const Dashboard = () => {
	const [projects, setProjects] = useState([]);
	const [activeView, setActiveView] = useState("overview");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchprojects = async () => {
			try {
				const token = localStorage.getItem("token");
				console.log("Token just before fetch:", localStorage.getItem("token"));

				const response = await API.get("/projects", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setProjects(response.data);
			} catch (error) {
				console.error("Error fetching projects:", error);
			}
		};
		fetchprojects();
	}, []);

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "bg-green-500";
			case "planning":
				return "bg-yellow-500";
			case "completed":
				return "bg-purple-500";
			default:
				return "bg-gray-500";
		}
	};

	const getStatusTextColor = (status) => {
		switch (status) {
			case "active":
				return "text-green-400";
			case "planning":
				return "text-yellow-400";
			case "completed":
				return "text-purple-400";
			default:
				return "text-gray-400";
		}
	};

	const NavigationBar = () => (
		<nav className="border-b border-white/10 backdrop-blur-sm bg-white/5">
			<div className="max-w-7xl mx-auto px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center space-x-8">
						<h1 className="text-xl font-light tracking-wider">DAPPR</h1>
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

	const OverviewView = () => (
		<div className="space-y-8">
			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-xs tracking-wider uppercase mb-2">
								Total Projects
							</p>
							<p className="text-3xl font-light">{projects.length}</p>
						</div>
						<div className="w-12 h-12 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center">
							<svg
								className="w-6 h-6 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1}
									d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
								/>
							</svg>
						</div>
					</div>
				</div>

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-xs tracking-wider uppercase mb-2">
								Active
							</p>
							<p className="text-3xl font-light">
								{projects.filter((p) => p.status === "active").length}
							</p>
						</div>
						<div className="w-12 h-12 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center">
							<svg
								className="w-6 h-6 text-green-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1}
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
					</div>
				</div>

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-xs tracking-wider uppercase mb-2">
								Planning
							</p>
							<p className="text-3xl font-light">
								{projects.filter((p) => p.status === "planning").length}
							</p>
						</div>
						<div className="w-12 h-12 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center">
							<svg
								className="w-6 h-6 text-yellow-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1}
									d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m0 0V3m0 0h2m-2 0h-2"
								/>
							</svg>
						</div>
					</div>
				</div>

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-xs tracking-wider uppercase mb-2">
								Completed
							</p>
							<p className="text-3xl font-light">
								{projects.filter((p) => p.status === "completed").length}
							</p>
						</div>
						<div className="w-12 h-12 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center">
							<svg
								className="w-6 h-6 text-purple-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
					</div>
				</div>
			</div>

			{/* Recent Activity */}
			<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm">
				<h3 className="text-lg font-light tracking-wide mb-6">
					Recent Activity
				</h3>
				<div className="space-y-4">
					<div className="flex items-center space-x-4 text-sm">
						<div className="w-2 h-2 bg-green-400 rounded-full"></div>
						<span className="text-gray-300">
							Project Alpha progress updated to 75%
						</span>
						<span className="text-gray-500 text-xs ml-auto">2 hours ago</span>
					</div>
					<div className="flex items-center space-x-4 text-sm">
						<div className="w-2 h-2 bg-blue-400 rounded-full"></div>
						<span className="text-gray-300">
							New team member added to Project Beta
						</span>
						<span className="text-gray-500 text-xs ml-auto">5 hours ago</span>
					</div>
					<div className="flex items-center space-x-4 text-sm">
						<div className="w-2 h-2 bg-purple-400 rounded-full"></div>
						<span className="text-gray-300">
							Project Gamma marked as completed
						</span>
						<span className="text-gray-500 text-xs ml-auto">1 day ago</span>
					</div>
				</div>
			</div>
		</div>
	);

	const ProjectsView = () => (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-light tracking-wider">Projects</h2>
					<p className="text-gray-500 text-sm tracking-wide mt-1">
						Manage your active workspace
					</p>
				</div>
				<button
					onClick={() => navigate("/create-project")}
					className="border border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-sm font-light tracking-wide transition-all duration-300 group flex items-center space-x-2"
				>
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/>
					</svg>
					<span>NEW PROJECT</span>
				</button>
			</div>

			<div className="border border-white/10 backdrop-blur-sm bg-white/5 rounded-sm">
				{projects.length === 0 ? (
					<div className="text-center py-16">
						<div className="w-16 h-16 border border-white/10 bg-white/5 rounded-sm flex items-center justify-center mx-auto mb-6">
							<svg
								className="w-8 h-8 text-gray-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1}
									d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
								/>
							</svg>
						</div>
						<p className="text-gray-400 text-lg font-light tracking-wide">
							No projects found
						</p>
						<p className="text-gray-500 text-sm tracking-wide mt-2">
							Create your first project to get started
						</p>
					</div>
				) : (
					<div className="divide-y divide-white/10">
						{projects.map((project) => (
							<div
								key={project._id}
								onClick={() => navigate("/project-dashboard")}
								className="p-6 hover:bg-white/5 cursor-pointer transition-all duration-300 group"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 border border-white/10 bg-white/5 rounded-sm flex items-center justify-center group-hover:bg-white/10 transition-all duration-300">
											<svg
												className="w-6 h-6 text-gray-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={1}
													d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
												/>
											</svg>
										</div>
										<div className="flex-1">
											<h3 className="text-lg font-light text-white tracking-wide">
												{project.name}
											</h3>
											<p className="text-gray-400 text-sm mt-1">
												{project.description}
											</p>
											<div className="flex items-center space-x-4 mt-2">
												<div className="flex items-center space-x-2">
													<div
														className={`w-2 h-2 rounded-full ${getStatusColor(
															project.status
														)}`}
													></div>
													<span
														className={`text-xs tracking-wider uppercase ${getStatusTextColor(
															project.status
														)}`}
													>
														{project.status}
													</span>
												</div>
												<span className="text-gray-500 text-xs tracking-wide">
													{project.members} members
												</span>
											</div>
										</div>
									</div>
									<div className="flex items-center space-x-6">
										<div className="flex items-center space-x-3">
											<div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
												<div
													className="h-full bg-purple-500 transition-all duration-300"
													style={{ width: `${project.progress}%` }}
												></div>
											</div>
											<span className="text-xs text-gray-400 tracking-wide w-8">
												{project.progress}%
											</span>
										</div>
										<svg
											className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={1}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);

	const CheckinsView = () => {
		return (
			<div className="space-y-6 px-6 py-4">
				{/* Section Header */}
				<div>
					<h2 className="text-2xl font-light tracking-wide">Daily Check-ins</h2>
					<p className="text-muted-foreground text-sm tracking-wide mt-1">
						Track your wellbeing and productivity in one glance.
					</p>
				</div>

				<CheckinDashboard />
			</div>
		);
	};

	function TeamView() {
		return (
			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-light tracking-wider">Team</h2>
					<p className="text-gray-500 text-sm tracking-wide mt-1">
						Collaborate with your team members
					</p>
				</div>

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm text-center">
					<div className="w-16 h-16 border border-white/10 bg-white/5 rounded-sm flex items-center justify-center mx-auto mb-6">
						<svg
							className="w-8 h-8 text-gray-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1}
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
							/>
						</svg>
					</div>
					<p className="text-gray-400 text-lg font-light tracking-wide">
						Team management coming soon
					</p>
					<p className="text-gray-500 text-sm tracking-wide mt-2">
						Invite and manage team members across your projects
					</p>
				</div>
			</div>
		);
	}

	const renderActiveView = () => {
		switch (activeView) {
			case "overview":
				return <OverviewView />;
			case "projects":
				return <ProjectsView />;
			case "checkins":
				return <CheckinsView />;
			case "team":
				return <TeamView />;
			default:
				return <OverviewView />;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-[#1a0a2e] to-[#16213e] text-white relative">
			<NavigationBar />

			<div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
				<div className="mb-12">
					<h1 className="text-4xl font-light tracking-wider mb-4">
						{activeView.charAt(0).toUpperCase() + activeView.slice(1)}
					</h1>
					<p className="text-gray-400 text-sm tracking-wide">
						{activeView === "overview" && "Your workspace at a glance"}
						{activeView === "projects" &&
							"Manage your projects and track progress"}
						{activeView === "checkins" &&
							"Monitor your daily wellbeing and productivity"}
						{activeView === "team" && "Collaborate and manage team members"}
					</p>
				</div>

				{renderActiveView()}
			</div>
		</div>
	);
};

export default Dashboard;
