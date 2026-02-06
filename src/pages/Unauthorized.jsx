// Unauthorized Page Component
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
    const { user } = useAuth();

    return (
        <div className="unauthorized-page">
            <div className="unauthorized-content">
                <span className="error-icon">🚫</span>
                <h1>Access Denied</h1>
                <p>You don't have permission to access this resource.</p>

                {user && (
                    <div className="user-info">
                        <p>Logged in as: <strong>{user.username}</strong></p>
                        <p>Role: <strong>{user.role}</strong></p>
                    </div>
                )}

                <div className="security-explanation">
                    <h3>🔐 Access Control</h3>
                    <p>This application implements Role-Based Access Control (RBAC)
                        following the principle of least privilege.</p>
                    <p>Each role has specific permissions defined in the access control matrix.</p>
                </div>

                <div className="actions">
                    <Link to="/dashboard" className="btn-primary">
                        Go to Dashboard
                    </Link>
                    <Link to="/" className="btn-secondary">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
