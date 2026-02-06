// Dashboard Page Component
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getRolePermissions, policyDescriptions, accessMatrix } from '../utils/accessControl';

const Dashboard = () => {
    const { user } = useAuth();
    const permissions = getRolePermissions(user?.role);
    const policy = policyDescriptions[user?.role];

    const getDashboardContent = () => {
        switch (user?.role) {
            case 'Admin':
                return (
                    <div className="dashboard-sections">
                        <div className="dashboard-section">
                            <h3>🎬 Movie Management</h3>
                            <p>Add, edit, or remove movies from the catalog</p>
                            <Link to="/movies" className="btn-primary">Manage Movies</Link>
                        </div>
                        <div className="dashboard-section">
                            <h3>📅 Show Management</h3>
                            <p>Schedule and manage movie shows</p>
                            <Link to="/shows" className="btn-primary">Manage Shows</Link>
                        </div>
                        <div className="dashboard-section">
                            <h3>🎫 View Bookings</h3>
                            <p>View all customer bookings</p>
                            <Link to="/all-bookings" className="btn-secondary">View Bookings</Link>
                        </div>
                    </div>
                );
            case 'Staff':
                return (
                    <div className="dashboard-sections">
                        <div className="dashboard-section">
                            <h3>🎬 View Movies</h3>
                            <p>Browse the movie catalog</p>
                            <Link to="/movies" className="btn-primary">View Movies</Link>
                        </div>
                        <div className="dashboard-section">
                            <h3>📅 Show Management</h3>
                            <p>Schedule and manage movie shows</p>
                            <Link to="/shows" className="btn-primary">Manage Shows</Link>
                        </div>
                        <div className="dashboard-section">
                            <h3>🎫 View Bookings</h3>
                            <p>View customer bookings</p>
                            <Link to="/all-bookings" className="btn-secondary">View Bookings</Link>
                        </div>
                    </div>
                );
            case 'Customer':
                return (
                    <div className="dashboard-sections">
                        <div className="dashboard-section">
                            <h3>🎬 Browse Movies</h3>
                            <p>Explore movies and book tickets</p>
                            <Link to="/movies" className="btn-primary">Browse Movies</Link>
                        </div>
                        <div className="dashboard-section">
                            <h3>📅 View Shows</h3>
                            <p>Check show timings and availability</p>
                            <Link to="/shows" className="btn-secondary">View Shows</Link>
                        </div>
                        <div className="dashboard-section">
                            <h3>🎫 My Bookings</h3>
                            <p>View your booking history</p>
                            <Link to="/my-bookings" className="btn-primary">My Bookings</Link>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Welcome, {user?.username}! 👋</h1>
                <p className="user-role-badge">{policy?.title}</p>
            </div>

            {getDashboardContent()}

            <div className="access-control-panel">
                <h2>🔐 Your Access Control</h2>
                <p className="policy-justification">{policy?.justification}</p>

                <div className="access-matrix-display">
                    <h3>Access Matrix</h3>
                    <table className="access-table">
                        <thead>
                            <tr>
                                <th>Resource</th>
                                <th>Your Access</th>
                                <th>Permission Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(permissions?.permissions || {}).map(([resource, access]) => (
                                <tr key={resource}>
                                    <td className="resource-name">{resource.charAt(0).toUpperCase() + resource.slice(1)}</td>
                                    <td className="access-level">
                                        <span className={`access-badge ${access.includes('W') ? 'write' : 'read'}`}>
                                            {access}
                                        </span>
                                    </td>
                                    <td className="permission-desc">
                                        {access === 'RW' ? 'Read & Write' : access === 'R' ? 'Read Only' : 'Write Only'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="security-principle">
                    <h4>🛡️ Principle of Least Privilege</h4>
                    <p>Your access is limited to only the resources necessary for your role,
                        reducing security risks and protecting sensitive data.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
