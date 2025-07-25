import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchCheckIns } from "../redux/checkinslice";
import {
	Calendar,
	TrendingUp,
	Zap,
	Star,
	CheckCircle,
	Clock,
	Award,
	BarChart3,
	Target,
} from "lucide-react";

const CheckinDashboard = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { checkins, loading } = useSelector((state) => state.checkin);

	const [currentStreak, setCurrentStreak] = useState(7);
	const [todayCompleted, setTodayCompleted] = useState(false);
	const [todayData, setTodayData] = useState({ mood: 0, energy: 0 });
	const [weeklyData, setWeeklyData] = useState([]);
	const [monthlyStats, setMonthlyStats] = useState({
		completed: 0,
		total: 30,
	});

	useEffect(() => {
		if (checkins.length === 0) return;

		// Today
		const today = new Date().toISOString().slice(0, 10);
		const todayCheckin = checkins.find(
			(entry) => entry.createdAt.slice(0, 10) === today
		);
		setTodayCompleted(!!todayCheckin);
		setTodayData({
			mood: todayCheckin?.mood || 0,
			energy: todayCheckin?.energy || 0,
		});

		const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		const past7Days = [...Array(7)].map((_, i) => {
			const date = new Date();
			date.setDate(date.getDate() - (6 - i));
			const key = date.toISOString().slice(0, 10);
			const entry = checkins.find((c) => c.createdAt.slice(0, 10) === key);
			return {
				day: weekdays[date.getDay()],
				mood: entry?.mood || 0,
				energy: entry?.energy || 0,
				completed: !!entry,
			};
		});
		setWeeklyData(past7Days);

		// Monthly stats
		const thisMonth = new Date().toISOString().slice(0, 7);
		const monthlyEntries = checkins.filter((c) =>
			c.createdAt.startsWith(thisMonth)
		);
		setMonthlyStats({
			completed: monthlyEntries.length,
			total: new Date().getDate(),
		});

		let streak = 0;
		for (let i = 0; i < 30; i++) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const key = date.toISOString().slice(0, 10);
			if (checkins.find((c) => c.createdAt.slice(0, 10) === key)) {
				streak++;
			} else {
				break;
			}
		}
		setCurrentStreak(streak);
	}, [checkins]);

	// Fetch check-in data from API
	useEffect(() => {
		dispatch(fetchCheckIns());
	}, [dispatch]);

	const handleStartCheckin = () => {
		navigate("/daily-checkin");
	};

	const calculateAverages = () => {
		const completedDays = weeklyData.filter((day) => day.completed);
		const avgMood =
			completedDays.reduce((sum, day) => sum + day.mood, 0) /
				completedDays.length || 0;
		const avgEnergy =
			completedDays.reduce((sum, day) => sum + day.energy, 0) /
				completedDays.length || 0;
		return { mood: avgMood.toFixed(1), energy: avgEnergy.toFixed(1) };
	};

	const averages = calculateAverages();

	return (
		<div className="space-y-6">
			{/* Check-in Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Monthly Progress */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 rounded-sm p-6">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-gray-400 text-xs tracking-wider uppercase mb-2">
								This Month
							</h3>
							<p className="text-3xl font-light text-white">
								{monthlyStats.completed}
								<span className="text-lg text-gray-400">
									/{monthlyStats.total}
								</span>
							</p>
						</div>
						<div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-sm flex items-center justify-center">
							<CheckCircle className="w-6 h-6 text-white" />
						</div>
					</div>
					<p className="text-xs text-gray-500 mt-1 tracking-wide">
						Check-ins completed
					</p>
				</div>

				{/* Average Mood */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 rounded-sm p-6">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-gray-400 text-xs tracking-wider uppercase mb-2">
								Avg Mood
							</h3>
							<p className="text-3xl font-light text-white">
								{averages.mood}
								<span className="text-lg text-gray-400">/5</span>
							</p>
						</div>
						<div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-sm flex items-center justify-center">
							<Star className="w-6 h-6 text-white" />
						</div>
					</div>
					<p className="text-xs text-gray-500 mt-1 tracking-wide">This week</p>
				</div>

				{/* Average Energy */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 rounded-sm p-6">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-gray-400 text-xs tracking-wider uppercase mb-2">
								Avg Energy
							</h3>
							<p className="text-3xl font-light text-white">
								{averages.energy}
								<span className="text-lg text-gray-400">/10</span>
							</p>
						</div>
						<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-sm flex items-center justify-center">
							<Zap className="w-6 h-6 text-white" />
						</div>
					</div>
					<p className="text-xs text-gray-500 mt-1 tracking-wide">This week</p>
				</div>
			</div>

			{/* Main Check-in Section */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Today's Check-in */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 rounded-sm p-6">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center space-x-3">
							<div
								className={`w-10 h-10 rounded-sm flex items-center justify-center ${
									todayCompleted
										? "bg-gradient-to-r from-green-500 to-emerald-500"
										: "bg-gradient-to-r from-purple-500 to-violet-500"
								}`}
							>
								{todayCompleted ? (
									<CheckCircle className="w-5 h-5 text-white" />
								) : (
									<Clock className="w-5 h-5 text-white" />
								)}
							</div>
							<div>
								<h3 className="text-sm font-light tracking-wider text-gray-300">
									TODAY'S CHECK-IN
								</h3>
								<p className="text-lg font-light text-white">
									{todayCompleted ? "Completed" : "Pending"}
								</p>
							</div>
						</div>
					</div>

					{!todayCompleted ? (
						<button
							onClick={handleStartCheckin}
							className="w-full border border-purple-400/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 px-4 py-3 rounded-sm text-sm font-light tracking-wide transition-all duration-300"
						>
							START TODAY'S CHECK-IN
						</button>
					) : (
						<div className="mt-4 p-3 bg-white/5 rounded-sm border border-green-500/20">
							<div className="flex items-center justify-between text-xs mb-2">
								<span className="text-gray-400">Mood:</span>
								<div className="flex space-x-1">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={`w-3 h-3 ${
												i < todayData.mood
													? "text-yellow-400 fill-current"
													: "text-gray-500"
											}`}
										/>
									))}
								</div>
							</div>
							<div className="flex items-center justify-between text-xs">
								<span className="text-gray-400">Energy:</span>
								<span className="text-purple-400">{todayData.energy}/10</span>
							</div>
						</div>
					)}
				</div>

				{/* Current Streak */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 rounded-sm p-6">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-sm flex items-center justify-center">
								<Award className="w-5 h-5 text-white" />
							</div>
							<div>
								<h3 className="text-sm font-light tracking-wider text-gray-300">
									CURRENT STREAK
								</h3>
								<p className="text-2xl font-light text-white">
									{currentStreak} days
								</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-xs text-gray-500 tracking-wide">
								BEST: 12 days
							</p>
							<p className="text-xs text-gray-500 tracking-wide">
								THIS MONTH: {monthlyStats.completed}/{monthlyStats.total}
							</p>
						</div>
					</div>

					{/* Streak visualization */}
					<div className="flex space-x-1 mt-4">
						{[...Array(14)].map((_, i) => (
							<div
								key={i}
								className={`h-2 flex-1 rounded-full ${
									i < currentStreak
										? "bg-gradient-to-r from-orange-500 to-red-500"
										: "bg-white/10"
								}`}
							/>
						))}
					</div>
				</div>

				{/* Weekly Overview */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 rounded-sm p-6">
					<div className="flex items-center space-x-3 mb-6">
						<div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-sm flex items-center justify-center">
							<TrendingUp className="w-5 h-5 text-white" />
						</div>
						<div>
							<h3 className="text-sm font-light tracking-wider text-gray-300">
								WEEKLY OVERVIEW
							</h3>
							<p className="text-lg font-light text-white">
								{weeklyData.filter((d) => d.completed).length}/7 days completed
							</p>
						</div>
					</div>

					<div className="grid grid-cols-7 gap-2">
						{weeklyData.map((day, index) => (
							<div key={index} className="text-center">
								<div className="text-xs text-gray-500 mb-2 tracking-wide">
									{day.day}
								</div>
								<div
									className={`w-12 h-12 rounded-sm border flex flex-col items-center justify-center ${
										day.completed
											? "border-green-500/30 bg-green-500/10"
											: "border-white/10 bg-white/5"
									}`}
								>
									{day.completed ? (
										<>
											<div className="flex space-x-1 mb-1">
												{[...Array(day.mood)].map((_, i) => (
													<div
														key={i}
														className="w-1 h-1 bg-yellow-400 rounded-full"
													/>
												))}
											</div>
											<div className="text-xs text-cyan-400">{day.energy}</div>
										</>
									) : (
										<div className="w-2 h-2 bg-gray-500 rounded-full" />
									)}
								</div>
							</div>
						))}
					</div>

					<div className="mt-4 flex items-center justify-between text-xs text-gray-500">
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<div className="w-2 h-2 bg-yellow-400 rounded-full" />
								<span>Mood</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="w-2 h-2 bg-cyan-400 rounded-full" />
								<span>Energy</span>
							</div>
						</div>
						<span className="tracking-wide">
							Avg: {averages.mood} • {averages.energy}
						</span>
					</div>
				</div>
			</div>

			{/* Insights Section */}
			<div className="border border-white/10 backdrop-blur-sm bg-white/5 rounded-sm p-6">
				<div className="flex items-center space-x-3 mb-6">
					<div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-sm flex items-center justify-center">
						<BarChart3 className="w-5 h-5 text-white" />
					</div>
					<div>
						<h3 className="text-sm font-light tracking-wider text-gray-300">
							INSIGHTS & PATTERNS
						</h3>
						<p className="text-lg font-light text-white">
							Your wellbeing trends
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/10">
						<div>
							<p className="text-sm text-white font-light">Peak Energy Day</p>
							<p className="text-xs text-gray-400 mt-1">
								Friday averages 8.5/10
							</p>
						</div>
						<div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-sm flex items-center justify-center">
							<TrendingUp className="w-4 h-4 text-white" />
						</div>
					</div>

					<div className="flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/10">
						<div>
							<p className="text-sm text-white font-light">Mood Trend</p>
							<p className="text-xs text-gray-400 mt-1">Improving this week</p>
						</div>
						<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-sm flex items-center justify-center">
							<BarChart3 className="w-4 h-4 text-white" />
						</div>
					</div>

					<div className="flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/10">
						<div>
							<p className="text-sm text-white font-light">Consistency</p>
							<p className="text-xs text-gray-400 mt-1">86% completion rate</p>
						</div>
						<div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-sm flex items-center justify-center">
							<Target className="w-4 h-4 text-white" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CheckinDashboard;
