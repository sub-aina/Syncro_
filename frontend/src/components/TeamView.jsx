import { useEffect, useState } from "react";
import API from "../api";

const TeamDetailView = ({ teamId }) => {
	const [team, setTeam] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchTeamDetails = async () => {
			try {
				const token = localStorage.getItem("token");
				const response = await API.get(`/teams/${teamId}/details`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.status !== 200) {
					throw new Error("Failed to fetch team details jn");
				}
				setTeam(response.data.team);
			} catch (err) {
				console.error("Failed to fetch team details:", err);
				setError(err.response?.data?.message || "Error fetching team");
			} finally {
				setLoading(false);
			}
		};

		if (teamId) {
			fetchTeamDetails();
		}
	}, [teamId]);

	if (loading) return <p className="text-gray-400">Loading team...</p>;
	if (error) return <p className="text-red-400">Error: {error}</p>;
	if (!team) return null;

	return (
		<div className="space-y-6">
			<div className="p-6 bg-white/5 border border-white/10 rounded-sm">
				<h2 className="text-2xl font-light tracking-wider">{team.name}</h2>
				<p className="text-gray-400 mt-1">{team.description}</p>
			</div>

			<div>
				<h3 className="text-lg font-light tracking-wide mb-2">Team Members</h3>
				{team.members.length > 0 ? (
					<div className="space-y-2">
						{team.members.map((member) => (
							<div
								key={member._id}
								className="bg-white/5 border border-white/10 rounded-sm p-3"
							>
								<p className="text-white text-sm">
									{member.name || member.email}
								</p>
								<p className="text-gray-400 text-xs">
									{member.email} | {member.studentId}
								</p>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-400 text-sm">No members yet.</p>
				)}
			</div>
		</div>
	);
};

export default TeamDetailView;
