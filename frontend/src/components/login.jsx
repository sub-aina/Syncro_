// src/components/Login.jsx
import { useState } from "react";
import { loginUser } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
	const [form, setForm] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleChange = (e) =>
		setForm({ ...form, [e.target.name]: e.target.value });
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const { token, user } = await loginUser(form.email, form.password); // ✅ destructure both
			localStorage.setItem("token", token);
			localStorage.setItem("user", JSON.stringify(user)); // optional: store user too
			navigate("/dashboard");
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<h2 className="text-xl font-bold mb-4">Login</h2>
			<input
				name="email"
				type="email"
				placeholder="Email"
				onChange={handleChange}
				required
				className="w-full mb-2 p-2 border text-black"
			/>
			<input
				name="password"
				type="password"
				placeholder="Password"
				onChange={handleChange}
				required
				className="w-full mb-2 p-2 border text-black"
			/>
			<button type="submit" className="w-full bg-blue-600 text-white py-2 mt-2">
				Login
			</button>
			{error && <p className="text-red-500 mt-2">{error}</p>}
		</form>
	);
}
