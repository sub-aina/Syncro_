import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import API from "../api";

import CheckinDashboard from "./checkindash";
import NavigationBar from "../utils/navbar";
import OverviewView from "../utils/overview";
import ProjectsView from "../utils/projectsview";
import TeamView from "../utils/teamview";

const Dashboard = () => {
	const [projects, setProjects] = useState([]);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const fetchprojects = async () => {
			try {
				const token = localStorage.getItem("token");
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

	const getHeading = () => {
		if (location.pathname.includes("projects")) return "Projects";
		if (location.pathname.includes("checkins")) return "Check-ins";
		if (location.pathname.includes("team")) return "Team";
		return "Dashboard";
	};

	const getSubtext = () => {
		if (location.pathname.includes("projects"))
			return "Manage your projects and track progress";
		if (location.pathname.includes("checkins"))
			return "Monitor your daily wellbeing and productivity";
		if (location.pathname.includes("team"))
			return "Collaborate and manage team members";
		return "Your workspace at a glance";
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-[#1a0a2e] to-[#16213e] text-white relative">
			<NavigationBar onNavigate={(view) => navigate(`/dashboard/${view}`)} />

			<div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
				<div className="mb-12">
					<h1 className="text-4xl font-light tracking-wider mb-4">
						{getHeading()}
					</h1>
					<p className="text-gray-400 text-sm tracking-wide">{getSubtext()}</p>
				</div>

				<Routes>
					<Route path="/" element={<OverviewView projects={projects} />} />
					<Route
						path="projects"
						element={<ProjectsView projects={projects} />}
					/>
					<Route path="checkins" element={<CheckinDashboard />} />
					<Route path="team" element={<TeamView />} />
				</Routes>
			</div>
		</div>
	);
};

export default Dashboard;
