// Movie Card Component
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canWrite } from '../utils/accessControl';

const MovieCard = ({ movie, onEdit, onDelete }) => {
    const { user } = useAuth();
    const canEditMovies = user && canWrite(user.role, 'movies');

    return (
        <div className="movie-card">
            <div className="movie-poster">
                <img src={movie.poster} alt={movie.title} />
                <div className="movie-rating">{movie.rating}</div>
            </div>

            <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>
                <p className="movie-director">Directed by {movie.director}</p>
                <p className="movie-meta">
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span>{movie.duration} min</span>
                    <span>•</span>
                    <span>{movie.genre}</span>
                </p>
                <p className="movie-description">{movie.description}</p>
            </div>

            <div className="movie-actions">
                <Link to={`/book/${movie.id}`} className="btn-primary">
                    🎟️ Book Tickets
                </Link>

                {canEditMovies && (
                    <div className="admin-actions">
                        <button onClick={() => onEdit(movie)} className="btn-secondary">
                            ✏️ Edit
                        </button>
                        <button onClick={() => onDelete(movie.id)} className="btn-danger">
                            🗑️ Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieCard;
