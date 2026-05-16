import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useTmdb } from "@/components/providers/tmdb-provider"
import type { MovieResultItem, TVSeriesResultItem } from "@lorenzopant/tmdb"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LucideSlidersHorizontal, Star, ChevronLeft, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

import { motion } from "framer-motion"

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

type MediaItem = MovieResultItem | TVSeriesResultItem

const MOVIE_GENRES = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
]

const TV_GENRES = [
    { id: 10759, name: "Action & Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 10762, name: "Kids" },
    { id: 9648, name: "Mystery" },
    { id: 10763, name: "News" },
    { id: 10764, name: "Reality" },
    { id: 10765, name: "Sci-Fi & Fantasy" },
    { id: 10766, name: "Soap" },
    { id: 10767, name: "Talk" },
    { id: 10768, name: "War & Politics" },
    { id: 37, name: "Western" },
]

export default function CategoryPage() {
    const { type, category } = useParams<{ type: string; category: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const tmdb = useTmdb()
    const navigate = useNavigate()

    const [items, setItems] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [title, setTitle] = useState("")

    // Active genre filter (from URL or null)
    const activeGenreId = searchParams.get("genre") ? Number(searchParams.get("genre")) : null
    const genres = type === "tv" ? TV_GENRES : MOVIE_GENRES

    // sentinel div ref for IntersectionObserver
    const sentinelRef = useRef<HTMLDivElement>(null)

    const genreId = searchParams.get("genre")
    const genreName = searchParams.get("name")

    // Reset when category / type / genre changes
    useEffect(() => {
        setPage(1)
        setItems([])
        setHasMore(true)
    }, [type, category, genreId])

    const fetchItems = useCallback(async (pageNum: number) => {
        try {
            setLoading(true)
            let res: any
            let displayTitle = ""

            const withGenres = genreId || undefined

            if (type === "movie") {
                if (category === "popular") {
                    res = withGenres
                        ? await tmdb.discover.movie({ language: "en-US", with_genres: withGenres, page: pageNum, sort_by: "popularity.desc" })
                        : await tmdb.movie_lists.popular({ language: "en-US", page: pageNum })
                    displayTitle = "Popular Movies"
                } else if (category === "top_rated") {
                    res = withGenres
                        ? await tmdb.discover.movie({ language: "en-US", with_genres: withGenres, page: pageNum, sort_by: "vote_average.desc", "vote_count.gte": "200" })
                        : await tmdb.movie_lists.top_rated({ language: "en-US", page: pageNum })
                    displayTitle = "Top Rated Movies"
                } else if (category === "genre" && genreId) {
                    res = await tmdb.discover.movie({ language: "en-US", with_genres: withGenres, page: pageNum, sort_by: "popularity.desc" })
                    displayTitle = `${genreName || "Genre"} Movies`
                }
            } else if (type === "tv") {
                if (category === "popular") {
                    res = withGenres
                        ? await tmdb.discover.tv({ language: "en-US", with_genres: withGenres, page: pageNum, sort_by: "popularity.desc" })
                        : await tmdb.tv_lists.popular({ language: "en-US", page: pageNum })
                    displayTitle = "Popular TV Shows"
                } else if (category === "top_rated") {
                    res = withGenres
                        ? await tmdb.discover.tv({ language: "en-US", with_genres: withGenres, page: pageNum, sort_by: "vote_average.desc", "vote_count.gte": "50" })
                        : await tmdb.tv_lists.top_rated({ language: "en-US", page: pageNum })
                    displayTitle = "Top Rated TV Shows"
                } else if (category === "genre" && genreId) {
                    res = await tmdb.discover.tv({ language: "en-US", with_genres: withGenres, page: pageNum, sort_by: "popularity.desc" })
                    displayTitle = `${genreName || "Genre"} TV Shows`
                }
            }

            if (res) {
                const newItems: MediaItem[] = res.results || []
                if (pageNum === 1) {
                    setItems(newItems)
                } else {
                    setItems((prev) => [...prev, ...newItems])
                }
                const totalPages = res.total_pages ?? 1
                setHasMore(pageNum < totalPages && pageNum < 500)
                if (displayTitle) setTitle(displayTitle)
            }
        } catch (err) {
            console.error("Failed to fetch category items:", err)
        } finally {
            setLoading(false)
        }
    }, [tmdb, type, category, genreId, genreName])

    // Initial load and refetch on genre filter change
    useEffect(() => {
        fetchItems(1)
    }, [fetchItems])

    // IntersectionObserver
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && hasMore) {
                    setPage((prev) => {
                        const next = prev + 1
                        fetchItems(next)
                        return next
                    })
                }
            },
            { rootMargin: "200px" }
        )

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [loading, hasMore, fetchItems])

    const handleGenreClick = (genreId: number, genreName: string) => {
        setItems([])
        setPage(1)
        setHasMore(true)
        if (activeGenreId === genreId) {
            // Toggle off — remove filter
            const params = new URLSearchParams(searchParams)
            params.delete("genre")
            params.delete("name")
            setSearchParams(params, { replace: true })
        } else {
            const params = new URLSearchParams(searchParams)
            params.set("genre", String(genreId))
            params.set("name", genreName)
            setSearchParams(params, { replace: true })
        }
    }

    const clearGenre = () => {
        setItems([])
        setPage(1)
        setHasMore(true)
        const params = new URLSearchParams(searchParams)
        params.delete("genre")
        params.delete("name")
        setSearchParams(params, { replace: true })
    }

    return (
        <section className="space-y-5 pb-16">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{title}</h1>
                    {activeGenreId && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Filtered by <span className="text-primary font-medium">{genres.find(g => g.id === activeGenreId)?.name}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Genre Filter Dropdown */}
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full border-primary/20 bg-primary/5 px-4 transition-all hover:bg-primary/10">
                            <LucideSlidersHorizontal className="mr-2 h-4 w-4 text-primary" />
                            {activeGenreId ? genres.find((g) => g.id === activeGenreId)?.name : "Filter by Genre"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="no-scrollbar max-h-80 overflow-y-auto rounded-xl">
                        <DropdownMenuLabel>Select Genre</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={String(activeGenreId)} onValueChange={(v) => {
                            const g = genres.find(x => String(x.id) === v);
                            if (g) handleGenreClick(g.id, g.name);
                        }}>
                            {genres.map((g) => (
                                <DropdownMenuRadioItem key={g.id} value={String(g.id)} className="rounded-lg">
                                    {g.name}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {activeGenreId && (
                    <Button variant="ghost" size="sm" onClick={clearGenre} className="rounded-full text-muted-foreground hover:text-destructive">
                        <X className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                key={`${type}-${category}-${activeGenreId}`} // Re-animate on filter change
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            >
                {items.map((item, idx) => {
                    const id = item.id
                    const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : "/placeholder.png"
                    const name = (item as any).title || (item as any).name
                    const rating = item.vote_average
                    const date = (item as any).release_date || (item as any).first_air_date

                    return (
                        <motion.div
                            key={`${id}-${idx}`}
                            variants={itemVariants}
                            layout
                            onClick={() => navigate(`/${type}/${id}`)}
                            className="group relative cursor-pointer overflow-hidden rounded-xl bg-card transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10"
                        >
                            <img
                                src={poster}
                                alt={name}
                                className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <p className="text-sm font-semibold text-white line-clamp-2">{name}</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-primary text-primary" />
                                        <span className="text-xs text-primary">{rating?.toFixed(1)}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">{date?.split("-")[0]}</span>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* Skeletons for initial loading or more results */}
            {loading && items.length === 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={`skel-${i}`} className="aspect-[2/3] animate-pulse rounded-xl bg-secondary" />
                    ))}
                </div>
            )}

            {/* Sentinel for infinite scroll */}
            <div ref={sentinelRef} className="flex h-10 items-center justify-center">
                {loading && <Loader2 className="h-6 w-6 animate-spin text-primary opacity-60" />}
            </div>
        </section>
    )
}
