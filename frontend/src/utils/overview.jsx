import React, { useState, useEffect, useCallback, useMemo } from "react";
import API from "../api";
import socket from "../socket";

const OverviewView = () => {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [dashboardData, setDashboardData] = useState({
		projects: [],
		teamMembers: [],
		checkIns: [],
		recentActivity: [],
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [lastFetch, setLastFetch] = useState(null);

	// Cache duration (5 minutes)
	const CACHE_DURATION = 5 * 60 * 1000;

	// Get current user
	const getCurrentUser = useCallback(() => {
		try {
			const userStr = localStorage.getItem("user");
			return userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
		} catch {
			return null;
		}
	}, []);

	const currentUser = getCurrentUser();

	// Clock update (reduced frequency)
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 10000); // Update every 10 seconds instead of 1 second
		return () => clearInterval(timer);
	}, []);

	// Optimized data fetching with caching
	const fetchDashboardData = useCallback(
		async (forceRefresh = false) => {
			const now = Date.now();

			// Check cache validity
			if (!forceRefresh && lastFetch && now - lastFetch < CACHE_DURATION) {
				return; // Use cached data
			}

			setLoading(true);
			try {
				// Single API call to get all dashboard data
				const [projectsRes, teamsRes, checkInsRes] = await Promise.all([
					API.get("/projects"),
					API.get("/teams"),
					API.get("/checkins/getCheckins?limit=10"), // Limit recent check-ins
				]);

				const projects = projectsRes.data || [];
				const teams = Array.isArray(teamsRes.data) ? teamsRes.data : [];
				const checkIns = checkInsRes.data || [];

				// Process team members efficiently
				const memberMap = new Map();
				teams.forEach((team) => {
					if (Array.isArray(team.members)) {
						team.members.forEach((member) => {
							if (member && member._id) {
								memberMap.set(member._id, {
									_id: member._id,
									name: member.name,
									email: member.email,
									isActive: true,
								});
							}
						});
					}
				});
				const teamMembers = Array.from(memberMap.values());

				// Generate activity efficiently
				const activities = [];

				// Add recent check-ins
				checkIns.slice(0, 5).forEach((checkIn, index) => {
					activities.push({
						id: `checkin-${checkIn._id || index}`,
						type: "checkin",
						message: "Daily check-in submitted",
						user: checkIn.userId?.name || "Unknown User",
						timestamp: new Date(checkIn.createdAt || checkIn.date),
						color: "blue",
					});
				});

				// Add recent project updates (only recent ones)
				const recentProjects = projects
					.filter(
						(p) =>
							p.createdAt &&
							now - new Date(p.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
					) // Last 7 days
					.slice(0, 5);

				recentProjects.forEach((project, index) => {
					if (project.status === "completed") {
						activities.push({
							id: `project-completed-${project._id || index}`,
							type: "completion",
							message: `Project ${project.name} completed`,
							user: project.createdBy?.name || "Unknown User",
							timestamp: new Date(project.updatedAt || project.createdAt),
							color: "purple",
						});
					} else if (project.status === "active") {
						activities.push({
							id: `project-active-${project._id || index}`,
							type: "progress",
							message: `Project ${project.name} started`,
							user: project.createdBy?.name || "Unknown User",
							timestamp: new Date(project.createdAt),
							color: "green",
						});
					}
				});

				activities.sort(
					(a, b) => new Date(b.timestamp) - new Date(a.timestamp)
				);

				setDashboardData({
					projects,
					teamMembers,
					checkIns,
					recentActivity: activities.slice(0, 10),
				});

				setLastFetch(now);
				setError(null);
			} catch (err) {
				setError("Failed to load dashboard data");
				console.error("Error fetching data:", err);
			} finally {
				setLoading(false);
			}
		},
		[lastFetch]
	);

	// Initial data fetch
	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	// Optimized socket listeners with debouncing
	useEffect(() => {
		if (!socket) return;

		let updateTimeout;

		const debouncedUpdate = () => {
			clearTimeout(updateTimeout);
			updateTimeout = setTimeout(() => {
				fetchDashboardData(true);
			}, 1000); // Debounce updates by 1 second
		};

		const handleProjectUpdate = (updatedProject) => {
			setDashboardData((prev) => ({
				...prev,
				projects: prev.projects.map((p) =>
					p._id === updatedProject._id ? updatedProject : p
				),
			}));
		};

		const handleNewCheckIn = (checkInData) => {
			setDashboardData((prev) => ({
				...prev,
				checkIns: [checkInData, ...prev.checkIns.slice(0, 9)],
				recentActivity: [
					{
						id: `checkin-${Date.now()}`,
						type: "checkin",
						message: "Daily check-in submitted",
						user: checkInData.userId?.name || "Unknown User",
						timestamp: new Date(),
						color: "blue",
					},
					...prev.recentActivity.slice(0, 9),
				],
			}));
		};

		socket.on("projectUpdate", handleProjectUpdate);
		socket.on("newCheckIn", handleNewCheckIn);
		socket.on("teamUpdate", debouncedUpdate);

		return () => {
			clearTimeout(updateTimeout);
			socket.off("projectUpdate", handleProjectUpdate);
			socket.off("newCheckIn", handleNewCheckIn);
			socket.off("teamUpdate", debouncedUpdate);
		};
	}, [fetchDashboardData]);

	// Memoized calculations
	const stats = useMemo(() => {
		const { projects, teamMembers } = dashboardData;
		const totalProjects = projects.length;
		const activeProjects = projects.filter((p) => p.status === "active").length;
		const planningProjects = projects.filter(
			(p) => p.status === "planning"
		).length;
		const completedProjects = projects.filter(
			(p) => p.status === "completed"
		).length;

		const overdue = projects.filter(
			(p) =>
				p.deadline &&
				new Date(p.deadline) < new Date() &&
				p.status !== "completed"
		).length;

		const completionRate =
			totalProjects > 0
				? Math.round((completedProjects / totalProjects) * 100)
				: 0;

		const upcomingDeadlines = projects
			.filter((p) => {
				if (!p.deadline || p.status === "completed") return false;
				const deadline = new Date(p.deadline);
				const weekFromNow = new Date();
				weekFromNow.setDate(weekFromNow.getDate() + 7);
				return deadline <= weekFromNow && deadline >= new Date();
			})
			.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
			.slice(0, 5); // Limit to 5

		const activeTeamMembers = teamMembers.filter((m) => m.isActive).length;

		return {
			totalProjects,
			activeProjects,
			planningProjects,
			completedProjects,
			overdue,
			completionRate,
			upcomingDeadlines,
			activeTeamMembers,
		};
	}, [dashboardData]);

	const formatTime = useCallback((date) => {
		return date.toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
		});
	}, []);

	const formatRelativeTime = useCallback((date) => {
		const now = new Date();
		const diff = now - new Date(date);
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
		if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
		return "Just now";
	}, []);

	// Loading state with skeleton
	if (loading && !dashboardData.projects.length) {
		return (
			<div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
				<div className="animate-pulse">
					<div className="h-8 bg-white/10 rounded w-64 mb-4"></div>
					<div className="h-4 bg-white/5 rounded w-48 mb-8"></div>

					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						{[...Array(4)].map((_, i) => (
							<div
								key={i}
								className="border border-white/10 bg-white/5 p-6 rounded-sm"
							>
								<div className="h-4 bg-white/10 rounded w-20 mb-4"></div>
								<div className="h-8 bg-white/10 rounded w-12"></div>
							</div>
						))}
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{[...Array(2)].map((_, i) => (
							<div
								key={i}
								className="border border-white/10 bg-white/5 p-6 rounded-sm"
							>
								<div className="h-6 bg-white/10 rounded w-32 mb-6"></div>
								<div className="space-y-4">
									{[...Array(3)].map((_, j) => (
										<div key={j} className="h-12 bg-white/10 rounded"></div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-7xl mx-auto px-6 py-8">
				<div className="text-center">
					<div className="border border-red-500/30 bg-red-500/10 rounded-sm p-6 mb-4">
						<h2 className="text-red-400 text-lg font-light tracking-wide mb-2">
							Error Loading Dashboard
						</h2>
						<p className="text-red-300 text-sm tracking-wide">{error}</p>
					</div>
					<button
						onClick={() => fetchDashboardData(true)}
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
								{stats.totalProjects}
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
								{stats.activeProjects}
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
								{stats.planningProjects}
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
								{stats.completedProjects}
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
							{stats.completionRate}%
						</span>
					</div>
					<div className="w-full bg-white/10 rounded-full h-2">
						<div
							className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
							style={{ width: `${stats.completionRate}%` }}
						></div>
					</div>
					<p className="text-xs text-gray-400 mt-2 tracking-wide">
						{stats.completedProjects}/{stats.totalProjects} projects completed
					</p>
				</div>

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-sm font-light text-gray-300 tracking-wider uppercase">
							Overdue Projects
						</h4>
						<span
							className={`text-2xl font-light tracking-wide ${
								stats.overdue > 0 ? "text-red-400" : "text-green-400"
							}`}
						>
							{stats.overdue}
						</span>
					</div>
					<div className="flex items-center">
						<svg
							className={`w-4 h-4 mr-2 ${
								stats.overdue > 0 ? "text-red-400" : "text-green-400"
							}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							{stats.overdue > 0 ? (
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
							{stats.overdue > 0 ? "Needs attention" : "All on track"}
						</span>
					</div>
				</div>

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-sm font-light text-gray-300 tracking-wider uppercase">
							Team Members
						</h4>
						<span className="text-2xl font-light text-white tracking-wide">
							{stats.teamMembers?.length || 0}
						</span>
					</div>

					<div className="flex items-center">
						<div className="flex -space-x-2">
							{stats.teamMembers?.slice(0, 4).map((member, idx) => (
								<div
									key={member._id || idx}
									className="w-6 h-6 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-white font-light"
									title={member.name}
								>
									{member.name?.[0]?.toUpperCase() || "U"}
								</div>
							))}

							{(stats.teamMembers?.length || 0) > 4 && (
								<div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-white font-light">
									+{stats.teamMembers.length - 4}
								</div>
							)}
						</div>

						<span className="text-xs text-gray-400 ml-3 tracking-wide">
							{stats.activeTeamMembers || 0} active
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
						{(stats.recentActivity?.length || 0) > 0 ? (
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
						{(stats.upcomingDeadlines.length || 0) > 0 ? (
							stats.upcomingDeadlines.slice(0, 5).map((project, idx) => {
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
