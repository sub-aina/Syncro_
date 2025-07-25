import React from "react";
import { useNavigate } from "react-router-dom";

const ProjectsView = ({ projects = [] }) => {
	const navigate = useNavigate();

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

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
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
};

export default ProjectsView;
