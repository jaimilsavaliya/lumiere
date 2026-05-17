import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useTmdb } from "@/components/providers/tmdb-provider"
import type { MovieResultItem, TVSeriesResultItem } from "@lorenzopant/tmdb"
import { ChevronLeft, Loader2, Star, Film, Tv } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

type MediaItem = MovieResultItem | TVSeriesResultItem

export default function ProviderPage() {
    const { id } = useParams<{ id: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const tmdb = useTmdb()
    const navigate = useNavigate()

    const providerName = searchParams.get("name") || "Provider"
    const mediaType = searchParams.get("type") === "tv" ? "tv" : "movie"

    const [items, setItems] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const sentinelRef = useRef<HTMLDivElement>(null)

    // Reset when provider or media type changes
    useEffect(() => {
        setPage(1)
        setItems([])
        setHasMore(true)
    }, [id, mediaType])

    const fetchItems = useCallback(async (pageNum: number) => {
        if (!id) return

        try {
            setLoading(true)
            let res: any

            const params = {
                language: "en-US",
                page: pageNum,
                with_watch_providers: id,
                watch_region: "US",
                sort_by: "popularity.desc"
            }

            if (mediaType === "movie") {
                res = await tmdb.discover.movie(params)
            } else {
                res = await tmdb.discover.tv(params)
            }

            if (res) {
                const newItems: MediaItem[] = res.results || []
                if (pageNum === 1) {
                    setItems(newItems)
                } else {
                    setItems((prev) => {
                        // filter out duplicates to be safe
                        const existingIds = new Set(prev.map(i => i.id))
                        return [...prev, ...newItems.filter(i => !existingIds.has(i.id))]
                    })
                }
                const totalPages = res.total_pages ?? 1
                setHasMore(pageNum < totalPages && pageNum < 500)
            }
        } catch (err) {
            console.error("Failed to fetch provider items:", err)
        } finally {
            setLoading(false)
        }
    }, [tmdb, id, mediaType])

    // Initial load and refetch
    useEffect(() => {
        fetchItems(page)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, id, mediaType])

    // IntersectionObserver for infinite scroll
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && hasMore) {
                    setPage((prev) => prev + 1)
                }
            },
            { rootMargin: "200px" }
        )

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [loading, hasMore])

    const handleTypeChange = (newType: "movie" | "tv") => {
        if (newType === mediaType) return
        const params = new URLSearchParams(searchParams)
        params.set("type", newType)
        setSearchParams(params, { replace: true })
    }

    return (
        <section className="space-y-6 pb-16">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full shrink-0">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{providerName}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Showing popular {mediaType === "movie" ? "movies" : "TV shows"}
                        </p>
                    </div>
                </div>

                {/* Media Type Toggle */}
                <div className="flex items-center rounded-full border border-border/50 bg-background/50 p-1 backdrop-blur-sm self-start md:self-auto">
                    <button
                        onClick={() => handleTypeChange("movie")}
                        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                            mediaType === "movie" 
                                ? "bg-primary text-primary-foreground shadow-sm" 
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                    >
                        <Film className="h-4 w-4" />
                        Movies
                    </button>
                    <button
                        onClick={() => handleTypeChange("tv")}
                        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                            mediaType === "tv" 
                                ? "bg-primary text-primary-foreground shadow-sm" 
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                    >
                        <Tv className="h-4 w-4" />
                        TV Shows
                    </button>
                </div>
            </div>

            {/* Grid */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    key={`${id}-${mediaType}`} // Re-animate on toggle
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                >
                    {items.map((item, idx) => {
                        const itemId = item.id
                        const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : "/placeholder.png"
                        const name = (item as any).title || (item as any).name
                        const rating = item.vote_average
                        const date = (item as any).release_date || (item as any).first_air_date

                        return (
                            <motion.div
                                key={`${itemId}-${idx}`}
                                variants={itemVariants}
                                layout
                                onClick={() => navigate(`/${mediaType}/${itemId}`)}
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
            </AnimatePresence>

            {/* Skeletons */}
            {loading && items.length === 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={`skel-${i}`} className="aspect-[2/3] animate-pulse rounded-xl bg-secondary" />
                    ))}
                </div>
            )}

            {/* Sentinel */}
            <div ref={sentinelRef} className="flex h-10 items-center justify-center">
                {loading && <Loader2 className="h-6 w-6 animate-spin text-primary opacity-60" />}
            </div>
        </section>
    )
}
