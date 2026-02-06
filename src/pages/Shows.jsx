// Shows Page Component
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canWrite } from '../utils/accessControl';
import { getMovies, getShows, saveShows } from '../data/sampleData';

const Shows = () => {
    const { user } = useAuth();
    const [shows, setShows] = useState([]);
    const [movies, setMovies] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingShow, setEditingShow] = useState(null);
    const [formData, setFormData] = useState({
        movieId: '',
        date: '',
        time: '',
        hall: 'Screen 1',
        price: 250,
        totalSeats: 100
    });

    const canEditShows = user && canWrite(user.role, 'shows');

    useEffect(() => {
        setShows(getShows());
        setMovies(getMovies());
    }, []);

    const getMovieTitle = (movieId) => {
        const movie = movies.find(m => m.id === movieId);
        return movie ? movie.title : 'Unknown Movie';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingShow) {
            const updatedShows = shows.map(s =>
                s.id === editingShow.id ? {
                    ...formData,
                    id: editingShow.id,
                    movieId: parseInt(formData.movieId),
                    price: parseInt(formData.price),
                    totalSeats: parseInt(formData.totalSeats),
                    availableSeats: parseInt(formData.totalSeats)
                } : s
            );
            setShows(updatedShows);
            saveShows(updatedShows);
            setEditingShow(null);
        } else {
            const newShow = {
                ...formData,
                id: Date.now(),
                movieId: parseInt(formData.movieId),
                price: parseInt(formData.price),
                totalSeats: parseInt(formData.totalSeats),
                availableSeats: parseInt(formData.totalSeats)
            };
            const updatedShows = [...shows, newShow];
            setShows(updatedShows);
            saveShows(updatedShows);
        }

        resetForm();
    };

    const resetForm = () => {
        setFormData({
            movieId: '',
            date: '',
            time: '',
            hall: 'Screen 1',
            price: 250,
            totalSeats: 100
        });
        setShowAddForm(false);
        setEditingShow(null);
    };

    const handleEdit = (show) => {
        setEditingShow(show);
        setFormData({
            movieId: show.movieId.toString(),
            date: show.date,
            time: show.time,
            hall: show.hall,
            price: show.price,
            totalSeats: show.totalSeats
        });
        setShowAddForm(true);
    };

    const handleDelete = (showId) => {
        if (confirm('Are you sure you want to delete this show?')) {
            const updatedShows = shows.filter(s => s.id !== showId);
            setShows(updatedShows);
            saveShows(updatedShows);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    // Group shows by movie
    const showsByMovie = movies.map(movie => ({
        movie,
        shows: shows.filter(s => s.movieId === movie.id)
    })).filter(group => group.shows.length > 0);

    return (
        <div className="shows-page">
            <div className="page-header">
                <h1>📅 Shows</h1>
                {canEditShows && (
                    <button
                        className="btn-primary"
                        onClick={() => setShowAddForm(true)}
                    >
                        + Add Show
                    </button>
                )}
            </div>

            {!canEditShows && (
                <div className="access-notice">
                    <span>👁️ Read-only access - View shows and book tickets</span>
                </div>
            )}

            {showAddForm && canEditShows && (
                <div className="modal-overlay">
                    <div className="modal show-form-modal">
                        <h2>{editingShow ? 'Edit Show' : 'Add New Show'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Movie</label>
                                <select
                                    name="movieId"
                                    value={formData.movieId}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a movie</option>
                                    {movies.map(movie => (
                                        <option key={movie.id} value={movie.id}>
                                            {movie.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Hall</label>
                                    <select name="hall" value={formData.hall} onChange={handleInputChange}>
                                        <option value="Screen 1">Screen 1</option>
                                        <option value="Screen 2">Screen 2</option>
                                        <option value="Screen 3">Screen 3</option>
                                        <option value="IMAX">IMAX</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Total Seats</label>
                                <input
                                    type="number"
                                    name="totalSeats"
                                    value={formData.totalSeats}
                                    onChange={handleInputChange}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingShow ? 'Update Show' : 'Add Show'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="shows-list">
                {showsByMovie.map(({ movie, shows: movieShows }) => (
                    <div key={movie.id} className="movie-shows-section">
                        <div className="movie-shows-header">
                            <h2>{movie.title}</h2>
                            <span className="movie-meta">{movie.duration} min | {movie.genre}</span>
                        </div>

                        <div className="shows-grid">
                            {movieShows.map(show => (
                                <div key={show.id} className="show-card">
                                    <div className="show-info">
                                        <div className="show-datetime">
                                            <span className="show-date">{formatDate(show.date)}</span>
                                            <span className="show-time">{show.time}</span>
                                        </div>
                                        <div className="show-details">
                                            <span className="show-hall">📍 {show.hall}</span>
                                            <span className="show-price">₹{show.price}</span>
                                        </div>
                                        <div className="show-seats">
                                            <span className={`seats-available ${show.availableSeats < 20 ? 'low' : ''}`}>
                                                {show.availableSeats}/{show.totalSeats} seats
                                            </span>
                                        </div>
                                    </div>

                                    <div className="show-actions">
                                        {user?.role === 'Customer' && (
                                            <Link to={`/book/${movie.id}?show=${show.id}`} className="btn-primary btn-small">
                                                Book Now
                                            </Link>
                                        )}
                                        {canEditShows && (
                                            <>
                                                <button
                                                    className="btn-secondary btn-small"
                                                    onClick={() => handleEdit(show)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-danger btn-small"
                                                    onClick={() => handleDelete(show.id)}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {showsByMovie.length === 0 && (
                <div className="empty-state">
                    <h3>No shows scheduled</h3>
                    <p>Check back later for upcoming shows!</p>
                </div>
            )}
        </div>
    );
};

export default Shows;
