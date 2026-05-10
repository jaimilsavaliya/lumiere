// components/movie/MovieMain.tsx
import { useNavigate } from "react-router-dom"
import type { Source, Subtitle } from "@omss/sdk"
import type { MovieResultItem } from "@lorenzopant/tmdb"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import LumierePlayer from "@/components/media/LumierePlayer"
// ─── Types ────────────────────────────────────────────────────────────────────

interface MovieMainProps {
    sources: Source[]
    subtitles: Subtitle[]
    similar: MovieResultItem[]
    recommendations: MovieResultItem[]
    sourcesLoading: boolean
}


const TMDB_IMG = (path: string | null, size = "w342") => (path ? `https://image.tmdb.org/t/p/${size}${path}` : "/placeholder.png")

function MovieCarousel({ title, items }: { title: string; items: MovieResultItem[] }) {
    const navigate = useNavigate()

    if (!items.length) return null

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            <ScrollArea className="w-full rounded-lg whitespace-nowrap">
                <div className="flex gap-3 pb-4">
                    {items.map((movie) => (
                        <button
                            key={movie.id}
                            onClick={() => navigate(`/movie/${movie.id}`)}
                            className="group relative w-[120px] shrink-0 overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-transform duration-200 hover:scale-105 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <img src={TMDB_IMG(movie.poster_path ?? '')} alt={movie.title} className="h-[180px] w-full object-cover" loading="lazy" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                <p className="truncate text-xs font-medium text-white">{movie.title}</p>
                                <p className="text-[10px] text-white/60">⭐ {movie.vote_average?.toFixed(1)}</p>
                            </div>
                        </button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}


// ─── Main export ──────────────────────────────────────────────────────────────

export function MovieMain({ sources, subtitles, similar, recommendations, sourcesLoading }: MovieMainProps) {
    return (
        <div className="flex min-w-0 flex-1 flex-col gap-8">
            {/* Player */}
            {sourcesLoading ? (
                <div className="flex flex-col gap-4">
                    <Skeleton className="aspect-video w-full rounded-2xl" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32 rounded-full" />
                        <Skeleton className="h-10 w-32 rounded-full" />
                    </div>
                </div>
            ) : sources.length !== 0 ? (
                <div className="flex flex-col gap-6">
                    <LumierePlayer sources={sources} subtitles={subtitles} />
                    
                    {/* Source Information / Stats */}
                    <div className="flex flex-wrap items-center justify-between gap-4 px-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
                                {sources.length} Sources Found
                            </Badge>
                            <Badge variant="outline" className="px-3 py-1 text-xs font-medium border-primary/30 text-primary">
                                Auto-playing Best Quality
                            </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                           {sources[0]?.audioTracks.map((t) => (
                                <Badge key={t.language} variant="outline" className="bg-primary/5 text-[10px] uppercase tracking-wider">
                                    {t.label}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-muted/50 bg-muted/5 py-16 text-center">
                    <div className="rounded-full bg-muted/10 p-4">
                        <img src="/lumiere-logo.png" className="h-12 w-12 grayscale opacity-50" alt="" />
                    </div>
                    <div className="max-w-md space-y-1">
                        <p className="text-lg font-semibold">No streams available</p>
                        <p className="text-sm text-muted-foreground px-6">
                            We couldn't find any working links for this title. This might be due to network restrictions or provider downtime.
                        </p>
                    </div>
                </div>
            )}

            {/* Carousels */}
            <div className="space-y-12 mt-4">
                <MovieCarousel title="Similar Movies" items={similar} />
                <MovieCarousel title="Recommended for You" items={recommendations} />
            </div>
        </div>
    )
}

