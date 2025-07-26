import React, { useState, useEffect } from "react";
import API from "../api";
import socket from "../socket";

const OverviewView = () => {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [projects, setProjects] = useState([]);
	const [recentActivity, setRecentActivity] = useState([]);
	const [teamMembers, setTeamMembers] = useState([]);
	const [checkIns, setCheckIns] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Get current user
	const getCurrentUser = () => {
		try {
			const userStr = localStorage.getItem("user");
			return userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
		} catch {
			return null;
		}
	};

	const currentUser = getCurrentUser();

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	// Fetch initial data
	useEffect(() => {
		fetchAllData();
	}, []);

	// Listen for real-time updates
	useEffect(() => {
		if (!socket) return;

		// Listen for real-time updates
		socket.on("projectUpdate", (updatedProject) => {
			setProjects((prev) =>
				prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
			);
		});

		socket.on("newCheckIn", (checkInData) => {
			setCheckIns((prev) => [checkInData, ...prev]);
			// Add to recent activity
			setRecentActivity((prev) => [
				{
					id: Date.now(),
					type: "checkin",
					message: `${
						checkInData.userId?.name || "Someone"
					} submitted a daily check-in`,
					user: checkInData.userId?.name || "Unknown",
					timestamp: new Date(),
					color: "blue",
				},
				...prev.slice(0, 9),
			]); // Keep last 10 activities
		});

		socket.on("teamUpdate", (teamData) => {
			fetchTeamData(); // Refresh team data
		});

		return () => {
			socket.off("projectUpdate");
			socket.off("newCheckIn");
			socket.off("teamUpdate");
		};
	}, []);

	const fetchAllData = async () => {
		setLoading(true);
		try {
			await Promise.all([
				fetchProjects(),
				fetchTeamData(),
				fetchRecentCheckIns(),
				fetchRecentActivity(),
			]);
		} catch (err) {
			setError("Failed to load dashboard data");
			console.error("Error fetching data:", err);
		} finally {
			setLoading(false);
		}
	};

	const fetchProjects = async () => {
		try {
			const response = await API.get("/projects");
			setProjects(response.data || []);
		} catch (err) {
			console.error("Error fetching projects:", err);
		}
	};

	const fetchTeamData = async () => {
		try {
			const response = await API.get("/teams");

			// console.log("Raw /teams response:", response.data);

			const teams = Array.isArray(response.data) ? response.data : [];

			const allMembers = new Set();
			for (const team of teams) {
				if (Array.isArray(team.members)) {
					team.members.forEach((member) => {
						if (member && typeof member === "object") {
							allMembers.add(
								JSON.stringify({
									_id: member._id,
									name: member.name,
									email: member.email,
									isActive: true,
								})
							);
						}
					});
				}
			}

			const uniqueMembers = Array.from(allMembers).map((str) =>
				JSON.parse(str)
			);
			setTeamMembers(uniqueMembers);
		} catch (err) {
			// console.error("Error fetching team data:", err);
		}
	};

	const fetchRecentCheckIns = async () => {
		try {
			const response = await API.get("/checkins/getCheckins");
			setCheckIns(response.data || []);
		} catch (err) {
			console.error("Error fetching check-ins:", err);
		}
	};

	const fetchRecentActivity = async () => {
		try {
			// Generate activity from check-ins and projects
			const activities = [];

			// Add recent check-ins as activities
			checkIns.slice(0, 5).forEach((checkIn, index) => {
				activities.push({
					id: `checkin-${checkIn._id || index}`,
					type: "checkin",
					message: `Daily check-in completed for ${
						checkIn.projectId?.name || "a project"
					}`,
					user: checkIn.userId?.name || "Unknown User",
					timestamp: new Date(checkIn.createdAt || checkIn.date),
					color: "blue",
				});
			});

			// Add recent project updates
			projects.slice(0, 3).forEach((project, index) => {
				if (project.status === "completed") {
					activities.push({
						id: `project-completed-${project._id || index}`,
						type: "completion",
						message: `Project ${project.name} marked as completed`,
						user: project.createdBy?.name || "Unknown User",
						timestamp: new Date(project.createdAt),
						color: "purple",
					});
				} else if (project.status === "active") {
					activities.push({
						id: `project-active-${project._id || index}`,
						type: "progress",
						message: `Project ${project.name} is actively being worked on`,
						user: project.createdBy?.name || "Unknown User",
						timestamp: new Date(project.createdAt),
						color: "green",
					});
				}
			});

			// Sort by timestamp and take most recent
			activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
			setRecentActivity(activities.slice(0, 10));
		} catch (err) {
			console.error("Error generating recent activity:", err);
		}
	};

	// Recalculate activity when data changes
	useEffect(() => {
		if (projects.length > 0 || checkIns.length > 0) {
			fetchRecentActivity();
		}
	}, [projects, checkIns]);

	// Calculate stats
	const totalProjects = projects.length;
	const activeProjects = projects.filter((p) => p.status === "active").length;
	const planningProjects = projects.filter(
		(p) => p.status === "planning"
	).length;
	const completedProjects = projects.filter(
		(p) => p.status === "completed"
	).length;

	// Calculate additional metrics
	const overdue = projects.filter(
		(p) =>
			p.deadline &&
			new Date(p.deadline) < new Date() &&
			p.status !== "completed"
	).length;

	// Calculate completion rate based on project status
	const completionRate =
		totalProjects > 0
			? Math.round((completedProjects / totalProjects) * 100)
			: 0;

	// Get projects due soon (next 7 days)
	const upcomingDeadlines = projects
		.filter((p) => {
			if (!p.deadline || p.status === "completed") return false;
			const deadline = new Date(p.deadline);
			const weekFromNow = new Date();
			weekFromNow.setDate(weekFromNow.getDate() + 7);
			return deadline <= weekFromNow && deadline >= new Date();
		})
		.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

	// Get team productivity data
	const activeTeamMembers = teamMembers.filter((m) => m.isActive).length;

	const formatTime = (date) => {
		return date.toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatRelativeTime = (date) => {
		const now = new Date();
		const diff = now - new Date(date);
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
		if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
		return "Just now";
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-[#1a0a2e] to-[#16213e] flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-2 border-white/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-400 text-sm tracking-wide">
						Loading dashboard...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-[#1a0a2e] to-[#16213e] flex items-center justify-center">
				<div className="text-center">
					<div className="border border-red-500/30 bg-red-500/10 rounded-sm p-6 mb-4">
						<h2 className="text-red-400 text-lg font-light tracking-wide mb-2">
							Error Loading Dashboard
						</h2>
						<p className="text-red-300 text-sm tracking-wide">{error}</p>
					</div>
					<button
						onClick={fetchAllData}
						className="border border-purple-400/30 bg-purple-500/10 hover:bg-purple-500/20 text-white px-6 py-2 rounded-sm font-light tracking-wide transition-all duration-300"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		// <div className="min-h-screen bg-gradient-to-br from-black via-[#1a0a2e] to-[#16213e] text-white">
		<div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
			{/* Header with Live Clock */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-light tracking-wider mb-2">
						Project Overview
					</h1>
					<p className="text-gray-400 text-sm tracking-wide">
						{currentTime.toLocaleDateString("en-US", {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</p>
					<div className="flex items-center space-x-2 mt-2">
						<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
						<p className="text-green-400 text-xs tracking-wider uppercase">
							Live Data Connected
						</p>
					</div>
				</div>
				<div className="text-right">
					<div className="text-4xl font-mono text-white tracking-wider">
						{formatTime(currentTime)}
					</div>
					<div className="text-sm text-gray-400 tracking-wide">Local Time</div>
				</div>
			</div>

			{/* Main Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-xs tracking-wider uppercase mb-2">
								Total Projects
							</p>
							<p className="text-3xl font-light tracking-wide">
								{totalProjects}
							</p>
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

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-xs tracking-wider uppercase mb-2">
								Active
							</p>
							<p className="text-3xl font-light tracking-wide">
								{activeProjects}
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

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-xs tracking-wider uppercase mb-2">
								Planning
							</p>
							<p className="text-3xl font-light tracking-wide">
								{planningProjects}
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

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-xs tracking-wider uppercase mb-2">
								Completed
							</p>
							<p className="text-3xl font-light tracking-wide">
								{completedProjects}
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

			{/* Secondary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-sm font-light text-gray-300 tracking-wider uppercase">
							Project Completion Rate
						</h4>
						<span className="text-2xl font-light text-white tracking-wide">
							{completionRate}%
						</span>
					</div>
					<div className="w-full bg-white/10 rounded-full h-2">
						<div
							className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
							style={{ width: `${completionRate}%` }}
						></div>
					</div>
					<p className="text-xs text-gray-400 mt-2 tracking-wide">
						{completedProjects}/{totalProjects} projects completed
					</p>
				</div>

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-sm font-light text-gray-300 tracking-wider uppercase">
							Overdue Projects
						</h4>
						<span
							className={`text-2xl font-light tracking-wide ${
								overdue > 0 ? "text-red-400" : "text-green-400"
							}`}
						>
							{overdue}
						</span>
					</div>
					<div className="flex items-center">
						<svg
							className={`w-4 h-4 mr-2 ${
								overdue > 0 ? "text-red-400" : "text-green-400"
							}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							{overdue > 0 ? (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							) : (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1}
									d="M5 13l4 4L19 7"
								/>
							)}
						</svg>
						<span className="text-xs text-gray-400 tracking-wide">
							{overdue > 0 ? "Needs attention" : "All on track"}
						</span>
					</div>
				</div>

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-sm font-light text-gray-300 tracking-wider uppercase">
							Team Members
						</h4>
						<span className="text-2xl font-light text-white tracking-wide">
							{teamMembers.length}
						</span>
					</div>
					<div className="flex items-center">
						<div className="flex -space-x-2">
							{teamMembers.slice(0, 4).map((member, idx) => (
								<div
									key={member._id || idx}
									className="w-6 h-6 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-white font-light"
									title={member.name}
								>
									{member.name?.[0]?.toUpperCase() || "U"}
								</div>
							))}
							{teamMembers.length > 4 && (
								<div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-white font-light">
									+{teamMembers.length - 4}
								</div>
							)}
						</div>
						<span className="text-xs text-gray-400 ml-3 tracking-wide">
							{activeTeamMembers} active
						</span>
					</div>
				</div>
			</div>

			{/* Two Column Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Recent Activity */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-light tracking-wider uppercase">
							Recent Activity
						</h3>
						<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
					</div>
					<div className="space-y-4 max-h-80 overflow-y-auto">
						{recentActivity.length > 0 ? (
							recentActivity.map((activity) => (
								<div
									key={activity.id}
									className="flex items-start space-x-4 text-sm p-3 rounded bg-white/5 hover:bg-white/10 transition-all duration-200"
								>
									<div
										className={`w-2 h-2 bg-${activity.color}-400 rounded-full mt-2 flex-shrink-0`}
									></div>
									<div className="flex-1 min-w-0">
										<p className="text-gray-300 font-light tracking-wide">
											{activity.message}
										</p>
										<div className="flex items-center space-x-2 mt-1">
											<span className="text-gray-600 text-xs">•</span>
											<span className="text-gray-500 text-xs tracking-wide">
												{formatRelativeTime(activity.timestamp)}
											</span>
										</div>
									</div>
								</div>
							))
						) : (
							<div className="text-center py-8">
								<svg
									className="w-12 h-12 text-gray-600 mx-auto mb-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<p className="text-gray-400 text-sm tracking-wide">
									No recent activity
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Upcoming Deadlines */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<h3 className="text-lg font-light tracking-wider uppercase mb-6">
						Upcoming Deadlines
					</h3>
					<div className="space-y-4">
						{upcomingDeadlines.length > 0 ? (
							upcomingDeadlines.slice(0, 5).map((project, idx) => {
								const deadline = new Date(project.deadline);
								const daysUntil = Math.ceil(
									(deadline - new Date()) / (1000 * 60 * 60 * 24)
								);

								return (
									<div
										key={project._id || idx}
										className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 transition-all duration-200 border border-white/5"
									>
										<div>
											<p className="text-gray-300 text-sm font-light tracking-wide">
												{project.name}
											</p>
											<p className="text-gray-500 text-xs tracking-wide">
												{deadline.toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
												})}
											</p>
										</div>
										<div className="text-right">
											<span
												className={`text-xs px-2 py-1 rounded font-light tracking-wide ${
													daysUntil <= 1
														? "bg-red-500/20 text-red-400 border border-red-500/30"
														: daysUntil <= 3
														? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
														: "bg-blue-500/20 text-blue-400 border border-blue-500/30"
												}`}
											>
												{daysUntil === 0
													? "Today"
													: daysUntil === 1
													? "Tomorrow"
													: `${daysUntil} days`}
											</span>
										</div>
									</div>
								);
							})
						) : (
							<div className="text-center py-8">
								<svg
									className="w-12 h-12 text-gray-600 mx-auto mb-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1}
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
								<p className="text-gray-400 text-sm tracking-wide">
									No upcoming deadlines
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
		// </div>
	);
};

export default OverviewView;
