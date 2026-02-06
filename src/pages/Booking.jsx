// Booking Page Component with Encryption and Digital Signature
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMovies, getShows, getBookings, saveBookings, saveShows } from '../data/sampleData';
import { hybridEncrypt, getKeys } from '../utils/cryptoUtils';
import { createSignedMessage } from '../utils/signatureUtils';
import { generateBookingQRCode } from '../utils/encodingUtils';

const Booking = () => {
    const { movieId } = useParams();
    const [searchParams] = useSearchParams();
    const showId = searchParams.get('show');
    const navigate = useNavigate();
    const { user } = useAuth();

    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [selectedShow, setSelectedShow] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [encryptionDetails, setEncryptionDetails] = useState(null);

    useEffect(() => {
        const movies = getMovies();
        const allShows = getShows();

        const foundMovie = movies.find(m => m.id === parseInt(movieId));
        setMovie(foundMovie);

        const movieShows = allShows.filter(s => s.movieId === parseInt(movieId));
        setShows(movieShows);

        if (showId) {
            const show = movieShows.find(s => s.id === parseInt(showId));
            if (show) {
                setSelectedShow(show);
                setStep(2);
            }
        }
    }, [movieId, showId]);

    const handleShowSelect = (show) => {
        setSelectedShow(show);
        setSelectedSeats([]);
        setStep(2);
    };

    const toggleSeat = (seatNumber) => {
        setSelectedSeats(prev =>
            prev.includes(seatNumber)
                ? prev.filter(s => s !== seatNumber)
                : [...prev, seatNumber]
        );
    };

    const [seatLayout, setSeatLayout] = useState([]);

    useEffect(() => {
        if (selectedShow) {
            const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            const seatsPerRow = Math.ceil(selectedShow.totalSeats / rows.length);

            const layout = rows.map(row => ({
                row,
                seats: Array.from({ length: seatsPerRow }, (_, i) => ({
                    id: `${row}${i + 1}`,
                    number: `${row}${i + 1}`,
                    available: Math.random() > 0.3 // Simulate some booked seats
                }))
            }));
            setSeatLayout(layout);
        }
    }, [selectedShow]);

    const handleConfirmBooking = async () => {
        if (selectedSeats.length === 0) return;

        setIsProcessing(true);

        try {
            const keys = getKeys();

            // Create booking data
            const bookingId = `BK${Date.now()}`;
            const bookingData = {
                id: bookingId,
                userId: user.id,
                username: user.username,
                movieId: movie.id,
                movieTitle: movie.title,
                showId: selectedShow.id,
                showDate: selectedShow.date,
                showTime: selectedShow.time,
                hall: selectedShow.hall,
                seats: selectedSeats,
                pricePerSeat: selectedShow.price,
                totalAmount: selectedSeats.length * selectedShow.price,
                status: 'confirmed',
                bookedAt: new Date().toISOString()
            };

            // Encrypt sensitive booking data using hybrid encryption
            const sensitiveData = {
                paymentReference: `PAY${Date.now()}`,
                cardLast4: '4242', // Simulated
                amount: bookingData.totalAmount
            };

            const encryptedPayment = hybridEncrypt(sensitiveData, keys.publicKey);

            // Create digital signature for booking confirmation
            // We only sign fields that are stored in the database and can be reconstructed for verification
            const dataToSign = {
                id: bookingData.id,
                userId: bookingData.userId,
                username: bookingData.username,
                movieId: bookingData.movieId,
                movieTitle: bookingData.movieTitle,
                showDate: bookingData.showDate,
                showTime: bookingData.showTime,
                hall: bookingData.hall,
                seats: bookingData.seats,
                totalAmount: bookingData.totalAmount,
                status: bookingData.status,
                bookedAt: bookingData.bookedAt
            };

            const signedMessage = createSignedMessage(dataToSign, keys.privateKey);

            // Generate QR code
            const qrCode = await generateBookingQRCode(bookingId, signedMessage.signature);

            // Save booking to database via API
            const response = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking_id: bookingId,
                    user_id: user.id,
                    username: user.username,
                    movie_id: movie.id,
                    movie_title: movie.title,
                    show_date: selectedShow.date,
                    show_time: selectedShow.time,
                    hall: selectedShow.hall,
                    seats: selectedSeats,
                    total_amount: bookingData.totalAmount,
                    encrypted_payment: encryptedPayment,
                    signature: signedMessage.signature,
                    qr_code: qrCode,
                    status: 'confirmed',
                    booked_at: bookingData.bookedAt
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save booking');
            }

            // Update show availability (still using localStorage for shows)
            const allShows = getShows();
            const updatedShows = allShows.map(s =>
                s.id === selectedShow.id
                    ? { ...s, availableSeats: s.availableSeats - selectedSeats.length }
                    : s
            );
            saveShows(updatedShows);

            // Store encryption details for display
            setEncryptionDetails({
                aesKeyEncrypted: encryptedPayment.encryptedKey.substring(0, 50) + '...',
                dataEncrypted: encryptedPayment.encryptedData.substring(0, 50) + '...',
                hash: signedMessage.hash,
                signatureTruncated: signedMessage.signature.substring(0, 50) + '...'
            });

            // Complete booking object for display
            const completeBooking = {
                ...bookingData,
                encryptedPayment,
                signedMessage,
                signature: signedMessage.signature,
                qrCode
            };

            setBookingResult(completeBooking);
            setStep(4);

        } catch (error) {
            console.error('Booking failed:', error);
            alert('Booking failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!movie) {
        return (
            <div className="booking-page">
                <div className="loading-container">
                    <p>Loading movie details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="booking-header">
                <h1>🎟️ Book Tickets</h1>
                <h2>{movie.title}</h2>
            </div>

            <div className="booking-steps">
                <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <span className="step-number">1</span>
                    <span className="step-text">Select Show</span>
                </div>
                <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <span className="step-number">2</span>
                    <span className="step-text">Select Seats</span>
                </div>
                <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                    <span className="step-number">3</span>
                    <span className="step-text">Payment</span>
                </div>
                <div className={`step ${step >= 4 ? 'active' : ''}`}>
                    <span className="step-number">4</span>
                    <span className="step-text">Confirmation</span>
                </div>
            </div>

            <div className="booking-content">
                {/* Step 1: Select Show */}
                {step === 1 && (
                    <div className="step-content">
                        <h3>Select a Show</h3>
                        <div className="shows-selection">
                            {shows.map(show => (
                                <div
                                    key={show.id}
                                    className={`show-option ${selectedShow?.id === show.id ? 'selected' : ''}`}
                                    onClick={() => handleShowSelect(show)}
                                >
                                    <div className="show-datetime">
                                        <span className="date">{formatDate(show.date)}</span>
                                        <span className="time">{show.time}</span>
                                    </div>
                                    <div className="show-info">
                                        <span className="hall">{show.hall}</span>
                                        <span className="price">₹{show.price}</span>
                                    </div>
                                    <div className="availability">
                                        {show.availableSeats} seats available
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Select Seats */}
                {step === 2 && selectedShow && (
                    <div className="step-content">
                        <h3>Select Seats</h3>
                        <div className="show-summary">
                            <span>{formatDate(selectedShow.date)}</span>
                            <span>{selectedShow.time}</span>
                            <span>{selectedShow.hall}</span>
                        </div>

                        <div className="seat-selection">
                            <div className="screen">SCREEN</div>

                            <div className="seat-layout">
                                {seatLayout.map(row => (
                                    <div key={row.row} className="seat-row">
                                        <span className="row-label">{row.row}</span>
                                        <div className="seats">
                                            {row.seats.map(seat => (
                                                <button
                                                    key={seat.id}
                                                    className={`seat ${!seat.available ? 'booked' : ''} ${selectedSeats.includes(seat.id) ? 'selected' : ''}`}
                                                    onClick={() => seat.available && toggleSeat(seat.id)}
                                                    disabled={!seat.available}
                                                >
                                                    {seat.number.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="seat-legend">
                                <div><span className="seat available"></span> Available</div>
                                <div><span className="seat selected"></span> Selected</div>
                                <div><span className="seat booked"></span> Booked</div>
                            </div>
                        </div>

                        <div className="selection-summary">
                            <p>Selected: {selectedSeats.join(', ') || 'None'}</p>
                            <p>Total: ₹{selectedSeats.length * selectedShow.price}</p>
                        </div>

                        <div className="step-actions">
                            <button className="btn-secondary" onClick={() => setStep(1)}>
                                Back
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => setStep(3)}
                                disabled={selectedSeats.length === 0}
                            >
                                Continue to Payment
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                    <div className="step-content">
                        <h3>Payment</h3>

                        <div className="booking-summary-card">
                            <h4>Booking Summary</h4>
                            <div className="summary-row">
                                <span>Movie:</span>
                                <span>{movie.title}</span>
                            </div>
                            <div className="summary-row">
                                <span>Date & Time:</span>
                                <span>{formatDate(selectedShow.date)} at {selectedShow.time}</span>
                            </div>
                            <div className="summary-row">
                                <span>Hall:</span>
                                <span>{selectedShow.hall}</span>
                            </div>
                            <div className="summary-row">
                                <span>Seats:</span>
                                <span>{selectedSeats.join(', ')}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total Amount:</span>
                                <span>₹{selectedSeats.length * selectedShow.price}</span>
                            </div>
                        </div>

                        <div className="payment-form">
                            <div className="form-group">
                                <label>Card Number (Demo)</label>
                                <input type="text" value="4242 4242 4242 4242" disabled />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expiry</label>
                                    <input type="text" value="12/28" disabled />
                                </div>
                                <div className="form-group">
                                    <label>CVV</label>
                                    <input type="text" value="123" disabled />
                                </div>
                            </div>
                        </div>

                        <div className="security-info-payment">
                            <h4>🔐 Security Features Applied</h4>
                            <ul>
                                <li>✓ Payment data encrypted with AES-256</li>
                                <li>✓ AES key secured with RSA-2048 public key</li>
                                <li>✓ Booking signed with RSA private key</li>
                                <li>✓ SHA-256 hash for data integrity</li>
                            </ul>
                        </div>

                        <div className="step-actions">
                            <button className="btn-secondary" onClick={() => setStep(2)}>
                                Back
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleConfirmBooking}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing Securely...' : 'Confirm & Pay'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && bookingResult && (
                    <div className="step-content confirmation">
                        <div className="confirmation-header">
                            <span className="success-icon">✅</span>
                            <h3>Booking Confirmed!</h3>
                            <p>Your tickets have been booked successfully</p>
                        </div>

                        <div className="booking-ticket">
                            <div className="ticket-header">
                                <h4>🎬 {movie.title}</h4>
                                <span className="booking-id">#{bookingResult.id}</span>
                            </div>

                            <div className="ticket-details">
                                <div className="detail">
                                    <span className="label">Date</span>
                                    <span className="value">{formatDate(selectedShow.date)}</span>
                                </div>
                                <div className="detail">
                                    <span className="label">Time</span>
                                    <span className="value">{selectedShow.time}</span>
                                </div>
                                <div className="detail">
                                    <span className="label">Hall</span>
                                    <span className="value">{selectedShow.hall}</span>
                                </div>
                                <div className="detail">
                                    <span className="label">Seats</span>
                                    <span className="value">{selectedSeats.join(', ')}</span>
                                </div>
                            </div>

                            {bookingResult.qrCode && (
                                <div className="ticket-qr">
                                    <img src={bookingResult.qrCode} alt="Booking QR Code" />
                                    <p>Scan at entrance</p>
                                </div>
                            )}
                        </div>

                        <div className="crypto-details">
                            <h4>🔐 Cryptographic Details</h4>
                            <div className="crypto-section">
                                <h5>Hybrid Encryption (RSA + AES)</h5>
                                <div className="crypto-item">
                                    <span className="label">Encrypted AES Key:</span>
                                    <code>{encryptionDetails?.aesKeyEncrypted}</code>
                                </div>
                                <div className="crypto-item">
                                    <span className="label">Encrypted Payment Data:</span>
                                    <code>{encryptionDetails?.dataEncrypted}</code>
                                </div>
                            </div>

                            <div className="crypto-section">
                                <h5>Digital Signature (SHA-256 + RSA)</h5>
                                <div className="crypto-item">
                                    <span className="label">SHA-256 Hash:</span>
                                    <code>{encryptionDetails?.hash}</code>
                                </div>
                                <div className="crypto-item">
                                    <span className="label">RSA Signature:</span>
                                    <code>{encryptionDetails?.signatureTruncated}</code>
                                </div>
                            </div>
                        </div>

                        <div className="step-actions">
                            <button className="btn-secondary" onClick={() => navigate('/my-bookings')}>
                                View My Bookings
                            </button>
                            <button className="btn-primary" onClick={() => navigate('/movies')}>
                                Book More
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Booking;
