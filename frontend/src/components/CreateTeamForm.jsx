import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateTeamForm = ({ onTeamCreated }) => {
	const [name, setName] = useState("");
	const [desc, setDesc] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const token = localStorage.getItem("token");

			if (!token) {
				setError("Authentication token not found");
				return;
			}

			const res = await axios.post(
				"https://syncro-crhm.onrender.com/api/teams",
				{
					name: name.trim(),
					description: desc.trim(),
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			console.log("Team creation response:", res.data);
			const teamId = res.data.team?._id || res.data._id;

			if (!teamId) {
				throw new Error("Team ID not received from server");
			}

			if (onTeamCreated) {
				onTeamCreated(teamId);
			}

			setName("");
			setDesc("");
		} catch (err) {
			console.error("Team creation error:", err);
			const errorMessage =
				err.response?.data?.message ||
				err.response?.data?.error ||
				err.message ||
				"Team creation failed";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm">
			<h3 className="text-lg font-light tracking-wide mb-4">Create New Team</h3>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm text-gray-400 mb-2">
						Team Name *
					</label>
					<input
						type="text"
						placeholder="Enter team name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full bg-white/5 border border-white/20 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors"
						required
						disabled={loading}
					/>
				</div>

				<div>
					<label className="block text-sm text-gray-400 mb-2">
						Description
					</label>
					<textarea
						placeholder="Enter team description"
						value={desc}
						onChange={(e) => setDesc(e.target.value)}
						rows={3}
						className="w-full bg-white/5 border border-white/20 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors resize-none"
						disabled={loading}
					/>
				</div>

				<button
					type="submit"
					className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-sm font-light tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={loading}
				>
					{loading ? "Creating Team..." : "Create Team"}
				</button>

				{error && (
					<div className="bg-red-500/10 border border-red-500/20 rounded-sm p-3">
						<p className="text-red-400 text-sm">{error}</p>
					</div>
				)}
			</form>
		</div>
	);
};

export default CreateTeamForm;
