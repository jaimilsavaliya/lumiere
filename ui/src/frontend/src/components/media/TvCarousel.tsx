import type { TVSeriesResultItem } from "@lorenzopant/tmdb"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel.tsx"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card.tsx"
import { Button } from "@/components/ui/button.tsx"
import { LucideChevronRight, LucidePlay, LucideStar, LucideCalendar, LucideGlobe } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function TVCarousel({ title, shows, loading, viewAllLink }: { title: string; shows: TVSeriesResultItem[], loading: boolean, viewAllLink?: string }) {
    return (
        <section className="my-8">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{title}</h2>
                <Button variant="ghost" size="sm" className="group/link flex items-center gap-1 text-muted-foreground hover:text-primary" asChild>
                    <Link to={viewAllLink || "/discover"}>
                        View All
                        <LucideChevronRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                </Button>
            </div>

            <Carousel opts={{ skipSnaps: true, dragFree: true }} className="group/carousel h-full w-full">
                <CarouselContent className="h-full w-full px-3">
                    {loading &&
                        Array.from({ length: 10 }).map((_, idx) => (
                            <CarouselItem key={idx} className={"h-full p-2 md:basis-1/10 lg:basis-1/8"}>
                                <Skeleton className="h-40 w-full rounded-2xl" />
                            </CarouselItem>
                        ))}
                    {!loading && shows.map((show, idx) => (
                        <CarouselItem key={idx} className="h-full p-2 md:basis-1/10 lg:basis-1/8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ 
                                    duration: 0.4, 
                                    delay: idx * 0.03,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <HoverCard openDelay={250} closeDelay={300}>
                                    <HoverCardTrigger>
                                        <TVCardTrigger show={show} />
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                        side="right"
                                        className="m-0 w-72 overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-2xl select-none!"
                                    >
                                        <TVCardContent show={show} />
                                    </HoverCardContent>
                                </HoverCard>
                            </motion.div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </section>
    )
}

// Trigger component
export function TVCardTrigger({ show }: { show: TVSeriesResultItem }) {
    if (!show.poster_path) {
        return <Skeleton className="h-40 w-full rounded-2xl" />
    }

    const alt = show.name || "No Title"
    return <img src={`https://image.tmdb.org/t/p/w300${show.poster_path}`} alt={alt} className="h-full w-full rounded-2xl object-cover" width={300} height={169} />
}

// HoverCard content — redesigned
export function TVCardContent({ show }: { show: TVSeriesResultItem }) {
    const backdrop = show.backdrop_path
    const imgSrc = backdrop ? `https://image.tmdb.org/t/p/w780${backdrop}` : null
    const title = show.name || "No Title"

    const overviewFull = show.overview
    const overview = overviewFull ? (overviewFull.length > 120 ? overviewFull.slice(0, 120) + "…" : overviewFull) : "No overview available."

    const rating = show.vote_average ?? null
    const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null
    const lang = show.original_language?.toUpperCase() || "—"
    const id = show.id

    const navigate = useNavigate()

    return (
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950">
            {/* Backdrop with gradient overlay */}
            <div className="relative aspect-[16/9] w-full overflow-hidden">
                {imgSrc
                    ? <img src={imgSrc} alt={title} className="h-full w-full object-cover object-center" />
                    : <div className="h-full w-full bg-zinc-800" />
                }
                {/* Dark gradient from bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                {/* Rating pill — top right */}
                {rating !== null && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur-sm ring-1 ring-yellow-400/20">
                        <LucideStar className="size-3 fill-yellow-400" />
                        {Number(rating).toFixed(1)}
                    </div>
                )}
            </div>

            {/* Text content */}
            <div className="flex flex-col gap-3 px-4 pb-4 pt-2">
                {/* Title */}
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white">{title}</h3>

                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {year && (
                        <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/70">
                            <LucideCalendar className="size-2.5" />
                            {year}
                        </span>
                    )}
                    <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/70">
                        <LucideGlobe className="size-2.5" />
                        {lang}
                    </span>
                </div>

                {/* Overview */}
                <p className="line-clamp-3 text-[11px] leading-relaxed text-white/55">{overview}</p>

                {/* CTA */}
                <Button
                    className="mt-1 w-full rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                    onClick={() => navigate("/tv/" + id)}
                >
                    <LucidePlay className="mr-1.5 size-4 fill-current" />
                    Watch Now
                </Button>
            </div>
        </div>
    )
}
