// Access Control Matrix and Authorization Utilities

// Access Control Matrix
// R = Read, W = Write, RW = Read + Write
export const accessMatrix = {
    Admin: {
        movies: 'RW',
        shows: 'RW',
        bookings: 'R'
    },
    Staff: {
        movies: 'R',
        shows: 'RW',
        bookings: 'R'
    },
    Customer: {
        movies: 'R',
        shows: 'R',
        bookings: 'RW'
    }
};

// Check if user has read access to a resource
export const canRead = (role, resource) => {
    if (!accessMatrix[role] || !accessMatrix[role][resource]) {
        return false;
    }
    const access = accessMatrix[role][resource];
    return access === 'R' || access === 'RW';
};

// Check if user has write access to a resource
export const canWrite = (role, resource) => {
    if (!accessMatrix[role] || !accessMatrix[role][resource]) {
        return false;
    }
    const access = accessMatrix[role][resource];
    return access === 'W' || access === 'RW';
};

// Get all permissions for a role
export const getRolePermissions = (role) => {
    if (!accessMatrix[role]) {
        return null;
    }
    return {
        role,
        permissions: accessMatrix[role]
    };
};

// Policy descriptions for UI display
export const policyDescriptions = {
    Admin: {
        title: 'Administrator',
        description: 'Full control over the system. Can manage movies, shows, and view all bookings.',
        justification: 'Requires complete system access for management purposes.'
    },
    Staff: {
        title: 'Theatre Staff',
        description: 'Can view movies, manage show schedules, and view bookings.',
        justification: 'Needs show management access without movie catalog control.'
    },
    Customer: {
        title: 'Customer',
        description: 'Can browse movies and shows, and manage their own bookings.',
        justification: 'Limited to booking operations following principle of least privilege.'
    }
};

// Get available roles
export const getRoles = () => ['Admin', 'Staff', 'Customer'];

// Validate role
export const isValidRole = (role) => getRoles().includes(role);
