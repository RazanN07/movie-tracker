import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YjBjMjA3ZDRkYTIxY2U3NTk5ZjQ1MTdiMTY4NDBmZSIsIm5iZiI6MTc2ODYyNDk1My43MDEsInN1YiI6IjY5NmIxMzM5ZTI4ZGM5Y2ZmZWY5NDAzYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RXmTJfxLRJZFCqPq1NooLi0-a0W_GFi6j9j5yMc_gXQ';

  useEffect(() => {
    const savedWatchlist = JSON.parse(localStorage.getItem('my-watchlist')) || [];
    setWatchlist(savedWatchlist);
    fetchGenres();
    fetchMovies();
  }, []);

  useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowBackToTop(true);
    } else {
      setShowBackToTop(false);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

  const fetchGenres = async () => {
    try {
      const response = await axios.get('https://api.themoviedb.org/3/genre/movie/list', {
        headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
      });
      setGenres(response.data.genres);
    } catch (error) {
      console.error(error);
    }
  };

 const fetchMovies = async (query = '', genreId = '', page = 1) => {
  setIsLoading(true);
  try {
    let endpoint = `https://api.themoviedb.org/3/movie/popular?page=${page}`;
    
    if (query) {
      endpoint = `https://api.themoviedb.org/3/search/movie?query=${query}&page=${page}`;
    } else if (genreId) {
      endpoint = `https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&page=${page}`;
    }

      const response = await axios.get(endpoint, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${TMDB_TOKEN}`
        }
      });
      setMovies(response.data.results);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedGenre('');
    if (value.length > 2) {
      fetchMovies(value);
    } else if (value.length === 0) {
      fetchMovies();
    }
  };

  const handleGenreClick = (id) => {
    if (selectedGenre === id) {
      setSelectedGenre('');
      fetchMovies();
    } else {
      setSelectedGenre(id);
      setSearchTerm('');
      fetchMovies('', id);
    }
  };

  const toggleWatchlist = (e, movie) => {
    e.stopPropagation();
    let updatedList;
    const isExist = watchlist.find(m => m.id === movie.id);

    if (isExist) {
      updatedList = watchlist.filter(m => m.id !== movie.id);
    } else {
      updatedList = [...watchlist, movie];
    }

    setWatchlist(updatedList);
    localStorage.setItem('my-watchlist', JSON.stringify(updatedList));
    
    if (selectedGenre === 'watchlist') {
      setMovies(updatedList);
    }
  };

  const watchTrailer = async (movieId) => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
        headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
      });
      const trailer = response.data.results.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube');
      if (trailer) window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
      else alert("Trailer tidak ditemukan.");
    } catch (error) { console.error(error); }
  };

  const displayedGenres = showAllGenres ? genres : genres.slice(0, 5);

 return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 font-sans">
      <header className="mb-8 flex flex-col items-center relative max-w-6xl mx-auto">
        <button
          onClick={() => {
            if (selectedGenre === 'watchlist') {
              fetchMovies();
              setSelectedGenre('');
            } else {
              setMovies(watchlist);
              setSelectedGenre('watchlist');
            }
          }}
          className={`absolute right-0 top-0 p-2.5 rounded-xl border transition-all cursor-pointer z-50 ${
            selectedGenre === 'watchlist' 
            ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/50' 
            : 'border-slate-800 bg-slate-900 text-red-500 hover:border-red-600'
          }`}
        >
          <span className="text-lg">❤️</span>
          {watchlist.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-white text-red-600 text-[9px] font-black px-1 min-w-[16px] h-[16px] rounded-full border border-red-600 flex items-center justify-center">
              {watchlist.length}
            </span>
          )}
        </button>

        <h1 className="text-3xl md:text-5xl font-black text-blue-500 uppercase tracking-[0.2em] mb-6 text-center mt-12 md:mt-0">
          Movie<span className="text-white">Tracker</span>
        </h1>
        
        <div className="relative w-full max-w-md px-2">
          <input 
            type="text"
            placeholder="Cari judul film..."
            className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl border-2 border-slate-800 focus:border-blue-500 outline-none transition-all shadow-2xl"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </header>

      <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-4xl mx-auto">
        {displayedGenres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreClick(genre.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              selectedGenre === genre.id 
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600'
            }`}
          >
            {genre.name}
          </button>
        ))}
        {genres.length > 5 && (
          <button
            onClick={() => setShowAllGenres(!showAllGenres)}
            className="px-4 py-1.5 rounded-full text-xs font-bold border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600 transition-all cursor-pointer"
          >
            {showAllGenres ? '✕' : '•••'}
          </button>
        )}
      </div>

      {selectedGenre === 'watchlist' && (
        <div className="max-w-6xl mx-auto flex items-center justify-between mb-8 border-l-4 border-red-600 pl-4">
          <div>
            <h2 className="text-xl font-bold text-white">Watchlist Saya</h2>
            <p className="text-slate-500 text-sm">Daftar film yang kamu simpan</p>
          </div>
          <button 
            onClick={() => { fetchMovies(); setSelectedGenre(''); }} 
            className="text-xs bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg hover:bg-slate-800 cursor-pointer text-white transition-colors"
          >
            Kembali
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col animate-pulse">
              <div className="bg-slate-900 rounded-2xl aspect-[2/3] mb-4 border border-slate-800"></div>
              <div className="h-4 bg-slate-800 rounded-md w-3/4 mb-3"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-slate-800 rounded w-1/4"></div>
                <div className="h-3 bg-slate-800 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
            {movies.length > 0 ? movies.map((movie) => (
              <div key={movie.id} className="group flex flex-col relative">
                <div 
                  onClick={() => watchTrailer(movie.id)}
                  className="relative overflow-hidden rounded-2xl bg-slate-900 aspect-[2/3] mb-4 shadow-xl border border-slate-800/50 cursor-pointer"
                >
                  <button 
                    onClick={(e) => toggleWatchlist(e, movie)}
                    className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <span className={watchlist.find(m => m.id === movie.id) ? "text-red-500" : "text-white"}>
                      {watchlist.find(m => m.id === movie.id) ? "❤️" : "🤍"}
                    </span>
                  </button>

                  {movie.poster_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs p-4 text-center italic">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-black/60 md:bg-black/70 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold text-xs transition-transform hover:scale-110 cursor-pointer">
                      ▶ Trailer
                    </button>
                  </div>
                </div>
                <h2 className="font-bold text-sm truncate group-hover:text-blue-400 transition-colors">{movie.title}</h2>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    movie.vote_average >= 7 ? 'bg-green-500/20 text-green-500' : 
                    movie.vote_average >= 5 ? 'bg-yellow-500/20 text-yellow-500' : 
                    'bg-red-500/20 text-red-500'
                  }`}>
                    ⭐ {movie.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-slate-600 text-[10px] font-semibold">{movie.release_date?.substring(0, 4) || "N/A"}</span>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20">
                <p className="text-slate-500 italic text-white">Belum ada film di daftar ini.</p>
              </div>
            )}
          </div>

          {/* Bagian Pagination Lengkap (First, Prev, Numbers, Next, Last) */}
          {selectedGenre !== 'watchlist' && movies.length > 0 && (
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mt-16 mb-10 px-4">
              <button 
                onClick={() => {
                  setCurrentPage(1);
                  fetchMovies(searchTerm, selectedGenre, 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-30 cursor-pointer hover:border-blue-500 transition-colors text-white text-[10px] font-bold"
              >
                FIRST
              </button>

              <button 
                onClick={() => {
                  const prev = Math.max(currentPage - 1, 1);
                  setCurrentPage(prev);
                  fetchMovies(searchTerm, selectedGenre, prev);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-30 cursor-pointer hover:border-blue-500 transition-colors text-white"
              >
                ←
              </button>

              <div className="flex gap-1 md:gap-2">
                {[currentPage, currentPage + 1, currentPage + 2].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setCurrentPage(num);
                      fetchMovies(searchTerm, selectedGenre, num);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-lg border font-bold transition-all cursor-pointer text-xs md:text-sm ${
                      currentPage === num 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => {
                  const next = currentPage + 1;
                  setCurrentPage(next);
                  fetchMovies(searchTerm, selectedGenre, next);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-blue-500 transition-colors text-white"
              >
                →
              </button>

              <button 
                onClick={() => {
                  const last = 500;
                  setCurrentPage(last);
                  fetchMovies(searchTerm, selectedGenre, last);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-blue-500 transition-colors text-white text-[10px] font-bold"
              >
                LAST
              </button>
            </div>
          )}
        </>
      )}

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer animate-bounce"
        >
          <span className="text-xl">↑</span>
        </button>
      )}
    </div>
  );
}

export default App;