const apiKey = 'aa35f6e4';

// --- Selectors for Navigation ---
const homeLink = document.querySelector('#home-link');
const favoritesLink = document.querySelector('#favorites-link');
const logo = document.querySelector('.logo'); 
const mainSection = document.querySelector('main'); 
const favoritesSection = document.querySelector('#favorites-section');
const detailsSection = document.querySelector('#details-section');

// --- Selectors for Search ---
const searchBox = document.querySelector('#searchInput');
const search = document.querySelector('#searchBtn');
const movieContainer = document.querySelector('#movies-container');
const favoritesContainer = document.querySelector('#favorites-container');

// --- Selectors for Details Page ---
const detailsContainer = document.querySelector('#details-container');
const backBtn = document.querySelector('#back-btn');

// --- Favorites List ---
// This array will hold our favorite movie IMDB IDs.
let favorites = [];

// --- Load Favorites from Local Storage ---
function loadFavorites() {
    const favsJSON = localStorage.getItem('movieFavorites');
    if (favsJSON) {
        favorites = JSON.parse(favsJSON);
    }
}

// --- Save Favorites to Local Storage ---
function saveFavorites() {
    const favsJSON = JSON.stringify(favorites);
    localStorage.setItem('movieFavorites', favsJSON);
}

// --- Add/Remove from Favorites ---
function handleToggleFavorite(imdbId, buttonElement) {
    // Check if the movie is already in our list
    if (favorites.includes(imdbId)) {
        // --- Remove it ---
        favorites = favorites.filter(id => id !== imdbId);
        buttonElement.classList.remove('active');
        buttonElement.textContent = '♡';
    } else {
        // --- Add it ---
        favorites.push(imdbId);
        buttonElement.classList.add('active');
        buttonElement.textContent = '♥';
    }
    // Save the new list to local storage
    saveFavorites();
}


async function getMovies(name) {
    // Fetches a LIST of movies based on a search term (s=)
    try {
        let url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${name}`;
        let response = await fetch(url);
        let data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch movie data:", error);
        movieContainer.innerHTML = `<p style="color: #aaa; text-align: center;">Failed to fetch data. Please check connection.</p>`;
    }     
}

async function getMovieDetails(id) {
    // Fetches the details for a SINGLE movie based on its ID (i=)
    try {
        const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`;
        const response = await fetch(url);
        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("Failed to fetch movie details:", error);
    }
}

// --- UPDATED: Display Movies Function ---
function displayMovies(movies, container = movieContainer) {
    container.innerHTML = ''; 
    
    if (!Array.isArray(movies)) {
        console.error('displayMovies received invalid data. Expected an array.');
        container.innerHTML = `<p style="color: #aaa; text-align: center;">Could not display movies.</p>`;
        return;
    }

    movies.forEach(movie => {
        const posterUrl = movie.Poster === 'N/A' 
            ? 'https://placehold.co/180x270/1e1e1e/fff?text=No+Image' 
            : movie.Poster;
        
        // --- UPDATED: Check if movie is a favorite on load ---
        const isFavorite = favorites.includes(movie.imdbID);
        const btnClass = isFavorite ? 'active' : '';
        const btnIcon = isFavorite ? '♥' : '♡';

        const movieCardHTML = `
            <div class="movie-card" data-imdb-id="${movie.imdbID}">
                <!-- Use the dynamic class and icon -->
                <button class="favorite-btn ${btnClass}" data-fav-id="${movie.imdbID}">${btnIcon}</button>
                <img src="${posterUrl}" alt="${movie.Title}">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.Title}</h3>
                    <p class="movie-rating">${movie.Year}</p>
                </div>
            </div>
        `;
        container.innerHTML += movieCardHTML; 
    });
}

function displayMovieDetails(movie) {
    // This function builds the HTML for the details page
    const posterUrl = movie.Poster === 'N/A' 
        ? 'https://placehold.co/300x450/1e1e1e/fff?text=No+Image' 
        : movie.Poster;
    const detailsHTML = `
        <div class="details-card">
            <img src="${posterUrl}" alt="${movie.Title}">
            <div class="details-info">
                <h2>${movie.Title} (${movie.Year})</h2>
                <p class="tagline"><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>Rating:</strong> ⭐ ${movie.imdbRating} / 10</p>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Writer:</strong> ${movie.Writer}</p>
                <p><strong>Actors:</strong> ${movie.Actors}</p>
                <p><strong>Plot:</strong> ${movie.Plot}</p>
                <p><strong>Runtime:</strong> ${movie.Runtime}</p>
            </div>
        </div>
    `;
    detailsContainer.innerHTML = detailsHTML;
}


async function handleSearch() {
    // This function handles searching from the input box
    let searchTerm = searchBox.value;
    if (searchTerm === '') {
        alert('please provide any show');
    } else {
        let movieData = await getMovies(searchTerm);
        if (movieData && movieData.Search) {
            displayMovies(movieData.Search, movieContainer);
        } else {
            movieContainer.innerHTML = `<p style="color: #aaa; text-align: center;">No results found for "${searchTerm}"</p>`;
        }
    }
}

async function showHomePage(event) {
    // This function shows the home page (and default 'thor' movies)
    if (event) event.preventDefault(); 
    
    mainSection.classList.remove('hidden');
    favoritesSection.classList.add('hidden');
    detailsSection.classList.add('hidden');
    
    homeLink.classList.add('active');
    favoritesLink.classList.remove('active');

    let movieData = await getMovies('thor');
    if (movieData && movieData.Search) {
        displayMovies(movieData.Search, movieContainer); 
    } else {
        movieContainer.innerHTML = `<p style="color: #aaa; text-align: center;">Could not load default movies.</p>`;
    }
}

// --- Show Favorites Page Function ---
async function showFavoritesPage(event) {
    if (event) event.preventDefault();

    // 1. Show/Hide sections
    mainSection.classList.add('hidden');
    favoritesSection.classList.remove('hidden');
    detailsSection.classList.add('hidden');
    
    // 2. Set active link
    homeLink.classList.remove('active');
    favoritesLink.classList.add('active');

    // 3. Check if there are any favorites
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `<p style="color: #aaa; text-align: center;">You haven't added any favorites yet.</p>`;
        return;
    }

    // 4. Fetch details for EACH favorite movie
    try {
        const moviePromises = favorites.map(id => getMovieDetails(id));
        const favoriteMovies = await Promise.all(moviePromises);
        
        // 5. Display them in the favorites container
        displayMovies(favoriteMovies, favoritesContainer);
    } catch (error) {
        console.error("Failed to fetch favorite movie details:", error);
        favoritesContainer.innerHTML = `<p style="color: #aaa; text-align: center;">Could not load favorites.</p>`;
    }
}


// --- SEARCH EVENT LISTENERS ---
search.addEventListener('click', handleSearch);
searchBox.addEventListener('keyup', async (event) => {
    if (event.key === 'Enter') {
        await handleSearch();
    }
});

// --- NAVIGATION CLICK LISTENERS ---
homeLink.addEventListener('click', showHomePage);
logo.addEventListener('click', showHomePage);
favoritesLink.addEventListener('click', showFavoritesPage);

// --- UPDATED: Main Movie Container Click Listener ---
movieContainer.addEventListener('click', async function(event) {
    
    const clickedFavButton = event.target.closest('.favorite-btn');
    if (clickedFavButton) {
        event.stopPropagation(); 
        const imdbId = clickedFavButton.dataset.favId;
        // --- UPDATED: Use the new handler function ---
        handleToggleFavorite(imdbId, clickedFavButton);
        return; 
    }
    
    const clickedCard = event.target.closest('.movie-card');
    if (!clickedCard) return;

    const imdbId = clickedCard.dataset.imdbId;
    const movieDetails = await getMovieDetails(imdbId);

    if (movieDetails) {
        displayMovieDetails(movieDetails);
        mainSection.classList.add('hidden');
        favoritesSection.classList.add('hidden');
        // --- FIXED: These lines were missing ---
        detailsSection.classList.remove('hidden');
        window.scrollTo(0, 0);
    }
}); // --- FIXED: This closing brace was missing ---

// --- NEW: Favorites Container Click Listener ---
// This allows clicking favorites/details from the favorites page
favoritesContainer.addEventListener('click', async function(event) {
    
    // --- Handle Favorite Toggle ---
    const clickedFavButton = event.target.closest('.favorite-btn');
    if (clickedFavButton) {
        event.stopPropagation(); 
        const imdbId = clickedFavButton.dataset.favId;
        
        // Use the handler function
        handleToggleFavorite(imdbId, clickedFavButton);
        
        // --- REFRESH the favorites page ---
        // This will make the movie disappear immediately
        await showFavoritesPage();
        return; 
    }
    
    // --- Handle Details Click ---
    const clickedCard = event.target.closest('.movie-card');
    if (!clickedCard) return;

    const imdbId = clickedCard.dataset.imdbId;
    const movieDetails = await getMovieDetails(imdbId);

    if (movieDetails) {
        displayMovieDetails(movieDetails);
        mainSection.classList.add('hidden');
        favoritesSection.classList.add('hidden');
        detailsSection.classList.remove('hidden');
        window.scrollTo(0, 0);
    }
});


backBtn.addEventListener('click', function() {
    // 1. Show the main section (with the last search results)
    mainSection.classList.remove('hidden');
    detailsSection.classList.add('hidden');
    // Also hide favorites, just in case
    favoritesSection.classList.add('hidden');
});

// --- NEW: Initial Page Load ---
// Use 'DOMContentLoaded' to make sure all HTML is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadFavorites(); // Load favs from storage first
    showHomePage();    // Then show the homepage (which will correctly mark favs)
});

