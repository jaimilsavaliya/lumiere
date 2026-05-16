import { useEffect, useState, useRef, useCallback } from "react"
import { useTmdb } from "@/components/providers/tmdb-provider"
import type { MovieResultItem } from "@lorenzopant/tmdb"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Compass, TrendingUp, Star, Sparkles, Clock, Filter, LucideSlidersHorizontal, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

const GENRE_LIST = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 27, name: "Horror" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
]

type SortOption = "popularity.desc" | "vote_average.desc" | "primary_release_date.desc" | "revenue.desc"

export default function Discover() {
    const tmdb = useTmdb()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const initialGenre = searchParams.get("genre") ? Number(searchParams.get("genre")) : null
    const initialSort = (searchParams.get("sort") as SortOption) || "popularity.desc"

    const [selectedGenre, setSelectedGenre] = useState<number | null>(initialGenre)
    const [sortBy, setSortBy] = useState<SortOption>(initialSort)
    const [movies, setMovies] = useState<MovieResultItem[]>([])
    const [trendingMovies, setTrendingMovies] = useState<MovieResultItem[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const sentinelRef = useRef<HTMLDivElement>(null)

    // Update URL when filters change
    useEffect(() => {
        const params: any = {}
        if (selectedGenre) params.genre = selectedGenre
        if (sortBy !== "popularity.desc") params.sort = sortBy
        setSearchParams(params, { replace: true })
    }, [selectedGenre, sortBy, setSearchParams])

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

    const fetchDiscover = useCallback(async (pageNum: number) => {
        try {
            setLoading(true)
            const params: any = {
                language: "en-US",
                sort_by: sortBy,
                page: pageNum,
                include_adult: false,
                "vote_count.gte": sortBy === "vote_average.desc" ? 200 : 50,
            }
            if (selectedGenre) {
                params.with_genres = selectedGenre
            }
            const res = await tmdb.discover.movie(params)
            const newItems = res.results || []
            
            if (pageNum === 1) {
                setMovies(newItems)
            } else {
                setMovies((prev) => [...prev, ...newItems])
            }
            setHasMore(pageNum < (res.total_pages || 1) && pageNum < 500)
        } catch (err) {
            console.error("Failed to fetch discover:", err)
        } finally {
            setLoading(false)
        }
    }, [tmdb, sortBy, selectedGenre])

    // Reset and fetch when filters change
    useEffect(() => {
        setPage(1)
        setMovies([])
        setHasMore(true)
        fetchDiscover(1)
    }, [sortBy, selectedGenre, fetchDiscover])

    // Infinite scroll observer
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && hasMore) {
                    setPage((prev) => {
                        const next = prev + 1
                        fetchDiscover(next)
                        return next
                    })
                }
            },
            { rootMargin: "400px" }
        )

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [loading, hasMore, fetchDiscover])

    const handleGenreClick = (genreId: number) => {
        setSelectedGenre(selectedGenre === genreId ? null : (genreId === 0 ? null : genreId))
    }

    return (
        <section className="space-y-8 pb-8">
            {/* Hero Section — Cinematic Banner */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative isolate overflow-hidden rounded-2xl bg-zinc-950 min-h-[220px]"
            >
                {/* ── Ambient background: blurred poster mosaic ── */}
                {trendingMovies.length > 0 && (
                    <div className="pointer-events-none absolute inset-0 flex overflow-hidden opacity-30">
                        {trendingMovies.slice(0, 6).map((m, i) => (
                            <div
                                key={m.id}
                                className="min-w-0 flex-1 bg-cover bg-center"
                                style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w500${m.backdrop_path})` }}
                            />
                        ))}
                        {/* Hard vignette so text is always readable */}
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/60" />
                    </div>
                )}

                {/* ── Floating poster strip — right side ── */}
                {trendingMovies.length >= 4 && (
                    <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-64 md:flex items-center justify-end pr-4 gap-3">
                        {[
                            { movie: trendingMovies[0], rotate: "-rotate-6", translate: "-translate-y-4", delay: 0 },
                            { movie: trendingMovies[1], rotate: "rotate-2",  translate: "translate-y-2",  delay: 0.08 },
                            { movie: trendingMovies[2], rotate: "-rotate-3", translate: "-translate-y-2", delay: 0.16 },
                            { movie: trendingMovies[3], rotate: "rotate-5",  translate: "translate-y-4",  delay: 0.24 },
                        ].map(({ movie, rotate, translate, delay }) => (
                            <motion.img
                                key={movie.id}
                                src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                                alt={movie.title}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
                                className={`h-36 w-24 rounded-xl object-cover shadow-2xl ring-1 ring-white/10 ${rotate} ${translate}`}
                            />
                        ))}
                    </div>
                )}

                {/* ── Text content ── */}
                <div className="relative z-10 flex flex-col justify-center gap-4 p-7 md:p-10 md:pr-72">
                    {/* Label */}
                    <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex items-center gap-2"
                    >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/40">
                            <Compass className="h-3.5 w-3.5 text-primary" />
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Discover</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.18 }}
                        className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl"
                    >
                        Your next favourite<br />
                        <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                            film is one click away.
                        </span>
                    </motion.h1>

                    {/* Sub-text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="max-w-sm text-sm leading-relaxed text-white/50"
                    >
                        Browse thousands of movies by genre, sort by ratings, box office, or release date — all in one place.
                    </motion.p>

                    {/* Quick genre chips */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-wrap gap-2"
                    >
                        {GENRE_LIST.slice(0, 7).map((g) => (
                            <button
                                key={g.id}
                                onClick={() => handleGenreClick(g.id)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200
                                    ${selectedGenre === g.id
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                                    }`}
                            >
                                {g.name}
                            </button>
                        ))}
                        <button
                            onClick={() => setSelectedGenre(null)}
                            className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/40 hover:bg-white/10 hover:text-white/70 transition-all"
                        >
                            + more
                        </button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Trending This Week */}
            {trendingMovies.length > 0 && (
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold">Trending This Week</h2>
                    </div>
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6"
                    >
                        {trendingMovies.map((movie) => (
                            <motion.div
                                key={movie.id}
                                variants={itemVariants}
                                whileHover={{ y: -5, scale: 1.02 }}
                                onClick={() => navigate(`/movie/${movie.id}`)}
                                className="group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/20"
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
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground ml-1">Sort by</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-10 rounded-xl border-primary/20 bg-primary/5 px-4 transition-all hover:bg-primary/10">
                                {sortOptions.find(o => o.value === sortBy)?.icon}
                                <span className="ml-2">{sortOptions.find(o => o.value === sortBy)?.label}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-xl">
                            <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setPage(1) }}>
                                {sortOptions.map((opt) => (
                                    <DropdownMenuRadioItem key={opt.value} value={opt.value} className="rounded-lg">
                                        <div className="flex items-center gap-2">
                                            {opt.icon}
                                            {opt.label}
                                        </div>
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Genre Dropdown */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground ml-1">Genre</span>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 rounded-xl border-primary/20 bg-primary/5 px-4 transition-all hover:bg-primary/10">
                                    <LucideSlidersHorizontal className="mr-2 h-4 w-4 text-primary" />
                                    {selectedGenre ? GENRE_LIST.find((g) => g.id === selectedGenre)?.name : "All Genres"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="no-scrollbar max-h-80 overflow-y-auto rounded-xl">
                                <DropdownMenuRadioGroup value={String(selectedGenre)} onValueChange={(v) => handleGenreClick(Number(v))}>
                                    <DropdownMenuRadioItem value="null" className="rounded-lg">All Genres</DropdownMenuRadioItem>
                                    <DropdownMenuSeparator />
                                    {GENRE_LIST.map((genre) => (
                                        <DropdownMenuRadioItem key={genre.id} value={String(genre.id)} className="rounded-lg">
                                            {genre.name}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {selectedGenre && (
                            <Button variant="ghost" size="sm" onClick={() => setSelectedGenre(null)} className="h-10 rounded-xl text-muted-foreground hover:text-destructive transition-colors">
                                <X className="mr-1 h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>
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

                <AnimatePresence mode="popLayout">
                    <motion.div 
                        key={`${sortBy}-${selectedGenre}`}
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    >
                        {movies.map((movie, idx) => (
                            <motion.div
                                key={`${movie.id}-${idx}`}
                                variants={itemVariants}
                                layout
                                whileHover={{ y: -5, scale: 1.02 }}
                                onClick={() => navigate(`/movie/${movie.id}`)}
                                className="group relative cursor-pointer overflow-hidden rounded-xl bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
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
                            </motion.div>
                        ))}
                        
                        {/* Skeletons */}
                        {loading && Array.from({ length: 12 }).map((_, i) => (
                            <motion.div 
                                key={`skel-${i}`} 
                                variants={itemVariants}
                                className="aspect-[2/3] animate-pulse rounded-xl bg-secondary" 
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Sentinel for infinite scroll */}
                <div ref={sentinelRef} className="flex h-20 items-center justify-center">
                    {loading && <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60" />}
                </div>
            </div>
        </section>
    )
}
