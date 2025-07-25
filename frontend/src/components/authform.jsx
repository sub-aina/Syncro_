import { useState, useRef, useEffect } from "react";
import Login from "./login";
import SignUp from "./signup";
import Cubes from "./Cubes";
import { useLocation } from "react-router-dom";

export default function AuthForm() {
	const [isLogin, setIsLogin] = useState(true);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const location = useLocation();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		if (params.get("mode") === "login") {
			setIsLogin(true);
		}
	}, [location.search]);

	const toggleAuthMode = () => {
		setIsTransitioning(true);
		setTimeout(() => {
			setIsLogin(!isLogin);
			setIsTransitioning(false);
		}, 300);
	};
	return (
		<div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-black via-[#1a0a2e] to-[#16213e] text-white">
			{/* Cubes Section */}
			<div className="w-full md:w-1/2 flex items-center justify-center overflow-hidden">
				<div className="w-full h-full flex items-center justify-center scale-[1.7]">
					<Cubes
						gridSize={8}
						maxAngle={50}
						radius={3}
						borderStyle="1px solid #666"
						faceColor="transparent"
						rippleColor="#9333ea"
						rippleSpeed={1.5}
						autoAnimate
						rippleOnClick
					/>
				</div>
			</div>

			{/* Auth Form Section */}
			<div className="w-full md:w-1/2 flex items-center justify-center p-6">
				<div className="w-full max-w-xl p-8 border border-white/10 backdrop-blur-md bg-white/5 shadow-lg rounded-md relative z-10">
					{/* Header */}
					<div className="text-center mb-6">
						<h1 className="text-3xl font-bold tracking-wider text-white drop-shadow-sm mb-2">
							Syncro
						</h1>
						<p className="text-xs text-gray-400 mt-1 tracking-wider">
							{isLogin ? "Welcome back" : "Create your account"}
						</p>
					</div>

					{/* Auth Form */}
					<div
						className={`transition-opacity duration-300 ${
							isTransitioning ? "opacity-0" : "opacity-100"
						}`}
					>
						{isLogin ? <Login /> : <SignUp />}
					</div>

					{/* Switch Mode */}
					<div className="mt-8 text-center">
						<div className="relative mb-5">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-700/50"></div>
							</div>
							<div className="relative flex justify-center">
								<span className="px-4 text-xs text-gray-400 uppercase tracking-wider bg-[#060010]/80">
									{isLogin ? "New to Syncro?" : "Already with us?"}
								</span>
							</div>
						</div>

						<button
							className="text-gray-300 hover:text-white text-sm font-light tracking-wide transition duration-300 group"
							onClick={toggleAuthMode}
							disabled={isTransitioning}
						>
							<span className="pb-1 border-b border-gray-600 group-hover:border-white">
								{isLogin ? "CREATE ACCOUNT" : "SIGN IN"}
							</span>
							<span className="ml-2 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								→
							</span>
						</button>
					</div>

					{/* Footer */}
					<div className="text-center mt-10 text-gray-500 text-xs tracking-wider">
						<p className="opacity-70">© ALL RIGHTS RESERVED.</p>
						<div className="flex justify-center space-x-4 mt-2">
							<a href="#" className="hover:text-gray-300">
								Terms
							</a>
							<a href="#" className="hover:text-gray-300">
								Privacy
							</a>
							<a href="#" className="hover:text-gray-300">
								Contact
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
