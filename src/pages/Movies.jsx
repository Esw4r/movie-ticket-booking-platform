// Movies Page Component
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { canWrite } from '../utils/accessControl';
import MovieCard from '../components/MovieCard';

const Movies = () => {
    const { user } = useAuth();
    const [movies, setMovies] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMovie, setCurrentMovie] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        director: '',
        year: '',
        genre: '',
        description: '',
        poster: '',
        rating: '',
        duration: ''
    });

    const canEdit = canWrite(user?.role, 'movies');

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/movies');
            if (response.ok) {
                const data = await response.json();
                setMovies(data);
            }
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (movie) => {
        setIsEditing(true);
        setCurrentMovie(movie);
        setFormData(movie);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this movie?')) {
            try {
                await fetch(`http://localhost:5000/api/movies/${id}`, {
                    method: 'DELETE'
                });
                fetchMovies();
            } catch (error) {
                console.error('Error deleting movie:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (currentMovie) {
                // Update existing movie
                await fetch(`http://localhost:5000/api/movies/${currentMovie.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                // Add new movie
                await fetch('http://localhost:5000/api/movies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            // Reset form and refresh list
            setIsEditing(false);
            setCurrentMovie(null);
            setFormData({
                title: '',
                director: '',
                year: '',
                genre: '',
                description: '',
                poster: '',
                rating: '',
                duration: ''
            });
            fetchMovies();
        } catch (error) {
            console.error('Error saving movie:', error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setCurrentMovie(null);
        setFormData({
            title: '',
            director: '',
            year: '',
            genre: '',
            description: '',
            poster: '',
            rating: '',
            duration: ''
        });
    };

    return (
        <div className="movies-page">
            <div className="page-header">
                <h1>Movies</h1>
                {canEdit && (
                    <div className="access-notice">
                        🔒 You have write access to manage the movie catalog.
                    </div>
                )}
            </div>

            {canEdit && (
                <div className="movie-form-section">
                    <h3>{isEditing ? 'Edit Movie' : 'Add New Movie'}</h3>
                    <form onSubmit={handleSubmit} className="movie-form">
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
                                <select
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Rating</option>
                                    <option value="G">G</option>
                                    <option value="PG">PG</option>
                                    <option value="PG-13">PG-13</option>
                                    <option value="R">R</option>
                                    <option value="NC-17">NC-17</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Poster URL</label>
                            <input
                                type="url"
                                name="poster"
                                value={formData.poster}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {isEditing ? 'Update Movie' : 'Add Movie'}
                            </button>
                            {(isEditing || formData.title) && (
                                <button type="button" onClick={handleCancel} className="btn-secondary">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
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
                {movies.length === 0 && (
                    <div className="empty-state">
                        <h3>No movies found</h3>
                        <p>Add movies to the catalog to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Movies;
