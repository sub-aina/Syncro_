import React, { useEffect, useState } from "react";
import { getProjects } from "../services/getproj";
import { updateStatus } from "../services/updateStatus";
import { addTeamMember } from "../services/addTeamMember";
import { useNavigate } from "react-router-dom";

const ProjDashboard = () => {
	const [projects, setProjects] = useState([]);
	const [memberInput, setMemberInput] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getProjects();
				setProjects(data);
			} catch (err) {
				console.error("error:", err.error || err.message);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleStatusChange = async (id, newStatus) => {
		try {
			await updateStatus(id, newStatus);
			setProjects((prev) =>
				prev.map((proj) =>
					proj._id === id ? { ...proj, status: newStatus } : proj
				)
			);
		} catch (err) {
			console.error("Status update failed:", err);
		}
	};

	const handleAddTeamMember = async (projectId) => {
		try {
			await addTeamMember(projectId, memberInput[projectId]);
			alert("Team member added successfully");
			setMemberInput({ ...memberInput, [projectId]: "" });
		} catch (err) {
			console.error("Error adding team member:", err);
			alert("Failed to add team member");
		}
	};

	const getStatusColor = (status) => {
		switch (status.toLowerCase()) {
			case "active":
				return "text-green-400 bg-green-500/10 border-green-500/30";
			case "completed":
				return "text-blue-400 bg-blue-500/10 border-blue-500/30";
			case "planning":
				return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
			default:
				return "text-gray-400 bg-gray-500/10 border-gray-500/30";
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-[#1a0a2e] to-[#16213e] text-white">
			{/* Navigation */}
			<nav className="border-b border-white/10 backdrop-blur-sm bg-white/5">
				<div className="max-w-7xl mx-auto px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-8">
							<h1 className="text-xl font-light tracking-wider">DAPPR</h1>
							<div className="hidden md:flex space-x-6">
								<span className="text-gray-300 text-sm font-light tracking-wide">
									Dashboard
								</span>
								<button
									onClick={() => navigate("/create-project")}
									className="text-gray-400 hover:text-white text-sm font-light tracking-wide transition-colors"
								>
									Create Project
								</button>
							</div>
						</div>
						<button
							onClick={() => navigate("/create-project")}
							className="border border-purple-400/30 bg-purple-500/10 hover:bg-purple-500/20 text-white px-4 py-2 rounded-sm font-light tracking-wide transition-all duration-300 flex items-center space-x-2"
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
				</div>
			</nav>

			{/* Main Content */}
			<div className="max-w-6xl mx-auto px-6 py-12">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-light tracking-wider mb-4">
						Your Projects
					</h1>
					<p className="text-gray-400 text-sm tracking-wide">
						Manage and track your project progress
					</p>
				</div>

				{/* Loading State */}
				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
					</div>
				) : (
					<div className="grid gap-6">
						{projects.length === 0 ? (
							<div className="text-center py-12">
								<div className="border border-white/10 backdrop-blur-sm bg-white/5 rounded-sm p-8">
									<h3 className="text-lg font-light tracking-wide mb-2">
										No projects yet
									</h3>
									<p className="text-gray-400 text-sm tracking-wide mb-6">
										Create your first project to get started
									</p>
									<button
										onClick={() => navigate("/create-project")}
										className="border border-purple-400/30 bg-purple-500/10 hover:bg-purple-500/20 text-white px-6 py-3 rounded-sm font-light tracking-wide transition-all duration-300"
									>
										CREATE PROJECT
									</button>
								</div>
							</div>
						) : (
							projects.map((project) => (
								<div
									key={project._id}
									className="border border-white/10 backdrop-blur-sm bg-white/5 rounded-sm p-6 hover:bg-white/10 transition-all duration-300"
								>
									{/* Project Header */}
									<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
										<div className="mb-4 md:mb-0">
											<h3 className="text-xl font-light tracking-wide mb-2">
												{project.name}
											</h3>
											<p className="text-gray-400 text-sm tracking-wide">
												{project.description}
											</p>
										</div>
										<div
											className={`inline-flex items-center px-3 py-1 rounded-sm border text-xs tracking-wider uppercase ${getStatusColor(
												project.status
											)}`}
										>
											{project.status}
										</div>
									</div>

									{/* Project Details */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
										<div>
											<label className="block text-gray-400 text-xs tracking-wider uppercase mb-2">
												Deadline
											</label>
											<p className="text-white font-light tracking-wide">
												{project.deadline?.substring(0, 10) ||
													"No deadline set"}
											</p>
										</div>
										<div>
											<label className="block text-gray-400 text-xs tracking-wider uppercase mb-2">
												Course
											</label>
											<p className="text-white font-light tracking-wide">
												{project.course || "No course specified"}
											</p>
										</div>
									</div>

									{/* Goals */}
									{project.goals && project.goals.length > 0 && (
										<div className="mb-6">
											<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
												Goals
											</label>
											<div className="flex flex-wrap gap-2">
												{project.goals.map((goal, index) => (
													<span
														key={index}
														className="bg-white/5 border border-white/10 px-3 py-1 rounded-sm text-xs tracking-wide"
													>
														{goal}
													</span>
												))}
											</div>
										</div>
									)}

									{/* Team Members */}
									<div className="mb-6">
										<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
											Team Members
										</label>
										<div className="flex flex-wrap gap-2 mb-3">
											{project.teamMembers?.length ? (
												project.teamMembers.map((member, index) => (
													<span
														key={index}
														className="bg-purple-500/10 border border-purple-400/30 px-3 py-1 rounded-sm text-xs tracking-wide text-purple-300"
													>
														{member.name || member.email}
													</span>
												))
											) : (
												<span className="text-gray-400 text-sm tracking-wide">
													Just you
												</span>
											)}
										</div>
									</div>

									{/* Actions */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{/* Status Update */}
										<div>
											<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
												Update Status
											</label>
											<select
												value={project.status}
												onChange={(e) =>
													handleStatusChange(project._id, e.target.value)
												}
												className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 font-light tracking-wide"
											>
												<option
													value="active"
													className="bg-[#1a0a2e] text-white"
												>
													Active
												</option>
												<option
													value="planning"
													className="bg-[#1a0a2e] text-white"
												>
													Planning
												</option>
												<option
													value="completed"
													className="bg-[#1a0a2e] text-white"
												>
													Completed
												</option>
											</select>
										</div>

										{/* Add Team Member */}
										<div>
											<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
												Add Team Member
											</label>
											<div className="flex gap-2">
												<input
													type="text"
													placeholder="Enter student ID"
													value={memberInput[project._id] || ""}
													onChange={(e) =>
														setMemberInput({
															...memberInput,
															[project._id]: e.target.value,
														})
													}
													className="flex-1 bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 font-light tracking-wide"
												/>
												<button
													onClick={() => handleAddTeamMember(project._id)}
													className="border border-purple-400/30 bg-purple-500/10 hover:bg-purple-500/20 text-white px-4 py-2 rounded-sm font-light tracking-wide transition-all duration-300 flex items-center space-x-2"
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
													<span>ADD</span>
												</button>
											</div>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ProjDashboard;
