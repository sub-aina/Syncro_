import React, { useState } from "react";
import { createProject } from "../services/createproj";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import API from "../api";
const ProjectForm = () => {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		deadline: "",
		course: "",
		goals: "",
		status: "active",
	});
	const [teams, setTeams] = useState([]);
	const [teamId, setTeamId] = useState("");
	const [teamMembers, setTeamMembers] = useState([]);

	const navigate = useNavigate();

	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		const fetchTeams = async () => {
			try {
				const token = localStorage.getItem("token");
				const res = await API.get("/teams", {
					headers: { Authorization: token },
				});
				const data = res.data;

				setTeams(data.teams);
			} catch (err) {
				console.error("Failed to fetch teams", err);
			}
		};
		fetchTeams();
	}, []);

	useEffect(() => {
		const fetchTeamMembers = async () => {
			if (!teamId) return setTeamMembers([]);

			try {
				const token = localStorage.getItem("token");
				const res = await API.get(`/teams/${teamId}/details`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const data = res.data;

				setTeamMembers(data.team.members);
			} catch (err) {
				console.error("Failed to fetch team details", err);
			}
		};
		fetchTeamMembers();
	}, [teamId]);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		const goalList = formData.goals.split(",").map((g) => g.trim());

		try {
			const project = await createProject({
				...formData,
				goals: goalList,
				team: teamId || null,
			});
			navigate("/dashboard/projects");
			console.log("Project created:", project);
		} catch (err) {
			console.error(" Error:", err.error || err.message);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-[#1a0a2e] to-[#16213e] text-white">
			{/* Navigation */}
			<nav className="border-b border-white/10 backdrop-blur-sm bg-white/5">
				<div className="max-w-7xl mx-auto px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-8">
							<h1 className="text-xl font-light tracking-wider">Syncro</h1>
							<div className="hidden md:flex space-x-6">
								<button
									onClick={() => navigate("/dashboard")}
									className="text-gray-400 hover:text-white text-sm font-light tracking-wide transition-colors"
								>
									Dashboard
								</button>
								<span className="text-gray-300 text-sm font-light tracking-wide">
									Create Project
								</span>
							</div>
						</div>
						<button
							onClick={() => navigate("/dashboard")}
							className="text-gray-400 hover:text-white text-sm font-light tracking-wide transition-colors"
						>
							← Back
						</button>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<div className="max-w-2xl mx-auto px-6 py-12">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-light tracking-wider mb-4">
						Create Project
					</h1>
					<p className="text-gray-400 text-sm tracking-wide">
						Set up your new project workspace
					</p>
				</div>

				{/* Form Container */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 rounded-sm p-8">
					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Project Name */}
						<div>
							<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
								Project Name
							</label>
							<input
								name="name"
								type="text"
								placeholder="Enter project name"
								value={formData.name}
								onChange={handleChange}
								required
								className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 font-light tracking-wide"
							/>
						</div>

						{/* Description */}
						<div>
							<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
								Description
							</label>
							<textarea
								name="description"
								placeholder="Describe your project"
								value={formData.description}
								onChange={handleChange}
								required
								rows={4}
								className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 font-light tracking-wide resize-none"
							/>
						</div>

						{/* Course and Deadline Row */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
									Course Name
								</label>
								<input
									name="course"
									type="text"
									placeholder="Enter course name"
									value={formData.course}
									onChange={handleChange}
									required
									className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 font-light tracking-wide"
								/>
							</div>

							<div>
								<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
									Deadline
								</label>
								<input
									name="deadline"
									type="date"
									value={formData.deadline}
									onChange={handleChange}
									required
									className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 font-light tracking-wide"
								/>
							</div>
						</div>

						<div className="mb-6">
							<label className="block text-sm text-gray-300 font-semibold tracking-wide mb-2">
								Assign to Team{" "}
								<span className="text-gray-500 font-normal">(optional)</span>
							</label>
							<select
								value={teamId}
								onChange={(e) => setTeamId(e.target.value)}
								className="w-full bg-[#1e1b2e] border border-white/10 text-sm text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
							>
								<option value="">— No Team (Independent Project) —</option>
								{teams.map((team) => (
									<option key={team._id} value={team._id}>
										{team.name}
									</option>
								))}
							</select>

							{/* Team Members Preview */}
							{teamMembers.length > 0 && (
								<div className="mt-4 border border-white/10 rounded-md bg-white/5 px-4 py-3">
									<p className="text-sm text-gray-300 font-medium mb-2">
										Team Members
									</p>
									<ul className="space-y-1 text-sm text-gray-400 list-disc list-inside pl-2">
										{teamMembers.map((member) => (
											<li key={member._id}>
												<span className="font-medium text-white">
													{member.name}
												</span>{" "}
												<span className="text-gray-400">({member.email})</span>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>

						{/* Goals */}
						<div>
							<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
								Goals
							</label>
							<input
								name="goals"
								type="text"
								placeholder="Enter goals separated by commas"
								value={formData.goals}
								onChange={handleChange}
								required
								className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 font-light tracking-wide"
							/>
							<p className="text-gray-500 text-xs tracking-wide mt-2">
								Separate multiple goals with commas
							</p>
						</div>

						{/* Status */}
						<div>
							<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
								Status
							</label>
							<select
								name="status"
								value={formData.status}
								onChange={handleChange}
								className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 font-light tracking-wide"
							>
								<option value="active" className="bg-[#1a0a2e] text-white">
									Active
								</option>
								<option value="planning" className="bg-[#1a0a2e] text-white">
									Planning
								</option>
								<option value="completed" className="bg-[#1a0a2e] text-white">
									Completed
								</option>
							</select>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 pt-6">
							<button
								type="button"
								onClick={() => navigate("/dashboard")}
								className="flex-1 border border-white/20 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-sm font-light tracking-wide transition-all duration-300"
							>
								CANCEL
							</button>
							<button
								onClick={handleSubmit}
								disabled={isSubmitting}
								className="flex-1 border border-purple-400/30 bg-purple-500/10 hover:bg-purple-500/20 text-white px-6 py-3 rounded-sm font-light tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
							>
								{isSubmitting ? (
									<>
										<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
										<span>CREATING...</span>
									</>
								) : (
									<>
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
										<span>CREATE PROJECT</span>
									</>
								)}
							</button>
						</div>
					</form>
				</div>

				{/* Help Text */}
				<div className="text-center mt-8">
					<p className="text-gray-500 text-xs tracking-wide">
						Need help? Check out our{" "}
						<a
							href="#"
							className="text-purple-400 hover:text-purple-300 transition-colors"
						>
							project creation guide
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default ProjectForm;
