// import { useState } from "react";
// import { registerUser } from "../services/auth";
// import { useNavigate } from "react-router-dom";

// export default function SignUp() {
// 	const [form, setForm] = useState({
// 		name: "",
// 		email: "",
// 		password: "",
// 		studentId: "",
// 		major: "",
// 		year: "",
// 	});
// 	const [error, setError] = useState("");
// 	const navigate = useNavigate();

// 	const handleChange = (e) =>
// 		setForm({ ...form, [e.target.name]: e.target.value.trim() });

// 	const handleSubmit = async (e) => {
// 		e.preventDefault();
// 		try {
// 			const { token, user } = await registerUser(form);

// 			// Debug: Log what we received
// 			console.log("Received token:", token);
// 			console.log("Received user:", user);

// 			// Small delay to ensure localStorage is fully set
// 			setTimeout(() => {
// 				console.log("About to navigate to dashboard");
// 				navigate("/dashboard");
// 			}, 200);
// 		} catch (err) {
// 			console.error("Signup error:", err);
// 			setError(err.message);
// 		}
// 	};

// 	return (
// 		<form onSubmit={handleSubmit}>
// 			<h2 className="text-xl font-bold mb-4">Sign Up</h2>
// 			<input
// 				name="name"
// 				onChange={handleChange}
// 				placeholder="Name"
// 				required
// 				className="w-full mb-2 p-2 border text-black"
// 			/>
// 			<input
// 				name="email"
// 				type="email"
// 				onChange={handleChange}
// 				placeholder="Email"
// 				required
// 				className="w-full mb-2 p-2 border text-black"
// 			/>
// 			<input
// 				name="password"
// 				type="password"
// 				onChange={handleChange}
// 				placeholder="Password"
// 				required
// 				className="w-full mb-2 p-2 border text-black"
// 			/>
// 			<input
// 				name="studentId"
// 				onChange={handleChange}
// 				placeholder="Student ID"
// 				required
// 				className="w-full mb-2 p-2 border text-black"
// 			/>
// 			<input
// 				name="major"
// 				onChange={handleChange}
// 				placeholder="Major"
// 				className="w-full mb-2 p-2 border text-black"
// 			/>
// 			<input
// 				name="year"
// 				type="number"
// 				onChange={handleChange}
// 				placeholder="Year"
// 				className="w-full mb-2 p-2 border text-black"
// 			/>
// 			<button
// 				type="submit"
// 				className="w-full bg-green-600 text-black py-2 mt-2"
// 			>
// 				Create Account
// 			</button>
// 			{error && <p className="text-red-500 mt-2">{error}</p>}
// 		</form>
// 	);
// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth";
// Custom Pixel Art Avatar Component
const PixelArtAvatar = ({ name, size = 64, colors }) => {
	// Generate a deterministic pattern based on name
	const generatePattern = (name) => {
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = ((hash << 5) - hash + name.charCodeAt(i)) & 0xffffffff;
		}

		// Create a 8x8 grid pattern (symmetric)
		const pattern = [];
		for (let i = 0; i < 32; i++) {
			pattern.push(!!(hash & (1 << i % 32)));
		}

		// Make it symmetric by mirroring
		const symmetricPattern = [];
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				if (col < 4) {
					symmetricPattern.push(pattern[row * 4 + col]);
				} else {
					symmetricPattern.push(pattern[row * 4 + (7 - col)]);
				}
			}
		}

		return symmetricPattern;
	};

	if (!name) return null;

	const pattern = generatePattern(name);
	const pixelSize = size / 8;
	const backgroundColor = colors[0];
	const pixelColor = colors[1];

	return (
		<div
			className="rounded-full overflow-hidden"
			style={{
				width: size,
				height: size,
				backgroundColor: backgroundColor,
				display: "grid",
				gridTemplateColumns: "repeat(8, 1fr)",
				gridTemplateRows: "repeat(8, 1fr)",
			}}
		>
			{pattern.map((filled, index) => (
				<div
					key={index}
					style={{
						backgroundColor: filled ? pixelColor : "transparent",
						width: "100%",
						height: "100%",
					}}
				/>
			))}
		</div>
	);
};

export default function SignUp() {
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		studentId: "",
		major: "",
		year: "",
		avatar: null, // Store the selected color scheme
	});
	const [error, setError] = useState("");
	const [showAvatarSelector, setShowAvatarSelector] = useState(false);
	const navigate = useNavigate();

	// Color schemes for pixel art avatars
	const colorSchemes = [
		["#FF6B6B", "#FFFFFF"], // Red with white
		["#4ECDC4", "#2C3E50"], // Teal with dark blue
		["#45B7D1", "#FFFFFF"], // Blue with white
		["#F9CA24", "#2C3E50"], // Yellow with dark
		["#F0932B", "#FFFFFF"], // Orange with white
		["#6C5CE7", "#FFFFFF"], // Purple with white
		["#A29BFE", "#2C3E50"], // Light purple with dark
		["#FD79A8", "#FFFFFF"], // Pink with white
		["#00B894", "#FFFFFF"], // Green with white
		["#E17055", "#FFFFFF"], // Coral with white
		["#2C3E50", "#FFFFFF"], // Dark with white
		["#34495E", "#ECF0F1"], // Dark grey with light
	];

	// Generate avatar options using different color schemes
	const generateAvatarOptions = () => {
		const name = form.name.trim();
		if (!name) return [];

		return colorSchemes.map((colors, index) => ({
			colors,
			id: `scheme-${index}`,
			name: name,
		}));
	};

	const handleChange = (e) =>
		setForm({ ...form, [e.target.name]: e.target.value.trim() });

	const handleAvatarSelect = (colorScheme) => {
		setForm({ ...form, avatar: colorScheme });
		setShowAvatarSelector(false);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const { token, user } = await registerUser(form);

			// Debug: Log what we received
			console.log("Received token:", token);
			console.log("Received user:", user);
			navigate("/dashboard");
			window.location.reload(); // Refresh the page to ensure state is updated

			// navigate("/login");
		} catch (err) {
			console.error("Signup error:", err);
			setError(err.message);
		}
	};
	const avatarOptions = generateAvatarOptions();

	return (
		<div className="max-w-md mx-auto p-6 border-white/10 backdrop-blur-md bg-white/5 shadow-lg rounded-md relative z-10">
			<h2 className="text-2xl font-bold mb-6 text-center text-white-800">
				Sign Up
			</h2>

			<input
				name="name"
				onChange={handleChange}
				placeholder="Full Name"
				required
				className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>

			{/* Avatar Selection Section */}
			<div className="mb-6">
				<label className="block text-sm font-medium mb-3 text-white-700">
					Choose Your Avatar
				</label>
				<div className="flex items-center gap-4">
					{form.avatar && form.name ? (
						<PixelArtAvatar name={form.name} size={64} colors={form.avatar} />
					) : (
						<div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
							<span className="text-gray-500 text-xs">No Avatar</span>
						</div>
					)}
					<button
						type="button"
						onClick={() => setShowAvatarSelector(!showAvatarSelector)}
						className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
						disabled={!form.name}
					>
						{form.avatar ? "Change Avatar" : "Select Avatar"}
					</button>
				</div>
				{!form.name && (
					<p className="text-sm text-gray-500 mt-2">
						Enter your name first to generate avatar options
					</p>
				)}
			</div>

			{/* Avatar Options Grid */}
			{showAvatarSelector && avatarOptions.length > 0 && (
				<div className="mb-6 p-4 border rounded-lg bg-gray-50">
					<h3 className="text-sm font-medium mb-3 text-gray-700">
						Choose a pixel art avatar:
					</h3>
					<div className="grid grid-cols-4 gap-3">
						{avatarOptions.map((option) => (
							<button
								key={option.id}
								type="button"
								onClick={() => handleAvatarSelect(option.colors)}
								className="p-2 border-2 border-gray-300 hover:border-blue-500 transition-colors rounded-lg bg-white"
							>
								<PixelArtAvatar
									name={option.name}
									size={48}
									colors={option.colors}
								/>
							</button>
						))}
					</div>
					<button
						type="button"
						onClick={() => setShowAvatarSelector(false)}
						className="mt-3 text-sm text-gray-500 hover:text-gray-700"
					>
						Cancel
					</button>
				</div>
			)}

			<input
				name="email"
				type="email"
				onChange={handleChange}
				placeholder="Email Address"
				required
				// className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

				className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<input
				name="password"
				type="password"
				onChange={handleChange}
				placeholder="Password"
				required
				className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<input
				name="studentId"
				onChange={handleChange}
				placeholder="Student ID"
				required
				className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<input
				name="major"
				onChange={handleChange}
				placeholder="Major"
				className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<input
				name="year"
				type="number"
				onChange={handleChange}
				placeholder="Year"
				className="w-full mb-6 p-3 border border-gray-300 rounded-lg bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<button
				type="submit"
				onClick={handleSubmit}
				className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
			>
				Create Account
			</button>
			{error && <p className="text-red-500 mt-3 text-center">{error}</p>}
		</div>
	);
}
