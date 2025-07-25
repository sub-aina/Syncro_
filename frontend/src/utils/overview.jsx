import React from "react";

const OverviewView = ({ projects = [] }) => (
	<div className="space-y-8">
		{/* Stats Grid */}
		<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
			<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-gray-400 text-xs tracking-wider uppercase mb-2">
							Total Projects
						</p>
						{/* <p className="text-3xl font-light">{projects.length}</p> */}
						<p className="text-3xl font-light">{projects?.length || 0}</p>
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
			<h3 className="text-lg font-light tracking-wide mb-6">Recent Activity</h3>
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

export default OverviewView;
