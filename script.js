const apiKey = 'aa35f6e4';
const searchBox = document.querySelector('#searchInput');
const search = document.querySelector('#searchBtn');
const movieContainer= document.querySelector('#movies-container')
async function getMovies(name) {
    try {
        const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${name}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        alert("Failed to fetch movie data. Please check your internet connection.")
        
    }    
}

function displayMovies(movies) {
    movieContainer.innerHTML = '';
    movies.forEach(movie => {
        const posterUrl = movie.Poster === 'N/A' 
            ? 'https://placehold.co/180x270/1e1e1e/fff?text=No+Image' 
            : movie.Poster;
        const movieCardHTML = `
            <div class="movie-card" data-imdb-id="${movie.imdbID}">
                <img src="${posterUrl}" alt="${movie.Title}">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.Title}</h3>
                    <p class="movie-rating">${movie.Year}</p>
                </div>
            </div>
        `;
        movieContainer.innerHTML += movieCardHTML;
    });
}

async function handleSearch() {
    let searchTerm = searchBox.value;
    
    if (searchTerm === '') {
        alert('please provide any show');
    } else {
        let movieData = await getMovies(searchTerm);
        
        if (movieData && movieData.Search) {
            displayMovies(movieData.Search);
        } else {
            movieContainer.innerHTML = `<p style="color: #aaa; text-align: center;">No results found for "${searchTerm}"</p>`;
        }
    }
}
searchBox.addEventListener('keyup', function(event){
    if(event.key === 'Enter')
    {
        handleSearch();
            //searchBox.value = '';
    }
})
