// pages/TVPage.tsx
import { useParams, useSearchParams } from "react-router-dom"
import { useTmdb } from "@/components/providers/tmdb-provider.tsx"
import { useOmss } from "@/components/providers/omss-provider.tsx"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { TVSeriesDetails, TVSeason, TVSeriesResultItem, TVDetailsWithAppends } from "@lorenzopant/tmdb"
import type { Source, Subtitle, Diagnostic } from "@omss/sdk"
import { TVMain } from "@/pages/watch/TVMain"
import { TVDetails } from "@/pages/watch/TVDetails"

export default function TVPage() {
    const { id } = useParams<{ id: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    
    const tmdb = useTmdb()
    const omss = useOmss()

    const [show, setShow] = useState<TVDetailsWithAppends<["credits", "similar", "recommendations"]> | null>(null)
    const [loading, setLoading] = useState(true)

    const [season, setSeason] = useState<TVSeason | null>(null)
    const [currentS, setCurrentS] = useState(Number(searchParams.get("s") || 1))
    const [currentE, setCurrentE] = useState(Number(searchParams.get("e") || 1))

    const [sources, setSources] = useState<Source[]>([])
    const [subtitles, setSubtitles] = useState<Subtitle[]>([])
    const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([])
    const [sourcesLoading, setSourcesLoading] = useState(true)

    // Fetch TV show details
    useEffect(() => {
        if (!id) return
        setLoading(true)
        tmdb.tv_series
            .details({
                series_id: parseInt(id),
                language: "en-US",
                append_to_response: ["credits", "similar", "recommendations"],
            })
            .then((data) => setShow(data as TVDetailsWithAppends<["credits", "similar", "recommendations"]>))
            .catch((err) =>
                toast.error("Failed to load show details.", {
                    description: err instanceof Error ? err.message : String(err),
                })
            )
            .finally(() => setLoading(false))
    }, [id, tmdb])

    // Fetch Season details
    useEffect(() => {
        if (!id || !currentS) return
        tmdb.tv_seasons
            .details({
                series_id: parseInt(id),
                season_number: currentS,
                language: "en-US",
            })
            .then(setSeason)
            .catch(console.error)
    }, [id, currentS, tmdb])

    // Fetch OMSS streaming sources for the selected episode
    useEffect(() => {
        if (!id) return
        setSourcesLoading(true)
        setSources([])
        
        omss.getTvEpisode(id, currentS, currentE)
            .then(({ data, error }) => {
                if (error || !data) {
                    if (error) console.error("OMSS Error:", error)
                    return
                }
                setSources(data.sources)
                setSubtitles(data.subtitles ?? [])
                setDiagnostics(data.diagnostics ?? [])
            })
            .catch(console.error)
            .finally(() => setSourcesLoading(false))
            
        // Update URL
        setSearchParams({ s: String(currentS), e: String(currentE) }, { replace: true })
    }, [id, currentS, currentE, omss, setSearchParams])

    const handleEpisodeChange = (s: number, e: number) => {
        setCurrentS(s)
        setCurrentE(e)
    }

    const similar = (show?.similar?.results ?? []) as TVSeriesResultItem[]
    const recommendations = (show?.recommendations?.results ?? []) as TVSeriesResultItem[]

    return (
        <div className="flex min-h-screen flex-col gap-6 p-4 md:flex-row md:items-start md:p-8 lg:gap-10">
            {/* Left – player + episode selector + carousels */}
            <TVMain 
                show={show}
                season={season}
                currentS={currentS}
                currentE={currentE}
                onEpisodeChange={handleEpisodeChange}
                sources={sources} 
                subtitles={subtitles} 
                similar={similar} 
                recommendations={recommendations} 
                sourcesLoading={sourcesLoading} 
            />

            {/* Right – poster + metadata */}
            <TVDetails show={show} loading={loading} diagnostics={diagnostics} />
        </div>
    )
}
