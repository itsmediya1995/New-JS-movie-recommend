// Replace 'YOUR_API_KEY' with your actual OMDB API key
const OMDB_API_KEY = 'b5bbb63';

// Initial popular movies
const popularMovies = [
    'The Shawshank Redemption',
    'The Godfather',
    'The Dark Knight',
    'Inception',
    'Pulp Fiction',
    'Fight Club',
    'Forrest Gump',
    'Matrix'
];

// Cache for movie data
const movieCache = new Map();

// Function to fetch movie data from OMDB API
async function fetchMovieData(title) {
    if (movieCache.has(title)) {
        return movieCache.get(title);
    }

    try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            movieCache.set(title, data);
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching movie data:', error);
        return null;
    }
}

// Function to search movies
async function searchMovies(query) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            return data.Search;
        }
        return [];
    } catch (error) {
        console.error('Error searching movies:', error);
        return [];
    }
}

// Function to create movie card
function createMovieCard(movie) {
    const posterUrl = movie.Poster !== 'N/A' ? movie.Poster : '/api/placeholder/200/300';
    return `
        <div class="movie-card" data-imdbid="${movie.imdbID}" onclick="showMovieVideo('${movie.imdbID}')">
            <img src="${posterUrl}" alt="${movie.Title}" class="movie-poster" loading="lazy">
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <div class="movie-rating">★ ${movie.imdbRating || 'N/A'}</div>
            </div>
        </div>
    `;
}

// Function to handle movie card click and show video player
function showMovieVideo(imdbID) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="video-container">
            <iframe src="https://vidsrc.xyz/embed/movie?imdb=${imdbID}" 
                    style="width: 100%; height: 100%;" 
                    frameborder="0" 
                    referrerpolicy="origin" 
                    allowfullscreen>
            </iframe>
        </div>
        <button class="watch-btn back-to-info" onclick="closeModal()">Close</button>
    `;
    document.getElementById('movieModal').style.display = 'block';
}

// Function to close the modal
function closeModal() {
    document.getElementById('movieModal').style.display = 'none';
}

// Function to show loading state
function setLoading(loading) {
    document.getElementById('loading').style.display = loading ? 'block' : 'none';
    document.getElementById('movieGrid').style.opacity = loading ? '0.5' : '1';
}

// Function to load popular movies
async function loadPopularMovies() {
    setLoading(true);
    const movies = [];
    for (const title of popularMovies) {
        const movieData = await fetchMovieData(title);
        if (movieData) {
            movies.push(movieData);
        }
    }
    displayMovies(movies);
    setLoading(false);
}

// Function to display movies
function displayMovies(movies) {
    const movieGrid = document.getElementById('movieGrid');
    movieGrid.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
}

// Function to create video player
function createVideoPlayer(imdbID) {
    return `
        <div class="video-container">
            <iframe src="https://vidsrc.xyz/embed/movie?imdb=${imdbID}" 
                    style="width: 100%; height: 100%;" 
                    frameborder="0" 
                    referrerpolicy="origin" 
                    allowfullscreen>
            </iframe>
            <div class="quality-selector">
                <select onchange="changeQuality(this.value)">
                    <option value="auto">Auto</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                </select>
            </div>
        </div>
        <button class="watch-btn back-to-info" onclick="toggleVideo()">Back to Details</button>
    `;
}

// Function to display movie details in modal
async function showMovieDetails(imdbID) {
    setLoading(true);
    try {
        const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${OMDB_API_KEY}`);
        const movie = await response.json();
        
        if (movie.Response === 'True') {
            const modalContent = document.getElementById('modalContent');
            modalContent.innerHTML = `
                <div id="videoContainer" style="display: none;">
                    ${createVideoPlayer(imdbID)}
                </div>
                <div class="movie-info-container" id="movieInfoContainer">
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : '/api/placeholder/200/300'}" alt="${movie.Title}" class="movie-poster">
                    <div class="movie-info-details">
                        <h2>${movie.Title} (${movie.Year})</h2>
                        <p class="movie-rating">★ ${movie.imdbRating}</p>
                        <p><strong>Genre:</strong> ${movie.Genre}</p>
                        <p><strong>Director:</strong> ${movie.Director}</p>
                        <p><strong>Cast:</strong> ${movie.Actors}</p>
                        <p><strong>Plot:</strong> ${movie.Plot}</p>
                        <p><strong>Runtime:</strong> ${movie.Runtime}</p>
                        <p><strong>Awards:</strong> ${movie.Awards}</p>
                        <button class="watch-btn" onclick="toggleVideo()">Watch Now</button>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
    setLoading(false);
}

// Function to toggle between movie details and video player view
function toggleVideo() {
    const movieInfoContainer = document.getElementById('movieInfoContainer');
    const videoContainer = document.getElementById('videoContainer');
    
    // Toggle the display of movie info and video player
    if (movieInfoContainer.style.display !== 'none') {
        movieInfoContainer.style.display = 'none';
        videoContainer.style.display = 'block';
    } else {
        movieInfoContainer.style.display = 'block';
        videoContainer.style.display = 'none';
    }
}

// Function to change video quality
function changeQuality(quality) {
    const iframe = document.querySelector('.video-container iframe');
    const url = iframe.src;
    const newUrl = url.replace(/(quality=[^&]+)/, `quality=${quality}`);
    iframe.src = newUrl;
}

// Event listener for search input
document.getElementById('searchInput').addEventListener('input', async (e) => {
    const query = e.target.value;
    if (query.length > 2) {
        setLoading(true);
        const results = await searchMovies(query);
        const movieGrid = document.getElementById('movieGrid');
        movieGrid.innerHTML = results.map(movie => createMovieCard(movie)).join('');
        setLoading(false);
    }
});

// Event listener for popular movie buttons
document.getElementById('popularBtn').addEventListener('click', loadPopularMovies);

// Initialize popular movies when the page loads
window.onload = loadPopularMovies;
