// components/LoginForm.jsx
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
        <form onSubmit={handleLogin} className="container mt-5 col-md-4">
            <h3>Login</h3>
            <input className="form-control mb-2" type="text" placeholder="Username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            />
            <input className="form-control mb-2" type="password" placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
            <button className="btn btn-primary">Login</button>
        </form>
    );
}
