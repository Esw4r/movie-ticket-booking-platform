// All Bookings Page Component (Admin/Staff view)
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookings, getMovies } from '../data/sampleData';
import { verifySignedMessage } from '../utils/signatureUtils';
import { getKeys } from '../utils/cryptoUtils';

const AllBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [movies, setMovies] = useState([]);
    const [filter, setFilter] = useState('all');
    const [verificationResults, setVerificationResults] = useState({});

    useEffect(() => {
        setBookings(getBookings().reverse());
        setMovies(getMovies());
    }, []);

    const getMovieTitle = (movieId) => {
        const movie = movies.find(m => m.id === movieId);
        return movie ? movie.title : 'Unknown';
    };

    const handleVerifyBooking = (booking) => {
        if (booking.signedMessage) {
            const keys = getKeys();
            const result = verifySignedMessage(booking.signedMessage, keys.publicKey);
            setVerificationResults(prev => ({
                ...prev,
                [booking.id]: result
            }));
        }
    };

    const handleVerifyAll = () => {
        const keys = getKeys();
        const results = {};
        bookings.forEach(booking => {
            if (booking.signedMessage) {
                results[booking.id] = verifySignedMessage(booking.signedMessage, keys.publicKey);
            }
        });
        setVerificationResults(results);
    };

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="all-bookings-page">
            <div className="page-header">
                <h1>🎫 All Bookings</h1>
                <p>View and verify customer bookings ({user?.role} Access)</p>
            </div>

            <div className="bookings-controls">
                <div className="filter-controls">
                    <label>Filter by Status:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Bookings</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <button className="btn-secondary" onClick={handleVerifyAll}>
                    🔍 Verify All Signatures
                </button>
            </div>

            <div className="bookings-stats">
                <div className="stat-card">
                    <span className="stat-value">{bookings.length}</span>
                    <span className="stat-label">Total Bookings</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">
                        ₹{bookings.reduce((sum, b) => sum + b.totalAmount, 0)}
                    </span>
                    <span className="stat-label">Total Revenue</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">
                        {Object.values(verificationResults).filter(r => r?.valid).length}
                    </span>
                    <span className="stat-label">Verified</span>
                </div>
            </div>

            {filteredBookings.length > 0 ? (
                <div className="bookings-table-container">
                    <table className="bookings-table">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Customer</th>
                                <th>Movie</th>
                                <th>Show</th>
                                <th>Seats</th>
                                <th>Amount</th>
                                <th>Booked At</th>
                                <th>Status</th>
                                <th>Signature</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map(booking => (
                                <tr key={booking.id}>
                                    <td className="booking-id">
                                        <code>{booking.id.slice(-8)}</code>
                                    </td>
                                    <td>{booking.username}</td>
                                    <td>{getMovieTitle(booking.movieId)}</td>
                                    <td>
                                        {formatDate(booking.showDate)}<br />
                                        <small>{booking.showTime} • {booking.hall}</small>
                                    </td>
                                    <td>{booking.seats?.join(', ')}</td>
                                    <td className="amount">₹{booking.totalAmount}</td>
                                    <td>{formatDateTime(booking.bookedAt)}</td>
                                    <td>
                                        <span className={`status-badge ${booking.status}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="verification-cell">
                                        {verificationResults[booking.id] ? (
                                            <span className={`verification-badge ${verificationResults[booking.id].valid ? 'valid' : 'invalid'}`}>
                                                {verificationResults[booking.id].valid ? '✅ Valid' : '❌ Invalid'}
                                            </span>
                                        ) : (
                                            <button
                                                className="btn-small btn-verify"
                                                onClick={() => handleVerifyBooking(booking)}
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <h3>No bookings found</h3>
                    <p>Bookings will appear here when customers make reservations.</p>
                </div>
            )}

            <div className="verification-info">
                <h3>🔐 Digital Signature Verification</h3>
                <p>Each booking is signed using RSA with SHA-256 hash. Verification ensures:</p>
                <ul>
                    <li><strong>Integrity:</strong> Data has not been tampered with</li>
                    <li><strong>Authenticity:</strong> Booking was created by the system</li>
                    <li><strong>Non-repudiation:</strong> Origin cannot be denied</li>
                </ul>
            </div>
        </div>
    );
};

export default AllBookings;
