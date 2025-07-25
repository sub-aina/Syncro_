import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import AddTeamMemberForm from "../components/TeamMember";
import CreateTeamForm from "../components/CreateTeamForm";
import TeamDetailView from "../components/TeamView";

const TeamView = () => {
	const [currentView, setCurrentView] = useState("list"); // "list", "create", "detail"
	const [selectedTeamId, setSelectedTeamId] = useState(null);
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch all teams for the user
	const fetchTeams = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("token");
			const response = await API.get("/teams", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setTeams(response.data.teams);
		} catch (err) {
			console.error("Failed to fetch teams:", err);
			setError(err.response?.data?.message || "Error fetching teams");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTeams();
	}, []);

	// Callback after creating a team
	const handleTeamCreated = (newTeam) => {
		console.log("Team created:", newTeam);
		setTeams((prev) => [newTeam, ...prev]); // Add new team to the list
		setCurrentView("list");
	};

	// Handle viewing team details
	const handleViewTeam = (teamId) => {
		setSelectedTeamId(teamId);
		setCurrentView("detail");
	};

	// Handle going back to teams list
	const handleBackToList = () => {
		setCurrentView("list");
		setSelectedTeamId(null);
	};

	// Handle showing create form
	const handleShowCreateForm = () => {
		setCurrentView("create");
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<h2 className="text-2xl font-light tracking-wider">Teams</h2>
				<p className="text-gray-400">Loading teams...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<p className="text-gray-500 text-sm tracking-wide mt-1">
						{currentView === "create" && "Create a new team"}
						{currentView === "detail" && "Team details and members"}
					</p>
				</div>

				{currentView === "list" && (
					<button
						onClick={handleShowCreateForm}
						className="border border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-sm font-light tracking-wide transition-all duration-300"
					>
						Create Team
					</button>
				)}

				{(currentView === "create" || currentView === "detail") && (
					<button
						onClick={handleBackToList}
						className="border border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-sm font-light tracking-wide transition-all duration-300"
					>
						Back to Teams
					</button>
				)}
			</div>

			{error && (
				<div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm">
					{error}
				</div>
			)}

			{currentView === "list" && (
				<div className="space-y-4">
					{teams.length > 0 ? (
						<div className="grid gap-4">
							{teams.map((team) => (
								<div
									key={team._id}
									className="bg-white/5 border border-white/10 rounded-sm p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer"
									onClick={() => handleViewTeam(team._id)}
								>
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<h3 className="text-lg font-light tracking-wide text-white">
												{team.name}
											</h3>
											<p className="text-gray-400 text-sm mt-1">
												{team.description}
											</p>
											<div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
												<span>{team.memberCount} members</span>
												<span>
													Created by{" "}
													{team.createdBy?.name || team.createdBy?.email}
												</span>
												{team.createdAt && (
													<span>
														{new Date(team.createdAt).toLocaleDateString()}
													</span>
												)}
											</div>
										</div>
										<div className="text-gray-400 hover:text-white transition-colors">
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<div className="text-gray-400 mb-4">
								<svg
									className="w-16 h-16 mx-auto mb-4 opacity-50"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1}
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
								<h3 className="text-lg font-light">No teams yet</h3>
								<p className="text-sm mt-1">
									Create your first team to start collaborating
								</p>
							</div>
							<button
								onClick={handleShowCreateForm}
								className="border border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-sm font-light tracking-wide transition-all duration-300"
							>
								Create Your First Team
							</button>
						</div>
					)}
				</div>
			)}

			{currentView === "create" && (
				<CreateTeamForm onTeamCreated={handleTeamCreated} />
			)}

			{currentView === "detail" && selectedTeamId && (
				<>
					{/* Back Button */}
					<div className="flex justify-between items-center">
						<button
							onClick={handleBackToList}
							className="border border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-sm font-light tracking-wide transition-all duration-300"
						>
							← Back to Teams
						</button>
					</div>
					{/* Resource Library Box */}
					<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-4 rounded-sm flex items-center justify-between">
						<div>
							<h4 className="text-white text-sm font-light tracking-wide mb-1">
								Shared Resource Library
							</h4>

							<p className="text-gray-500 text-xs">
								Access files, links and references shared with this team.
							</p>
						</div>
						<Link
							to={`/team/${selectedTeamId}/resources`}
							className="text-sm text-blue-400 border border-blue-400/20 px-4 py-2 rounded-sm hover:bg-blue-400/10 transition-colors"
						>
							Open Library
						</Link>
					</div>

					{/* Team Detail View */}
					<TeamDetailView teamId={selectedTeamId} />

					{/* Add Team Member Form */}
					<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm">
						<AddTeamMemberForm teamId={selectedTeamId} />
					</div>
				</>
			)}
		</div>
	);
};

export default TeamView;
