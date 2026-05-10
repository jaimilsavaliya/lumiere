// components/watch/TVMain.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Source, Subtitle } from "@omss/sdk"
import type { TVSeriesResultItem, TVSeriesDetails, TVSeason, TVSeasonEpisode } from "@lorenzopant/tmdb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import LumierePlayer from "@/components/media/LumierePlayer"
import { Separator } from "@/components/ui/separator"

// ─── Types ────────────────────────────────────────────────────────────────────

interface TVMainProps {
    show: TVSeriesDetails | null
    season: TVSeason | null
    currentS: number
    currentE: number
    onEpisodeChange: (s: number, e: number) => void
    sources: Source[]
    subtitles: Subtitle[]
    similar: TVSeriesResultItem[]
    recommendations: TVSeriesResultItem[]
    sourcesLoading: boolean
}

const TMDB_IMG = (path: string | null, size = "w342") => (path ? `https://image.tmdb.org/t/p/${size}${path}` : "/placeholder.png")

function TVCarousel({ title, items }: { title: string; items: TVSeriesResultItem[] }) {
    const navigate = useNavigate()
    if (!items.length) return null

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            <ScrollArea className="w-full rounded-lg whitespace-nowrap">
                <div className="flex gap-3 pb-4">
                    {items.map((show) => (
                        <button
                            key={show.id}
                            onClick={() => navigate(`/tv/${show.id}`)}
                            className="group relative w-[120px] shrink-0 overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-transform duration-200 hover:scale-105 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <img src={TMDB_IMG(show.poster_path ?? '')} alt={show.name} className="h-[180px] w-full object-cover" loading="lazy" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                <p className="truncate text-xs font-medium text-white">{show.name}</p>
                                <p className="text-[10px] text-white/60">⭐ {show.vote_average?.toFixed(1)}</p>
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

export function TVMain({ 
    show, 
    season, 
    currentS, 
    currentE, 
    onEpisodeChange, 
    sources, 
    subtitles, 
    similar, 
    recommendations, 
    sourcesLoading 
}: TVMainProps) {
    if (!show) return null

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-8">
            {/* Episode Selector */}
            <div className="flex flex-col gap-4 rounded-2xl bg-muted/30 p-4 md:p-6 border border-border/40">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Season</span>
                        <Select value={String(currentS)} onValueChange={(val) => onEpisodeChange(Number(val), 1)}>
                            <SelectTrigger className="w-[140px] bg-background">
                                <SelectValue placeholder="Select Season" />
                            </SelectTrigger>
                            <SelectContent>
                                {show.seasons?.filter(s => s.season_number > 0).map((s) => (
                                    <SelectItem key={s.id} value={String(s.season_number)}>
                                        Season {s.season_number}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Episode</span>
                        <Select value={String(currentE)} onValueChange={(val) => onEpisodeChange(currentS, Number(val))}>
                            <SelectTrigger className="w-full bg-background">
                                <SelectValue placeholder="Select Episode" />
                            </SelectTrigger>
                            <SelectContent>
                                {season?.episodes.map((ep: TVSeasonEpisode) => (
                                    <SelectItem key={ep.id} value={String(ep.episode_number)}>
                                        E{ep.episode_number}: {ep.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                {season && (
                    <div className="flex flex-col gap-1 mt-2">
                        <h4 className="text-sm font-semibold text-primary">
                            Playing: S{currentS} E{currentE} — {season.episodes.find((e: TVSeasonEpisode) => e.episode_number === currentE)?.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {season.episodes.find((e: TVSeasonEpisode) => e.episode_number === currentE)?.overview}
                        </p>
                    </div>
                )}
            </div>

            {/* Player */}
            {sourcesLoading ? (
                <div className="flex flex-col gap-4">
                    <Skeleton className="aspect-video w-full rounded-2xl" />
                </div>
            ) : sources.length !== 0 ? (
                <div className="flex flex-col gap-6">
                    <LumierePlayer sources={sources} subtitles={subtitles} />
                    
                    {/* Source Information */}
                    <div className="flex flex-wrap items-center justify-between gap-4 px-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
                                {sources.length} Sources Found
                            </Badge>
                            <Badge variant="outline" className="px-3 py-1 text-xs font-medium border-primary/30 text-primary">
                                S{currentS} E{currentE} Ready
                            </Badge>
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
                            We couldn't find any working links for S{currentS} E{currentE}. Try another episode or check back later.
                        </p>
                    </div>
                </div>
            )}

            {/* Carousels */}
            <div className="space-y-12 mt-4">
                <TVCarousel title="Similar TV Shows" items={similar} />
                <TVCarousel title="Recommended for You" items={recommendations} />
            </div>
        </div>
    )
}
