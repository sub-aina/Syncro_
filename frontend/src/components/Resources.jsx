import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import API from "../api";

const TeamResources = () => {
	const { teamId } = useParams();
	const [resources, setResources] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [form, setForm] = useState({
		title: "",
		type: "file",
		file: null,
		url: "",
		note: "",
		tags: "",
	});

	//  Fetch resources on load
	useEffect(() => {
		const fetchResources = async () => {
			try {
				const token = localStorage.getItem("token");
				// console.log("Fetching resources for team:", teamId);

				const res = await API.get(`/resources/${teamId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				// const data = await res.json();
				// console.log("Fetched resources:", res.data);
				setResources(res.data);
			} catch (err) {
				setError("Failed to load resources");
			}
		};
		fetchResources();
	}, [teamId]);

	//  Handle form changes
	const handleChange = (e) => {
		const { name, value, files } = e.target;
		if (name === "file") {
			setForm((prev) => ({ ...prev, file: files[0] }));
		} else {
			setForm((prev) => ({ ...prev, [name]: value }));
		}
	};

	//  Submit new resource
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		const data = new FormData();
		const token = localStorage.getItem("token");

		console.log("Submitting resource:", form);
		for (let key in form) {
			if (form[key]) data.append(key, form[key]);
		}
		try {
			await API.post(`/resources/${teamId}`, data, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
				},
			});
			// console.log("Resource uploaded successfully");
			window.location.reload();
		} catch (err) {
			setError("Upload failed");
		}
		setLoading(false);
	};

	const getTypeIcon = (type) => {
		switch (type) {
			case "file":
				return (
					<svg
						className="w-5 h-5 text-blue-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				);
			case "link":
				return (
					<svg
						className="w-5 h-5 text-green-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
						/>
					</svg>
				);
			case "note":
				return (
					<svg
						className="w-5 h-5 text-purple-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				);
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-[#1a0a2e] to-[#16213e] text-white">
			<div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
				{/* Header */}
				<div className="mb-12">
					<h1 className="text-4xl font-light tracking-wider mb-4">
						Shared Resource Library
					</h1>
					<p className="text-gray-400 text-sm tracking-wide">
						Manage and share resources with your team members
					</p>
				</div>

				{/* Error Display */}
				{error && (
					<div className="mb-8 border border-red-500/20 backdrop-blur-sm bg-red-500/10 p-4 rounded-sm">
						<p className="text-red-400 text-sm tracking-wide">{error}</p>
					</div>
				)}

				{/* Upload Form */}
				<div className="mb-12">
					<div className="border border-white/10 backdrop-blur-sm bg-white/5 p-8 rounded-sm">
						<h2 className="text-xl font-light tracking-wide mb-6 flex items-center space-x-3">
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
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
							<span>Add New Resource</span>
						</h2>

						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<label className="text-gray-400 text-xs tracking-wider uppercase">
										Title
									</label>
									<input
										type="text"
										name="title"
										placeholder="Enter resource title"
										className="w-full p-3 rounded-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/20 focus:bg-white/10 transition-all duration-300 font-light tracking-wide"
										onChange={handleChange}
										required
									/>
								</div>

								<div className="space-y-2">
									<label className="text-gray-400 text-xs tracking-wider uppercase">
										Type
									</label>
									<select
										name="type"
										className="w-full p-3 rounded-sm bg-white/5 border border-white/10 text-white focus:border-white/20 focus:bg-white/10 transition-all duration-300 font-light tracking-wide"
										value={form.type}
										onChange={handleChange}
									>
										<option value="file" className="bg-black">
											📎 File
										</option>
										<option value="link" className="bg-black">
											🔗 Link
										</option>
										<option value="note" className="bg-black">
											📝 Note
										</option>
									</select>
								</div>
							</div>

							{form.type === "file" && (
								<div className="space-y-2">
									<label className="text-gray-400 text-xs tracking-wider uppercase">
										File Upload
									</label>
									<input
										type="file"
										name="file"
										onChange={handleChange}
										className="w-full p-3 bg-white/5 border border-white/10 rounded-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-light file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all duration-300"
										required
									/>
								</div>
							)}

							{form.type === "link" && (
								<div className="space-y-2">
									<label className="text-gray-400 text-xs tracking-wider uppercase">
										URL
									</label>
									<input
										type="url"
										name="url"
										placeholder="https://example.com"
										onChange={handleChange}
										className="w-full p-3 bg-white/5 border border-white/10 rounded-sm text-white placeholder-gray-500 focus:border-white/20 focus:bg-white/10 transition-all duration-300 font-light tracking-wide"
									/>
								</div>
							)}

							{form.type === "note" && (
								<div className="space-y-2">
									<label className="text-gray-400 text-xs tracking-wider uppercase">
										Note Content
									</label>
									<textarea
										name="note"
										placeholder="Write your note here..."
										onChange={handleChange}
										rows="4"
										className="w-full p-3 bg-white/5 border border-white/10 rounded-sm text-white placeholder-gray-500 focus:border-white/20 focus:bg-white/10 transition-all duration-300 font-light tracking-wide resize-none"
									/>
								</div>
							)}

							<div className="space-y-2">
								<label className="text-gray-400 text-xs tracking-wider uppercase">
									Tags
								</label>
								<input
									type="text"
									name="tags"
									placeholder="comma, separated, tags"
									onChange={handleChange}
									className="w-full p-3 bg-white/5 border border-white/10 rounded-sm text-white placeholder-gray-500 focus:border-white/20 focus:bg-white/10 transition-all duration-300 font-light tracking-wide"
								/>
							</div>

							<div className="flex justify-end">
								<button
									type="submit"
									className="border border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-sm font-light tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
									disabled={loading}
								>
									{loading ? (
										<>
											<svg
												className="animate-spin w-4 h-4"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
											<span>Uploading...</span>
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
											<span>Add Resource</span>
										</>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>

				{/* Resource Grid */}
				<div>
					<div className="flex justify-between items-center mb-8">
						<div>
							<h2 className="text-2xl font-light tracking-wider">Resources</h2>
							<p className="text-gray-500 text-sm tracking-wide mt-1">
								{resources.length} resource{resources.length !== 1 ? "s" : ""}{" "}
								available
							</p>
						</div>
					</div>

					{resources.length === 0 ? (
						<div className="border border-white/10 backdrop-blur-sm bg-white/5 rounded-sm">
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
									No resources found
								</p>
								<p className="text-gray-500 text-sm tracking-wide mt-2">
									Add your first resource to get started
								</p>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{resources.map((res) => (
								<div
									key={res._id}
									className="border border-white/10 backdrop-blur-sm bg-white/5 p-6 rounded-sm hover:bg-white/10 transition-all duration-300 group"
								>
									<div className="flex items-start justify-between mb-4">
										<div className="w-12 h-12 border border-white/10 bg-white/5 rounded-sm flex items-center justify-center group-hover:bg-white/10 transition-all duration-300">
											{getTypeIcon(res.type)}
										</div>
									</div>

									<h3 className="font-light text-lg tracking-wide text-white mb-3 line-clamp-2">
										{res.title}
									</h3>

									<div className="mb-4 text-sm text-gray-400">
										{res.type === "link" && (
											<a
												href={res.url}
												target="_blank"
												rel="noreferrer"
												className="text-blue-400 hover:text-blue-300 transition-colors break-all underline decoration-blue-400/30 hover:decoration-blue-300"
											>
												{res.url}
											</a>
										)}
										{res.type === "note" && (
											<p className="line-clamp-3 leading-relaxed">{res.note}</p>
										)}
										{res.type === "file" && (
											<a
												href={`https://syncro-crhm.onrender.com/${res.file.filepath}`}
												download={res.file.filename}
												className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-2 group/download"
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
														d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
												<span className="truncate">{res.file.filename}</span>
											</a>
										)}
									</div>

									{res.tags && res.tags.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{res.tags.map((tag, index) => (
												<span
													key={index}
													className="px-2 py-1 bg-white/5 border border-white/10 rounded-sm text-xs text-gray-400 tracking-wide"
												>
													{tag}
												</span>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default TeamResources;
