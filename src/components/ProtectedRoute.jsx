// Protected Route Component for Role-Based Access Control
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canRead, canWrite } from '../utils/accessControl';

const ProtectedRoute = ({
    children,
    resource = null,
    requireWrite = false,
    allowedRoles = null
}) => {
    const { user, isLoading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Check authentication
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access if roles specified
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Check resource-based access if resource specified
    if (resource) {
        const hasAccess = requireWrite
            ? canWrite(user.role, resource)
            : canRead(user.role, resource);

        if (!hasAccess) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
