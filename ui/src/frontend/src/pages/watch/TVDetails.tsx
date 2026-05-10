// components/watch/TVDetails.tsx
import type { TVSeriesDetails, TVDetailsWithAppends, Cast } from "@lorenzopant/tmdb"
import type { Diagnostic } from "@omss/sdk"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Info, XCircle } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface TVDetailsProps {
    show: TVDetailsWithAppends<["credits"]> | null
    loading: boolean
    diagnostics?: Diagnostic[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TMDB_IMG = (path: string | null, size = "w342") => (path ? `https://image.tmdb.org/t/p/${size}${path}` : "/placeholder.png")

function ratingColor(avg: number) {
    if (avg >= 7.5) return "text-green-500"
    if (avg >= 5.5) return "text-yellow-500"
    return "text-red-500"
}

// ─── Skeleton state ───────────────────────────────────────────────────────────

function DetailsSkeleton() {
    return (
        <div className="flex w-full shrink-0 flex-col gap-4 md:w-80 lg:w-96">
            <Skeleton className="aspect-[2/3] w-full rounded-xl" />
            <Skeleton className="h-6 w-2/3 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/6 rounded" />
        </div>
    )
}

// ─── Diagnostic pill ─────────────────────────────────────────────────────────

const DiagnosticIcon = ({ severity }: { severity: Diagnostic["severity"] }) => {
    if (severity === "error") return <XCircle className="h-3.5 w-3.5 text-red-500" />
    if (severity === "warning") return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
    return <Info className="h-3.5 w-3.5 text-blue-400" />
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function TVDetails({ show, loading, diagnostics = [] }: TVDetailsProps) {
    if (loading || !show) return <DetailsSkeleton />

    const cast = show.credits?.cast?.slice(0, 6) || []
    
    return (
        <aside className="flex w-full shrink-0 flex-col gap-5 md:w-80 lg:w-96">
            {/* Poster */}
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <img src={TMDB_IMG(show.poster_path ?? null, "w500")} alt={show.name} className="w-full object-cover transition-transform duration-500 hover:scale-105" />
                <Badge variant="secondary" className="absolute top-3 right-3 text-xs font-bold uppercase">
                    {show.status}
                </Badge>
            </div>

            {/* Info card */}
            <Card className="shadow-md">
                <CardHeader className="px-4 pt-4 pb-2">
                    <h2 className="text-xl leading-tight font-bold">{show.name}</h2>
                    {/* @ts-ignore - tagline might be in response but missing in types */}
                    {show.tagline && <p className="text-sm text-muted-foreground italic">"{show.tagline}"</p>}
                </CardHeader>

                <CardContent className="flex flex-col gap-4 px-4 pb-4">
                    {/* Rating bar */}
                    <div className="flex items-center gap-3">
                        <span className={`text-3xl font-extrabold tabular-nums ${ratingColor(show.vote_average)}`}>{show.vote_average.toFixed(1)}</span>
                        <div className="flex flex-col text-xs text-muted-foreground">
                            <span>/ 10</span>
                            <span>{show.vote_count.toLocaleString()} votes</span>
                        </div>
                        <div className="ml-auto flex flex-col items-end text-xs text-muted-foreground">
                            <span>{show.first_air_date.slice(0, 4)}</span>
                            <span>{show.number_of_seasons} Seasons</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Genres */}
                    <div className="flex flex-wrap gap-1.5">
                        {show.genres.map((g) => (
                            <Badge key={g.id} variant="outline" className="text-xs">
                                {g.name}
                            </Badge>
                        ))}
                    </div>

                    <Separator />

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Created By</p>
                            <p>{show.created_by?.[0]?.name ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Network</p>
                            <p>{show.networks?.[0]?.name ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Episodes</p>
                            <p>{show.number_of_episodes}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Language</p>
                            <p className="uppercase">{show.original_language}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Overview */}
                    <div>
                        <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Overview</p>
                        <ScrollArea className="h-28">
                            <p className="pr-2 text-sm leading-relaxed text-foreground/80">{show.overview ?? "No overview available."}</p>
                        </ScrollArea>
                    </div>

                    <Separator />

                    {/* Cast */}
                    {cast.length > 0 && (
                        <div>
                            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Cast</p>
                            <div className="flex flex-wrap gap-2">
                                {cast.map((actor: Cast) => (
                                    <TooltipProvider key={actor.id} delayDuration={200}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <img
                                                    src={TMDB_IMG(actor.profile_path, "w92")}
                                                    alt={actor.name}
                                                    className="h-10 w-10 cursor-default rounded-full border border-border object-cover shadow-sm"
                                                    loading="lazy"
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" className="text-xs">
                                                <p className="font-semibold">{actor.name}</p>
                                                <p className="text-muted-foreground">{actor.character}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* OMSS Diagnostics */}
                    {diagnostics.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Source Diagnostics</p>
                                <div className="flex flex-col gap-1">
                                    {diagnostics.map((d, i) => (
                                        <div key={i} className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5 text-xs">
                                            <DiagnosticIcon severity={d.severity} />
                                            <span className="leading-snug text-muted-foreground">{d.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </aside>
    )
}
