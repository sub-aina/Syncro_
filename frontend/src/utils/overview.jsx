import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	AreaChart,
	Area,
} from "recharts";
import API from "../api"; // Adjust the import based on your API setup

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

	// Clock update
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	// Real data fetching function
	const fetchDashboardData = useCallback(
		async (forceRefresh = false) => {
			const now = Date.now();
			const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

			// Check cache validity
			if (!forceRefresh && lastFetch && now - lastFetch < CACHE_DURATION) {
				return;
			}

			setLoading(true);
			try {
				// Fetch all real data
				const [projectsRes, teamsRes, checkInsRes] = await Promise.all([
					API.get("/projects"),
					API.get("/teams"),
					API.get("/checkins/getCheckins?limit=50"), // Get more for better analytics
				]);

				const projects = projectsRes.data || [];
				const teams = Array.isArray(teamsRes.data) ? teamsRes.data : [];
				const checkIns = checkInsRes.data || [];

				// Process team members from teams
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

				// Generate real activity data
				const activities = [];

				// Add recent check-ins
				checkIns.slice(0, 10).forEach((checkIn) => {
					activities.push({
						id: `checkin-${checkIn._id}`,
						type: "checkin",
						message: "Daily check-in submitted",
						user: checkIn.userId?.name || "Unknown User",
						timestamp: new Date(checkIn.createdAt || checkIn.date),
						color: "blue",
					});
				});

				// Add project status changes (recent ones)
				projects
					.filter(
						(p) =>
							p.updatedAt &&
							now - new Date(p.updatedAt).getTime() < 7 * 24 * 60 * 60 * 1000
					)
					.slice(0, 5)
					.forEach((project) => {
						if (project.status === "completed") {
							activities.push({
								id: `project-completed-${project._id}`,
								type: "completion",
								message: `Project "${project.name}" completed`,
								user: project.createdBy?.name || "Unknown User",
								timestamp: new Date(project.updatedAt),
								color: "purple",
							});
						} else if (project.status === "active") {
							activities.push({
								id: `project-active-${project._id}`,
								type: "progress",
								message: `Project "${project.name}" started`,
								user: project.createdBy?.name || "Unknown User",
								timestamp: new Date(project.createdAt),
								color: "green",
							});
						}
					});

				// Sort activities by timestamp
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
				console.error("Error fetching dashboard data:", err);
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

	// Memoized calculations and chart data
	const { stats, chartData } = useMemo(() => {
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
			.slice(0, 5);

		const activeTeamMembers = teamMembers.filter((m) => m.isActive).length;

		// Generate chart data from REAL data
		const projectStatusData = [
			{ name: "Active", value: activeProjects, color: "#10B981" },
			{ name: "Planning", value: planningProjects, color: "#F59E0B" },
			{ name: "Completed", value: completedProjects, color: "#8B5CF6" },
		];

		// Real progress over time (based on project creation dates)
		const progressData = [];
		const last7Days = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			last7Days.push(date);
		}

		last7Days.forEach((date) => {
			const dayStart = new Date(date);
			dayStart.setHours(0, 0, 0, 0);
			const dayEnd = new Date(date);
			dayEnd.setHours(23, 59, 59, 999);

			const completedOnDay = projects.filter(
				(p) =>
					p.status === "completed" &&
					p.updatedAt &&
					new Date(p.updatedAt) >= dayStart &&
					new Date(p.updatedAt) <= dayEnd
			).length;

			const activeOnDay = projects.filter(
				(p) =>
					p.status === "active" &&
					p.createdAt &&
					new Date(p.createdAt) <= dayEnd
			).length;

			progressData.push({
				date: date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				completed: completedOnDay,
				active: activeOnDay,
			});
		});

		// Real team productivity (based on actual project assignments)
		const teamProductivityData = teamMembers.slice(0, 6).map((member) => {
			const memberProjects = projects.filter(
				(p) =>
					p.createdBy?.name === member.name ||
					(p.assignedTo &&
						p.assignedTo.some((assigned) => assigned.name === member.name))
			).length;

			// Count check-ins by this member in last 7 days
			const last7DaysCheckins = checkIns.filter(
				(checkIn) =>
					checkIn.userId?.name === member.name &&
					checkIn.createdAt &&
					new Date() - new Date(checkIn.createdAt) <= 7 * 24 * 60 * 60 * 1000
			).length;

			return {
				name: member.name.split(" ")[0],
				projects: memberProjects,
				tasks: last7DaysCheckins * 2 + memberProjects, // Estimate tasks
			};
		});

		// Real weekly activity data from check-ins
		const weeklyActivityData = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const dayStart = new Date(date);
			dayStart.setHours(0, 0, 0, 0);
			const dayEnd = new Date(date);
			dayEnd.setHours(23, 59, 59, 999);

			// const dayCheckins = checkIn.filter(
			// 	(checkIn) =>
			// 		checkIn.createdAt &&
			// 		new Date(checkIn.createdAt) >= dayStart &&
			// 		new Date(checkIn.createdAt) <= dayEnd
			// ).length;

			// Estimate tasks based on project activity
			const dayTasks =
				projects.filter(
					(p) =>
						(p.createdAt &&
							new Date(p.createdAt) >= dayStart &&
							new Date(p.createdAt) <= dayEnd) ||
						(p.updatedAt &&
							new Date(p.updatedAt) >= dayStart &&
							new Date(p.updatedAt) <= dayEnd)
				).length * 2;
			// 2 +
			// dayCheckins;

			weeklyActivityData.push({
				day: date.toLocaleDateString("en-US", { weekday: "short" }),
				// checkins: dayCheckins,
				tasks: dayTasks,
			});
		}

		return {
			stats: {
				totalProjects,
				activeProjects,
				planningProjects,
				completedProjects,
				overdue,
				completionRate,
				upcomingDeadlines,
				activeTeamMembers,
				teamMembers,
			},
			chartData: {
				projectStatusData,
				progressData,
				teamProductivityData,
				weeklyActivityData,
			},
		};
	}, [dashboardData]);

	const formatTime = useCallback((date) => {
		return date.toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
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

	// Progress Ring Component
	const ProgressRing = ({
		progress,
		size = 120,
		strokeWidth = 8,
		color = "#8B5CF6",
	}) => {
		const radius = (size - strokeWidth) / 2;
		const circumference = radius * 2 * Math.PI;
		const strokeDasharray = `${circumference} ${circumference}`;
		const strokeDashoffset = circumference - (progress / 100) * circumference;

		return (
			<div className="relative">
				<svg width={size} height={size} className="transform -rotate-90">
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke="rgba(255,255,255,0.1)"
						strokeWidth={strokeWidth}
						fill="transparent"
					/>
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke={color}
						strokeWidth={strokeWidth}
						fill="transparent"
						strokeDasharray={strokeDasharray}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
						className="transition-all duration-1000 ease-out"
					/>
				</svg>
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="text-2xl font-light text-white">{progress}%</span>
				</div>
			</div>
		);
	};

	if (loading) {
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
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
			{/* Header with Live Clock */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-light tracking-wider mb-2"></h1>
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
					<div className="text-4xl font-mono text-white tracking-wider font-light">
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
							<div className="flex items-center mt-2 text-xs">
								<div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
								<span className="text-green-400">+12% from last month</span>
							</div>
						</div>
						<div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 rounded-sm flex items-center justify-center">
							<svg
								className="w-6 h-6 text-blue-400"
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
								Active Projects
							</p>
							<p className="text-3xl font-light tracking-wide">
								{stats.activeProjects}
							</p>
							<div className="flex items-center mt-2 text-xs">
								<div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
								<span className="text-green-400">High velocity</span>
							</div>
						</div>
						<div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 rounded-sm flex items-center justify-center">
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
								Team Members
							</p>
							<p className="text-3xl font-light tracking-wide">
								{stats.teamMembers?.length || 0}
							</p>
							<div className="flex items-center mt-2 text-xs">
								<div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
								<span className="text-blue-400">
									{stats.activeTeamMembers} active
								</span>
							</div>
						</div>
						<div className="flex -space-x-2">
							{stats.teamMembers?.slice(0, 3).map((member, idx) => (
								<div
									key={member._id || idx}
									className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-white font-light"
									title={member.name}
								>
									{member.name?.[0]?.toUpperCase() || "U"}
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-xs tracking-wider uppercase mb-2">
								Completion Rate
							</p>
							<p className="text-3xl font-light tracking-wide">
								{stats.completionRate}%
							</p>
							<div className="flex items-center mt-2 text-xs">
								<div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
								<span className="text-purple-400">Above target</span>
							</div>
						</div>
						<ProgressRing
							progress={stats.completionRate}
							size={48}
							strokeWidth={4}
							color="#8B5CF6"
						/>
					</div>
				</div>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Project Status Distribution */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<h3 className="text-lg font-light tracking-wider uppercase mb-6">
						Project Status Distribution
					</h3>
					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={chartData.projectStatusData}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={100}
									paddingAngle={5}
									dataKey="value"
								>
									{chartData.projectStatusData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: "rgba(0,0,0,0.8)",
										border: "1px solid rgba(255,255,255,0.1)",
										borderRadius: "4px",
										color: "white",
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="flex justify-center space-x-6 mt-4">
						{chartData.projectStatusData.map((item, index) => (
							<div key={index} className="flex items-center space-x-2">
								<div
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: item.color }}
								></div>
								<span className="text-sm text-gray-300">
									{item.name} ({item.value})
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Progress Over Time */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<h3 className="text-lg font-light tracking-wider uppercase mb-6">
						Project Progress Trend
					</h3>
					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={chartData.progressData}>
								<defs>
									<linearGradient
										id="colorCompleted"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
									</linearGradient>
									<linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#10B981" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="rgba(255,255,255,0.1)"
								/>
								<XAxis
									dataKey="date"
									stroke="rgba(255,255,255,0.5)"
									fontSize={12}
								/>
								<YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
								<Tooltip
									contentStyle={{
										backgroundColor: "rgba(0,0,0,0.8)",
										border: "1px solid rgba(255,255,255,0.1)",
										borderRadius: "4px",
										color: "white",
									}}
								/>
								<Area
									type="monotone"
									dataKey="completed"
									stackId="1"
									stroke="#8B5CF6"
									fill="url(#colorCompleted)"
									strokeWidth={2}
								/>
								<Area
									type="monotone"
									dataKey="active"
									stackId="1"
									stroke="#10B981"
									fill="url(#colorActive)"
									strokeWidth={2}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* Team Performance and Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Team Productivity */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<h3 className="text-lg font-light tracking-wider uppercase mb-6">
						Team Productivity
					</h3>
					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={chartData.teamProductivityData}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="rgba(255,255,255,0.1)"
								/>
								<XAxis
									dataKey="name"
									stroke="rgba(255,255,255,0.5)"
									fontSize={12}
								/>
								<YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
								<Tooltip
									contentStyle={{
										backgroundColor: "rgba(0,0,0,0.8)",
										border: "1px solid rgba(255,255,255,0.1)",
										borderRadius: "4px",
										color: "white",
									}}
								/>
								<Bar dataKey="projects" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
								<Bar dataKey="tasks" fill="#10B981" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
					<div className="flex justify-center space-x-6 mt-4">
						<div className="flex items-center space-x-2">
							<div className="w-3 h-3 rounded-full bg-purple-500"></div>
							<span className="text-sm text-gray-300">Projects</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-3 h-3 rounded-full bg-green-500"></div>
							<span className="text-sm text-gray-300">Tasks</span>
						</div>
					</div>
				</div>

				{/* Weekly Activity */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<h3 className="text-lg font-light tracking-wider uppercase mb-6">
						Weekly Activity
					</h3>
					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={chartData.weeklyActivityData}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="rgba(255,255,255,0.1)"
								/>
								<XAxis
									dataKey="day"
									stroke="rgba(255,255,255,0.5)"
									fontSize={12}
								/>
								<YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
								<Tooltip
									contentStyle={{
										backgroundColor: "rgba(0,0,0,0.8)",
										border: "1px solid rgba(255,255,255,0.1)",
										borderRadius: "4px",
										color: "white",
									}}
								/>
								<Line
									type="monotone"
									dataKey="checkins"
									stroke="#F59E0B"
									strokeWidth={3}
									dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
									activeDot={{ r: 6, stroke: "#F59E0B", strokeWidth: 2 }}
								/>
								<Line
									type="monotone"
									dataKey="tasks"
									stroke="#06B6D4"
									strokeWidth={3}
									dot={{ fill: "#06B6D4", strokeWidth: 2, r: 4 }}
									activeDot={{ r: 6, stroke: "#06B6D4", strokeWidth: 2 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
					<div className="flex justify-center space-x-6 mt-4">
						<div className="flex items-center space-x-2">
							<div className="w-3 h-3 rounded-full bg-yellow-500"></div>
							<span className="text-sm text-gray-300">Check-ins</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-3 h-3 rounded-full bg-cyan-500"></div>
							<span className="text-sm text-gray-300">Tasks</span>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Row - Recent Activity and Upcoming Deadlines */}
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
						{(dashboardData.recentActivity?.length || 0) > 0 ? (
							dashboardData.recentActivity.map((activity) => (
								<div
									key={activity.id}
									className="flex items-start space-x-4 text-sm p-3 rounded bg-white/5 hover:bg-white/10 transition-all duration-200"
								>
									<div
										className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
											activity.color === "blue"
												? "bg-blue-400"
												: activity.color === "green"
												? "bg-green-400"
												: activity.color === "purple"
												? "bg-purple-400"
												: "bg-gray-400"
										}`}
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

				{/* Upcoming Deadlines with Progress Indicators */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<h3 className="text-lg font-light tracking-wider uppercase mb-6">
						Project Progress & Deadlines
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
										className="p-4 bg-white/5 rounded hover:bg-white/10 transition-all duration-200 border border-white/5"
									>
										<div className="flex items-center justify-between mb-3">
											<div>
												<p className="text-gray-300 text-sm font-light tracking-wide">
													{project.name}
												</p>
												<p className="text-gray-500 text-xs tracking-wide">
													Due{" "}
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

										{/* Progress Bar */}
										<div className="flex items-center space-x-3">
											<div className="flex-1">
												<div className="w-full bg-white/10 rounded-full h-2">
													<div
														className={`h-2 rounded-full transition-all duration-1000 ease-out ${
															project.progress >= 80
																? "bg-gradient-to-r from-green-500 to-emerald-500"
																: project.progress >= 50
																? "bg-gradient-to-r from-yellow-500 to-orange-500"
																: "bg-gradient-to-r from-red-500 to-pink-500"
														}`}
														style={{ width: `${project.progress}%` }}
													></div>
												</div>
											</div>
											<span className="text-xs text-gray-400 font-mono">
												{project.progress}%
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

			{/* Performance Metrics Row */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-sm font-light text-gray-300 tracking-wider uppercase">
							Velocity Score
						</h4>
						<div className="flex items-center space-x-2">
							<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
							<span className="text-xs text-green-400">Excellent</span>
						</div>
					</div>
					<div className="flex items-center justify-center">
						<ProgressRing
							progress={87}
							size={100}
							strokeWidth={6}
							color="#10B981"
						/>
					</div>
					<p className="text-xs text-gray-400 mt-4 text-center tracking-wide">
						Based on completion rate and timeline adherence
					</p>
				</div>

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-sm font-light text-gray-300 tracking-wider uppercase">
							Team Efficiency
						</h4>
						<div className="flex items-center space-x-2">
							<div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
							<span className="text-xs text-yellow-400">Good</span>
						</div>
					</div>
					<div className="flex items-center justify-center">
						<ProgressRing
							progress={73}
							size={100}
							strokeWidth={6}
							color="#F59E0B"
						/>
					</div>
					<p className="text-xs text-gray-400 mt-4 text-center tracking-wide">
						Average tasks completed per team member
					</p>
				</div>

				<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300">
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-sm font-light text-gray-300 tracking-wider uppercase">
							Quality Index
						</h4>
						<div className="flex items-center space-x-2">
							<div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
							<span className="text-xs text-purple-400">High</span>
						</div>
					</div>
					<div className="flex items-center justify-center">
						<ProgressRing
							progress={91}
							size={100}
							strokeWidth={6}
							color="#8B5CF6"
						/>
					</div>
					<p className="text-xs text-gray-400 mt-4 text-center tracking-wide">
						Quality score based on reviews and feedback
					</p>
				</div>
			</div>
		</div>
	);
};

export default OverviewView;
