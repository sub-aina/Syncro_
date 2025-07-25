import { useState, useEffect } from "react";
import { newTeamMember } from "../services/teammember";

const AddTeamMemberForm = ({ teamId }) => {
	const [identifier, setIdentifier] = useState("");
	const [status, setStatus] = useState(null);
	const [loading, setLoading] = useState(false);
	const [members, setMembers] = useState([]);

	// Debug logging
	useEffect(() => {
		console.log("AddTeamMemberForm received teamId:", teamId);
	}, [teamId]);

	const handleAddMember = async (e) => {
		e.preventDefault();

		if (!teamId) {
			setStatus({
				type: "error",
				message: "Team ID is required",
			});
			return;
		}

		if (!identifier.trim()) {
			setStatus({
				type: "error",
				message: "Please enter an email or roll number",
			});
			return;
		}

		setLoading(true);
		setStatus(null);

		try {
			console.log(
				"Adding member with teamId:",
				teamId,
				"identifier:",
				identifier
			);
			const response = await newTeamMember(teamId, identifier.trim());
			console.log("Add member response:", response);

			setStatus({
				type: "success",
				message: response.message || "Member added successfully",
			});
			setIdentifier("");

			// If response includes member data, add to local state
			if (response.member) {
				setMembers((prev) => [...prev, response.member]);
			}
		} catch (error) {
			console.error("Add member error:", error);
			const msg =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.message ||
				"Failed to add member";
			setStatus({ type: "error", message: msg });
		} finally {
			setLoading(false);
		}
	};

	if (!teamId) {
		return (
			<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-sm">
				<p className="text-red-400">Error: No team selected</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-light tracking-wide">Add Team Member</h3>

			<form onSubmit={handleAddMember} className="space-y-4">
				<div>
					<label className="block text-sm text-gray-400 mb-2">
						Email or Roll Number *
					</label>
					<input
						type="text"
						value={identifier}
						onChange={(e) => setIdentifier(e.target.value)}
						placeholder="Enter email or roll number"
						className="w-full bg-white/5 border border-white/20 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors"
						required
						disabled={loading}
					/>
				</div>

				<button
					type="submit"
					className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-sm font-light tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={loading}
				>
					{loading ? "Adding Member..." : "Add Member"}
				</button>
			</form>

			{status && (
				<div
					className={`p-3 rounded-sm border ${
						status.type === "success"
							? "bg-green-500/10 border-green-500/20"
							: "bg-red-500/10 border-red-500/20"
					}`}
				>
					<p
						className={`text-sm ${
							status.type === "success" ? "text-green-400" : "text-red-400"
						}`}
					>
						{status.message}
					</p>
				</div>
			)}

			{/* Display current members if available */}
			{members.length > 0 && (
				<div className="mt-6">
					<h4 className="text-md font-light tracking-wide mb-3">
						Team Members
					</h4>
					<div className="space-y-2">
						{members.map((member, index) => (
							<div
								key={index}
								className="bg-white/5 border border-white/10 rounded-sm p-3"
							>
								<p className="text-white text-sm">
									{member.email || member.identifier}
								</p>
								{member.role && (
									<p className="text-gray-400 text-xs">{member.role}</p>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default AddTeamMemberForm;
