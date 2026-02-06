// Movies Page Component
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { canWrite } from '../utils/accessControl';
import { getMovies, saveMovies } from '../data/sampleData';
import MovieCard from '../components/MovieCard';

const Movies = () => {
    const { user } = useAuth();
    const [movies, setMovies] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        director: '',
        year: new Date().getFullYear(),
        genre: '',
        duration: 120,
        rating: 'PG-13',
        description: '',
        poster: ''
    });

    const canEditMovies = user && canWrite(user.role, 'movies');

    useEffect(() => {
        setMovies(getMovies());
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingMovie) {
            const updatedMovies = movies.map(m =>
                m.id === editingMovie.id ? { ...formData, id: editingMovie.id } : m
            );
            setMovies(updatedMovies);
            saveMovies(updatedMovies);
            setEditingMovie(null);
        } else {
            const newMovie = {
                ...formData,
                id: Date.now(),
                year: parseInt(formData.year),
                duration: parseInt(formData.duration)
            };
            const updatedMovies = [...movies, newMovie];
            setMovies(updatedMovies);
            saveMovies(updatedMovies);
        }

        setFormData({
            title: '',
            director: '',
            year: new Date().getFullYear(),
            genre: '',
            duration: 120,
            rating: 'PG-13',
            description: '',
            poster: ''
        });
        setShowAddForm(false);
    };

    const handleEdit = (movie) => {
        setEditingMovie(movie);
        setFormData(movie);
        setShowAddForm(true);
    };

    const handleDelete = (movieId) => {
        if (confirm('Are you sure you want to delete this movie?')) {
            const updatedMovies = movies.filter(m => m.id !== movieId);
            setMovies(updatedMovies);
            saveMovies(updatedMovies);
        }
    };

    const handleCancel = () => {
        setShowAddForm(false);
        setEditingMovie(null);
        setFormData({
            title: '',
            director: '',
            year: new Date().getFullYear(),
            genre: '',
            duration: 120,
            rating: 'PG-13',
            description: '',
            poster: ''
        });
    };

    return (
        <div className="movies-page">
            <div className="page-header">
                <h1>🎬 Movies</h1>
                {canEditMovies && (
                    <button
                        className="btn-primary"
                        onClick={() => setShowAddForm(true)}
                    >
                        + Add Movie
                    </button>
                )}
            </div>

            {!canEditMovies && (
                <div className="access-notice">
                    <span>👁️ Read-only access - Browse movies and book tickets</span>
                </div>
            )}

            {showAddForm && canEditMovies && (
                <div className="modal-overlay">
                    <div className="modal movie-form-modal">
                        <h2>{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Director</label>
                                    <input
                                        type="text"
                                        name="director"
                                        value={formData.director}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Year</label>
                                    <input
                                        type="number"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Duration (min)</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Genre</label>
                                    <input
                                        type="text"
                                        name="genre"
                                        value={formData.genre}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Rating</label>
                                    <select name="rating" value={formData.rating} onChange={handleInputChange}>
                                        <option value="G">G</option>
                                        <option value="PG">PG</option>
                                        <option value="PG-13">PG-13</option>
                                        <option value="R">R</option>
                                        <option value="NC-17">NC-17</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Poster URL</label>
                                <input
                                    type="url"
                                    name="poster"
                                    value={formData.poster}
                                    onChange={handleInputChange}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingMovie ? 'Update Movie' : 'Add Movie'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="movies-grid">
                {movies.map(movie => (
                    <MovieCard
                        key={movie.id}
                        movie={movie}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {movies.length === 0 && (
                <div className="empty-state">
                    <h3>No movies available</h3>
                    <p>Check back later or add some movies!</p>
                </div>
            )}
        </div>
    );
};

export default Movies;
