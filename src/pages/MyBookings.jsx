// My Bookings Page Component (Customer view)
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookings } from '../data/sampleData';
import BookingCard from '../components/BookingCard';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const allBookings = getBookings();
        const userBookings = allBookings.filter(b => b.userId === user?.id);
        setBookings(userBookings.reverse()); // Most recent first
    }, [user]);

    return (
        <div className="bookings-page">
            <div className="page-header">
                <h1>🎫 My Bookings</h1>
                <p>View and verify your booking history</p>
            </div>

            {bookings.length > 0 ? (
                <div className="bookings-list">
                    {bookings.map(booking => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            showVerification={true}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <h3>No bookings yet</h3>
                    <p>Start by browsing movies and booking your first ticket!</p>
                </div>
            )}

            <div className="security-info-section">
                <h3>🔐 Booking Security</h3>
                <div className="security-cards">
                    <div className="security-card">
                        <h4>🔒 Encryption</h4>
                        <p>Payment details are encrypted using AES-256 with RSA key exchange</p>
                    </div>
                    <div className="security-card">
                        <h4>✍️ Digital Signature</h4>
                        <p>Each booking is signed to ensure integrity and authenticity</p>
                    </div>
                    <div className="security-card">
                        <h4>📱 QR Verification</h4>
                        <p>QR code contains booking ID and signature for verification</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
