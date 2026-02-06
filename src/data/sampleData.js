// Sample Data for Movie Ticket Booking Platform

export const sampleMovies = [
    {
        id: 1,
        title: 'There Will Be Blood',
        director: 'Paul Thomas Anderson',
        year: 2007,
        genre: 'Drama',
        duration: 158,
        rating: 'R',
        description: 'A story of family, religion, hatred, oil and madness, focusing on a turn-of-the-century prospector in the early days of the business.',
        poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop'
    },
    {
        id: 2,
        title: 'The Darjeeling Limited',
        director: 'Wes Anderson',
        year: 2007,
        genre: 'Comedy/Drama',
        duration: 91,
        rating: 'R',
        description: 'A year after their father\'s funeral, three brothers travel across India by train in an attempt to bond with each other.',
        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop'
    },
    {
        id: 3,
        title: 'Apocalypse Now',
        director: 'Francis Ford Coppola',
        year: 1979,
        genre: 'War/Drama',
        duration: 147,
        rating: 'R',
        description: 'A U.S. Army officer serving in Vietnam is tasked with assassinating a renegade Special Forces Colonel who sees himself as a god.',
        poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop'
    }
];

export const sampleShows = [
    {
        id: 1,
        movieId: 1,
        date: '2026-02-07',
        time: '18:00',
        hall: 'Screen 1',
        price: 250,
        availableSeats: 100,
        totalSeats: 120
    },
    {
        id: 2,
        movieId: 1,
        date: '2026-02-07',
        time: '21:00',
        hall: 'Screen 1',
        price: 300,
        availableSeats: 85,
        totalSeats: 120
    },
    {
        id: 3,
        movieId: 2,
        date: '2026-02-07',
        time: '14:00',
        hall: 'Screen 2',
        price: 200,
        availableSeats: 60,
        totalSeats: 80
    },
    {
        id: 4,
        movieId: 2,
        date: '2026-02-08',
        time: '19:00',
        hall: 'Screen 2',
        price: 250,
        availableSeats: 75,
        totalSeats: 80
    },
    {
        id: 5,
        movieId: 3,
        date: '2026-02-07',
        time: '20:00',
        hall: 'Screen 3',
        price: 350,
        availableSeats: 90,
        totalSeats: 100
    },
    {
        id: 6,
        movieId: 3,
        date: '2026-02-08',
        time: '17:00',
        hall: 'Screen 3',
        price: 300,
        availableSeats: 100,
        totalSeats: 100
    }
];

// Initialize sample data in localStorage
export const initializeSampleData = () => {
    if (!localStorage.getItem('movies')) {
        localStorage.setItem('movies', JSON.stringify(sampleMovies));
    }
    if (!localStorage.getItem('shows')) {
        localStorage.setItem('shows', JSON.stringify(sampleShows));
    }
    if (!localStorage.getItem('bookings')) {
        localStorage.setItem('bookings', JSON.stringify([]));
    }
};

// Get movies from localStorage
export const getMovies = () => {
    const movies = localStorage.getItem('movies');
    return movies ? JSON.parse(movies) : sampleMovies;
};

// Get shows from localStorage
export const getShows = () => {
    const shows = localStorage.getItem('shows');
    return shows ? JSON.parse(shows) : sampleShows;
};

// Get bookings from localStorage
export const getBookings = () => {
    const bookings = localStorage.getItem('bookings');
    return bookings ? JSON.parse(bookings) : [];
};

// Save movies to localStorage
export const saveMovies = (movies) => {
    localStorage.setItem('movies', JSON.stringify(movies));
};

// Save shows to localStorage
export const saveShows = (shows) => {
    localStorage.setItem('shows', JSON.stringify(shows));
};

// Save bookings to localStorage
export const saveBookings = (bookings) => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
};
