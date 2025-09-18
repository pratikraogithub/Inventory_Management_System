import { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('token/', credentials);
            localStorage.setItem('token', res.data.access);
            navigate('/dashboard');
        } catch (err) {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="container vh-100 d-flex justify-content-center align-items-center">
            <div className="card shadow p-4 w-100" style={{ maxWidth: '500px' }}>
                <h3 className="mb-4 text-center">Login</h3>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label visually-hidden">Username</label>
                        <input
                            id="username"
                            className="form-control form-control-lg"
                            type="text"
                            placeholder="Enter username"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label visually-hidden">Password</label>
                        <input
                            id="password"
                            className="form-control form-control-lg"
                            type="password"
                            placeholder="Enter password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            required
                        />
                    </div>

                    <button className="btn btn-primary btn-lg w-100" type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}
