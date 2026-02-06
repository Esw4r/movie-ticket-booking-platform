// My Bookings Page Component (Customer view)
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BookingCard from '../components/BookingCard';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;

            try {
                const response = await fetch(`http://localhost:5000/api/bookings/user/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    // Transform API data to match expected format
                    const formattedBookings = data.map(b => ({
                        id: b.booking_id,
                        userId: b.user_id,
                        username: b.username,
                        movieId: b.movie_id,
                        movieTitle: b.movie_title,
                        showDate: b.show_date,
                        showTime: b.show_time,
                        hall: b.hall,
                        seats: b.seats,
                        totalAmount: b.total_amount,
                        status: b.status,
                        signature: b.signature,
                        qrCode: b.qr_code,
                        bookedAt: b.created_at,
                        encryptedPayment: b.encrypted_payment
                    }));
                    setBookings(formattedBookings);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    if (loading) {
        return (
            <div className="bookings-page">
                <div className="loading-container">
                    <p>Loading your bookings...</p>
                </div>
            </div>
        );
    }

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
