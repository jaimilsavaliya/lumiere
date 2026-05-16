import { useEffect, useState } from "react"
import Autoplay from "embla-carousel-autoplay"
import { LucidePlay, LucideStar, LucideCalendar, LucideInfo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useTmdb } from "@/components/providers/tmdb-provider"
import { toast } from "sonner"
import type { TrendingMovieResult } from "@lorenzopant/tmdb"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"

export function Hero() {
    const tmdb = useTmdb()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [movies, setMovies] = useState<TrendingMovieResult[]>([])
    const [logos, setLogos] = useState<(string | null)[]>([])

    // Fetch trending movies
    useEffect(() => {
        const load = async () => {
            try {
                const response = await tmdb.trending.movies({ time_window: "week" })
                setMovies(response.results)
            } catch (error) {
                toast.error("Failed to load popular movies. Please try again later.", {
                    description: error instanceof Error ? error.message : error ? String(error) : "Unknown error",
                    duration: 5000,
                })
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [tmdb])

    // Fetch logos for each movie
    useEffect(() => {
        if (!movies.length) return

        let cancelled = false

        const loadLogos = async () => {
            try {
                const results = await Promise.all(
                    movies.filter((m) => m.backdrop_path && m.poster_path && !m.adult && new Date(m.release_date) <= new Date()).map(async (movie) => {
                        try {
                            const res = await tmdb.movies.images({
                                movie_id: movie.id,
                                language: "en-US",
                                include_image_language: "en",
                            })
                            return res.logos?.[0]?.file_path ? `https://image.tmdb.org/t/p/w300${res.logos[0].file_path}` : null
                        } catch {
                            return null
                        }
                    })
                )
                if (!cancelled) setLogos(results)
            } catch {
                // ignore
            }
        }

        loadLogos()

        return () => {
            cancelled = true
        }
    }, [movies, tmdb])

    // Loading skeleton
    if (loading) {
        return (
            <div className="relative mt-3 h-[70vh] w-full overflow-hidden rounded-2xl bg-muted/50">
                <div className="flex h-full items-center justify-center">
                    <div className="flex w-full max-w-6xl items-center justify-between gap-10 px-10">
                        {/* Left content skeleton */}
                        <div className="flex max-w-xl flex-col gap-4">
                            <Skeleton className="h-12 w-48" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-32" />
                            <div className="mt-4 space-y-2">
                                <Skeleton className="h-4 w-96" />
                                <Skeleton className="h-4 w-80" />
                                <Skeleton className="h-4 w-72" />
                            </div>
                            <Skeleton className="mt-6 h-10 w-32" />
                        </div>
                        {/* Poster skeleton */}
                        <Skeleton className="h-100 w-65 rotate-6 rounded-lg" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-3 opacity-100 transition-opacity duration-500">
            <Carousel
                opts={{ loop: true }}
                plugins={[
                    Autoplay({
                        delay: 5000,
                    }),
                ]}
                className="h-full"
            >
                <CarouselContent className="h-full">
                    {movies
                        .filter((m) => m.backdrop_path && m.poster_path && !m.adult && new Date(m.release_date) <= new Date())
                        .map((movie, index) => {
                            const logoPath = logos[index]

                            return (
                                <CarouselItem key={movie.id} className="h-[70vh] w-full">
                                    <div
                                        className="relative flex h-full items-center justify-center rounded-2xl bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
                                        }}
                                    >
                                        {/* overlay */}
                                        <div className="absolute inset-0 rounded-2xl bg-black/50 backdrop-blur-sm" />

                                        {/* content */}
                                        <div className="relative z-10 flex w-[93%] max-w-6xl items-center gap-12 px-10 text-white">
                                            <div className="max-w-xl space-y-4">
                                                {/* Logo or fallback title */}
                                                {logoPath ? (
                                                    <img src={logoPath} alt={`${movie.title} logo`} className="mb-4 max-h-[120px] w-auto object-contain" />
                                                ) : (
                                                    <h1 className="mb-4 text-4xl font-bold">{movie.title}</h1>
                                                )}

                                                <p className="line-clamp-4 text-sm text-white/90">{movie.overview}</p>

                                                {/* Meta pills */}
                                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                                    {movie.release_date && (
                                                        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
                                                            <LucideCalendar className="size-3" />
                                                            {new Date(movie.release_date).getFullYear()}
                                                        </span>
                                                    )}
                                                    {movie.vote_average ? (
                                                        <span className="flex items-center gap-1.5 rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-semibold text-yellow-300 ring-1 ring-yellow-400/30">
                                                            <LucideStar className="size-3 fill-yellow-300" />
                                                            {movie.vote_average.toFixed(1)}
                                                        </span>
                                                    ) : null}
                                                </div>

                                                {/* CTA buttons */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => navigate(`/movie/${movie.id}`)}
                                                        className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all duration-300 hover:shadow-primary/60 hover:scale-[1.03] active:scale-[0.98]"
                                                    >
                                                        {/* Shine sweep on hover */}
                                                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                                                        <LucidePlay className="size-4 fill-current" />
                                                        Watch Now
                                                    </button>

                                                    <button
                                                        onClick={() => navigate(`/movie/${movie.id}`)}
                                                        className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
                                                    >
                                                        <LucideInfo className="size-4" />
                                                        More Info
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Poster */}
                                            <img
                                                src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                                                alt={movie.title}
                                                className="h-100 rotate-6 transform-gpu rounded-lg shadow-lg transition-transform duration-500 ease-out hover:scale-105 hover:rotate-2"
                                            />
                                        </div>
                                    </div>
                                </CarouselItem>
                            )
                        })}
                </CarouselContent>

                <CarouselPrevious className="left-4 bg-black/40 text-white hover:bg-black/60" />
                <CarouselNext className="right-4 bg-black/40 text-white hover:bg-black/60" />
            </Carousel>
        </div>
    )
}
