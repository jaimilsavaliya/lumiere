import { useEffect, useState } from "react"
import { useTmdb } from "@/components/providers/tmdb-provider"
import type { MovieResultItem } from "@lorenzopant/tmdb"
import { useNavigate } from "react-router-dom"
import { Compass, TrendingUp, Star, Sparkles, Clock, Filter } from "lucide-react"

const GENRE_LIST = [
    { id: 28, name: "Action", emoji: "💥" },
    { id: 12, name: "Adventure", emoji: "🗺️" },
    { id: 16, name: "Animation", emoji: "🎨" },
    { id: 35, name: "Comedy", emoji: "😂" },
    { id: 80, name: "Crime", emoji: "🔪" },
    { id: 18, name: "Drama", emoji: "🎭" },
    { id: 10751, name: "Family", emoji: "👨‍👩‍👧‍👦" },
    { id: 14, name: "Fantasy", emoji: "🧙" },
    { id: 27, name: "Horror", emoji: "👻" },
    { id: 9648, name: "Mystery", emoji: "🔍" },
    { id: 10749, name: "Romance", emoji: "💕" },
    { id: 878, name: "Sci-Fi", emoji: "🚀" },
    { id: 53, name: "Thriller", emoji: "😰" },
    { id: 10752, name: "War", emoji: "⚔️" },
    { id: 37, name: "Western", emoji: "🤠" },
]

type SortOption = "popularity.desc" | "vote_average.desc" | "primary_release_date.desc" | "revenue.desc"

export default function Discover() {
    const tmdb = useTmdb()
    const navigate = useNavigate()

    const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
    const [sortBy, setSortBy] = useState<SortOption>("popularity.desc")
    const [movies, setMovies] = useState<MovieResultItem[]>([])
    const [trendingMovies, setTrendingMovies] = useState<MovieResultItem[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
        { value: "popularity.desc", label: "Trending", icon: <TrendingUp className="h-4 w-4" /> },
        { value: "vote_average.desc", label: "Top Rated", icon: <Star className="h-4 w-4" /> },
        { value: "primary_release_date.desc", label: "Newest", icon: <Clock className="h-4 w-4" /> },
        { value: "revenue.desc", label: "Box Office", icon: <Sparkles className="h-4 w-4" /> },
    ]

    // Fetch trending on mount
    useEffect(() => {
        async function fetchTrending() {
            try {
                const res = await tmdb.trending.movies({ time_window: "week" })
                setTrendingMovies(res.results?.slice(0, 6) || [])
            } catch (err) {
                console.error("Failed to fetch trending:", err)
            }
        }
        fetchTrending()
    }, [tmdb])

    // Fetch discover results based on filters
    useEffect(() => {
        async function fetchDiscover() {
            try {
                setLoading(true)
                const params: any = {
                    language: "en-US",
                    sort_by: sortBy,
                    page: page,
                    include_adult: false,
                    "vote_count.gte": sortBy === "vote_average.desc" ? 200 : 50,
                }
                if (selectedGenre) {
                    params.with_genres = selectedGenre
                }
                const res = await tmdb.discover.movie(params)
                if (page === 1) {
                    setMovies(res.results || [])
                } else {
                    setMovies((prev) => [...prev, ...(res.results || [])])
                }
            } catch (err) {
                console.error("Failed to fetch discover:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchDiscover()
    }, [tmdb, selectedGenre, sortBy, page])

    const handleGenreClick = (genreId: number) => {
        setSelectedGenre(selectedGenre === genreId ? null : genreId)
        setPage(1)
    }

    return (
        <section className="space-y-8 pb-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-accent/10 p-6 md:p-10">
                <div className="relative z-10">
                    <div className="mb-2 flex items-center gap-2 text-primary">
                        <Compass className="h-6 w-6" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Discover</span>
                    </div>
                    <h1 className="mb-2 text-3xl font-bold md:text-4xl">
                        Find Your Next Favorite
                    </h1>
                    <p className="max-w-lg text-muted-foreground">
                        Explore movies by genre, sort by popularity, ratings, or release date. Your next binge-worthy pick is just a click away.
                    </p>
                </div>
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
            </div>

            {/* Trending This Week */}
            {trendingMovies.length > 0 && (
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold">Trending This Week</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                        {trendingMovies.map((movie) => (
                            <div
                                key={movie.id}
                                onClick={() => navigate(`/movie/${movie.id}`)}
                                className="group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                                    alt={movie.title}
                                    className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <p className="text-sm font-semibold text-white line-clamp-2">{movie.title}</p>
                                    <div className="mt-1 flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-primary text-primary" />
                                        <span className="text-xs text-primary">{movie.vote_average?.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sort Options */}
            <div>
                <div className="mb-3 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Sort by</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {sortOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { setSortBy(opt.value); setPage(1) }}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                sortBy === opt.value
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                    : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            }`}
                        >
                            {opt.icon}
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Genre Tags */}
            <div>
                <div className="mb-3 flex items-center gap-2">
                    <Compass className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Genres</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {GENRE_LIST.map((genre) => (
                        <button
                            key={genre.id}
                            onClick={() => handleGenreClick(genre.id)}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                selectedGenre === genre.id
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                    : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            }`}
                        >
                            <span>{genre.emoji}</span>
                            {genre.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                        {selectedGenre
                            ? `${GENRE_LIST.find((g) => g.id === selectedGenre)?.name} Movies`
                            : "All Movies"}
                    </h2>
                    {!loading && (
                        <span className="text-sm text-muted-foreground">{movies.length} results</span>
                    )}
                </div>

                {loading && page === 1 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {Array.from({ length: 18 }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-secondary" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {movies.map((movie) => (
                                <div
                                    key={`${movie.id}-${page}`}
                                    onClick={() => navigate(`/movie/${movie.id}`)}
                                    className="group relative cursor-pointer overflow-hidden rounded-xl bg-card transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10"
                                >
                                    <img
                                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : "/placeholder.png"}
                                        alt={movie.title}
                                        className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <p className="text-sm font-semibold text-white line-clamp-2">{movie.title}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-primary text-primary" />
                                                <span className="text-xs text-primary">{movie.vote_average?.toFixed(1)}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{movie.release_date?.split("-")[0]}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Load More */}
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={loading}
                                className="rounded-full bg-primary/10 px-8 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                            >
                                {loading ? "Loading..." : "Load More"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}
