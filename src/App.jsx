import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YjBjMjA3ZDRkYTIxY2U3NTk5ZjQ1MTdiMTY4NDBmZSIsIm5iZiI6MTc2ODYyNDk1My43MDEsInN1YiI6IjY5NmIxMzM5ZTI4ZGM5Y2ZmZWY5NDAzYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RXmTJfxLRJZFCqPq1NooLi0-a0W_GFi6j9j5yMc_gXQ';

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    try {
      const endpoint = query 
        ? `https://api.themoviedb.org/3/search/movie?query=${query}`
        : 'https://api.themoviedb.org/3/movie/popular';

      const response = await axios.get(endpoint, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${TMDB_TOKEN}`
        }
      });
      setMovies(response.data.results);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      // Jeda singkat agar transisi loading terasa lebih halus
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const watchTrailer = async (movieId) => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${TMDB_TOKEN}`
        }
      });
      
      const trailer = response.data.results.find(
        (vid) => vid.type === 'Trailer' && vid.site === 'YouTube'
      );

      if (trailer) {
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
      } else {
        alert("Maaf, trailer tidak ditemukan untuk film ini.");
      }
    } catch (error) {
      console.error("Gagal ambil trailer:", error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 2) {
      fetchMovies(value);
    } else if (value.length === 0) {
      fetchMovies();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 font-sans">
      <header className="mb-12 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-black text-blue-500 uppercase tracking-[0.2em] mb-6 text-center">
          Movie<span className="text-white">Tracker</span>
        </h1>
        <div className="relative w-full max-w-md">
          <input 
            type="text"
            placeholder="Cari judul film..."
            className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl border-2 border-slate-800 focus:border-blue-500 outline-none transition-all shadow-2xl"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </header>

      {/* TAMPILAN LOADING */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-blue-400 font-medium animate-pulse">Loading...</p>
        </div>
      ) : (
        /* GRID KARTU FILM */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <div key={movie.id} className="group flex flex-col">
                <div className="relative overflow-hidden rounded-2xl bg-slate-900 aspect-[2/3] mb-4 shadow-xl">
                  {movie.poster_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 italic text-xs p-4 text-center">No Image Available</div>
                  )}
                  
                  {/* Overlay Tombol Trailer */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button 
                      onClick={() => watchTrailer(movie.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold text-xs transition-transform hover:scale-110 flex items-center gap-2"
                    >
                     Tonton Trailer
                    </button>
                  </div>
                </div>

                <h2 className="font-bold text-sm truncate group-hover:text-blue-400 transition-colors">
                  {movie.title}
                </h2>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-yellow-500 text-xs font-bold flex items-center gap-1">⭐ {movie.vote_average?.toFixed(1)}</span>
                  <span className="text-slate-600 text-[10px] font-semibold">{movie.release_date?.substring(0, 4) || "N/A"}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-slate-500 text-lg">Wah, film "{searchTerm}" tidak ditemukan.</p>
            </div>
          )}
        </div>
      )}

      <footer className="mt-20 py-10 border-t border-slate-900 text-center">
        <p className="text-slate-600 text-[10px] md:text-xs tracking-widest uppercase">
          Powered by <span className="text-blue-500 font-bold">RAZAN</span> — 2026 Project
        </p>
      </footer>
    </div>
  );
}

export default App;