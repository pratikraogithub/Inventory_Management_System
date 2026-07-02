import { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import "./LoginForm.css";

export default function LoginForm() {
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Sending credentials:", credentials); // ADD THIS
        try {
            const res = await api.post('token/', credentials);
            console.log("Response:", res.data);
            localStorage.setItem('access', res.data.access);
            localStorage.setItem('refresh', res.data.refresh);
            navigate("/dashboard");
        } catch (err) {
            console.log("Error response:", err.response?.data);
            setError("Invalid username or password. Please try again.");
        }
    };

    return (
        <div className="login-page">
            {/* Left side with branding + image */}
            <div className="login-left">
                <div className="overlay-text">
                    <h1>📦 Inventory Manager</h1>
                    <p>Track, Manage & Simplify Your Stock</p>
                </div>
            </div>

            {/* Right side with form */}
            <div className="login-right">
                <div className="login-header-text">
                    <h2>Welcome Back!</h2>
                    <p>Please sign in to your account to continue</p>
                </div>

                <div className="login-form-container">

                    <h2 className="fw-bold mb-4 text-center">Login</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleLogin}>
                        <div className="mb-3 input-group">
                            <span className="input-group-text bg-primary text-white">
                                <FaUser />
                            </span>
                            <input
                                type="text"
                                className="form-control form-control-lg"
                                placeholder="Username"
                                value={credentials.username}
                                onChange={(e) =>
                                    setCredentials({ ...credentials, username: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="mb-3 input-group">
                            <span className="input-group-text bg-primary text-white">
                                <FaLock />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control form-control-lg"
                                placeholder="Password"
                                value={credentials.password}
                                onChange={(e) =>
                                    setCredentials({ ...credentials, password: e.target.value })
                                }
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <button className="btn btn-primary btn-lg w-100 mt-2" type="submit">
                            Login
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <a href="#">Forgot Password?</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
