import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitCheckIn } from "../redux/checkinslice";
import { useNavigate } from "react-router-dom";

const DailyCheckin = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { loading, error } = useSelector((state) => state.checkin);
	const [form, setform] = useState({
		mood: "",
		energy: "",
		nextSteps: "",
		blockers: "",
	});

	const handleChange = (e) => {
		setform({ ...form, [e.target.name]: e.target.value });
	};

	const handleMoodChange = (rating) => {
		setform({ ...form, mood: rating.toString() });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		dispatch(submitCheckIn(form))
			.then(() => {
				setform({
					mood: "",
					energy: "",
					nextSteps: "",
					blockers: "",
				});
				alert("Check-in submitted successfully!");
			})
			.catch((err) => {
				console.error("Error submitting check-in:", err);
			});
	};

	const StarRating = ({ rating, onRatingChange }) => {
		const [hover, setHover] = useState(0);

		return (
			<div className="flex space-x-1">
				{[...Array(5)].map((_, index) => {
					const ratingValue = index + 1;
					return (
						<button
							key={index}
							type="button"
							onClick={() => onRatingChange(ratingValue)}
							onMouseEnter={() => setHover(ratingValue)}
							onMouseLeave={() => setHover(0)}
							className="focus:outline-none transition-all duration-200"
						>
							<svg
								className={`w-8 h-8 transition-all duration-200 ${
									ratingValue <= (hover || rating)
										? "text-yellow-400 fill-current"
										: "text-gray-500 hover:text-yellow-300"
								}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1}
									d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
								/>
							</svg>
						</button>
					);
				})}
			</div>
		);
	};

	const EnergySlider = ({ value, onChange }) => {
		return (
			<div className="space-y-3">
				<div className="flex justify-between text-xs text-gray-400 tracking-wider">
					<span>LOW</span>
					<span>HIGH</span>
				</div>
				<div className="relative">
					<input
						type="range"
						min="1"
						max="10"
						value={value || 5}
						onChange={(e) => onChange(e.target.value)}
						className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
						style={{
							background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
								((value || 5) - 1) * 11.11
							}%, rgba(255,255,255,0.1) ${
								((value || 5) - 1) * 11.11
							}%, rgba(255,255,255,0.1) 100%)`,
						}}
					/>
					<div className="flex justify-between text-xs text-gray-500 mt-1">
						{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
							<span key={num}>{num}</span>
						))}
					</div>
				</div>
				<div className="text-center">
					<span className="text-purple-400 text-lg font-light tracking-wide">
						{value || 5}
					</span>
				</div>
			</div>
		);
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
								<button
									onClick={() => navigate("/dashboard")}
									className="text-gray-400 hover:text-white text-sm font-light tracking-wide transition-colors"
								>
									Dashboard
								</button>
								<span className="text-gray-300 text-sm font-light tracking-wide">
									Daily Check-in
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
						Daily Check-in
					</h1>
					<p className="text-gray-400 text-sm tracking-wide">
						Track your daily progress and wellbeing
					</p>
				</div>

				{/* Form Container */}
				<div className="border border-white/10 backdrop-blur-sm bg-white/5 rounded-sm p-8">
					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Mood Rating */}
						<div>
							<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
								How are you feeling today?
							</label>
							<div className="flex flex-col items-center space-y-3">
								<StarRating
									rating={parseInt(form.mood) || 0}
									onRatingChange={handleMoodChange}
								/>
								<div className="flex space-x-2 text-xs text-gray-500 tracking-wide">
									<span>Poor</span>
									<span>•</span>
									<span>Fair</span>
									<span>•</span>
									<span>Good</span>
									<span>•</span>
									<span>Very Good</span>
									<span>•</span>
									<span>Excellent</span>
								</div>
							</div>
						</div>

						{/* Energy Level */}
						<div>
							<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
								Energy Level
							</label>
							<EnergySlider
								value={form.energy}
								onChange={(value) => setform({ ...form, energy: value })}
							/>
						</div>

						{/* Next Steps */}
						<div>
							<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
								What will you work on today?
							</label>
							<textarea
								name="nextSteps"
								placeholder="Describe your goals and tasks for today..."
								value={form.nextSteps}
								onChange={handleChange}
								required
								rows={4}
								className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 font-light tracking-wide resize-none"
							/>
						</div>

						{/* Blockers */}
						<div>
							<label className="block text-gray-400 text-xs tracking-wider uppercase mb-3">
								Any blockers or challenges?
							</label>
							<textarea
								name="blockers"
								placeholder="What's preventing you from making progress?"
								value={form.blockers}
								onChange={handleChange}
								required
								rows={4}
								className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 font-light tracking-wide resize-none"
							/>
						</div>

						{/* Error Display */}
						{error && (
							<div className="border border-red-500/30 bg-red-500/10 rounded-sm p-4">
								<p className="text-red-400 text-sm tracking-wide">{error}</p>
							</div>
						)}

						{/* Submit Button */}
						<div className="pt-6">
							<button
								type="submit"
								disabled={loading}
								className="w-full border border-purple-400/30 bg-purple-500/10 hover:bg-purple-500/20 text-white px-6 py-3 rounded-sm font-light tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
							>
								{loading ? (
									<>
										<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
										<span>SUBMITTING...</span>
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
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span>SUBMIT CHECK-IN</span>
									</>
								)}
							</button>
						</div>
					</form>
				</div>

				{/* Help Text */}
				<div className="text-center mt-8">
					<p className="text-gray-500 text-xs tracking-wide">
						Daily check-ins help you stay aware of your progress and challenges
					</p>
				</div>
			</div>

			<style jsx>{`
				.slider::-webkit-slider-thumb {
					appearance: none;
					height: 20px;
					width: 20px;
					border-radius: 50%;
					background: #8b5cf6;
					cursor: pointer;
					border: 2px solid #ffffff;
					box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.3);
				}

				.slider::-moz-range-thumb {
					height: 20px;
					width: 20px;
					border-radius: 50%;
					background: #8b5cf6;
					cursor: pointer;
					border: 2px solid #ffffff;
					box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.3);
				}
			`}</style>
		</div>
	);
};

export default DailyCheckin;
