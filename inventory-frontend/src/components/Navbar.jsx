// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
            <Link className="navbar-brand" to="/dashboard">Inventory</Link>
            <Link to="/archived-products" className="nav-link text-white">Archived Products</Link>
            <div className="ms-auto">
                <button onClick={handleLogout} className="btn btn-outline-light">Logout</button>
            </div>
        </nav>
    );
}
