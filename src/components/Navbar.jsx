// Navigation Bar Component
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canWrite } from '../utils/accessControl';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">🎬 CineSecure</Link>
            </div>

            <div className="navbar-menu">
                {isAuthenticated ? (
                    <>
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        <Link to="/movies" className="nav-link">Movies</Link>
                        <Link to="/shows" className="nav-link">Shows</Link>

                        {user.role === 'Customer' && (
                            <Link to="/my-bookings" className="nav-link">My Bookings</Link>
                        )}

                        {(user.role === 'Admin' || user.role === 'Staff') && (
                            <Link to="/all-bookings" className="nav-link">View Bookings</Link>
                        )}

                        <div className="navbar-user">
                            <span className="user-badge">
                                {user.role}: {user.username}
                            </span>
                            <button onClick={handleLogout} className="btn-logout">
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link btn-primary">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
