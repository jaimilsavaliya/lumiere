import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

const TARGET_PROVIDERS = [
    { id: 8, name: "Netflix" },
    { id: 9, name: "Amazon Prime Video" },
    { id: 337, name: "Disney+" },
    { id: 350, name: "Apple TV+" },
    { id: 15, name: "Hulu" },
    { id: 1899, name: "Max" },
    { id: 531, name: "Paramount+" },
    { id: 384, name: "Peacock" },
    { id: 283, name: "Crunchyroll" },
]

interface ProviderData {
    provider_id: number;
    provider_name: string;
    logo_path: string;
}

export default function OTTPlatforms() {
    const [providers, setProviders] = useState<ProviderData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProviders() {
            try {
                const apiKey = import.meta.env.VITE_TMDB_API_KEY;
                const headers: Record<string, string> = {
                    accept: 'application/json'
                }
                
                if (apiKey.length > 50) {
                    headers['Authorization'] = `Bearer ${apiKey}`
                }
                
                const url = apiKey.length > 50 
                    ? 'https://api.themoviedb.org/3/watch/providers/movie?language=en-US&watch_region=US'
                    : `https://api.themoviedb.org/3/watch/providers/movie?language=en-US&watch_region=US&api_key=${apiKey}`;
                
                const res = await fetch(url, { headers })
                if (!res.ok) throw new Error("Failed to fetch")
                
                const data = await res.json()
                const targetIds = TARGET_PROVIDERS.map(p => p.id)
                
                const filtered: ProviderData[] = (data.results || []).filter((p: any) => targetIds.includes(p.provider_id))
                
                // Sort them to match our predefined order
                filtered.sort((a, b) => targetIds.indexOf(a.provider_id) - targetIds.indexOf(b.provider_id))
                
                setProviders(filtered)
            } catch (err) {
                console.error("Failed to fetch OTT platforms:", err)
            } finally {
                setLoading(false)
            }
        }
        
        fetchProviders()
    }, [])

    if (loading) {
        return (
            <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
            </div>
        )
    }

    if (providers.length === 0) return null;

    return (
        <div className="py-4">
            <h2 className="mb-4 text-xl font-bold">Streaming Platforms</h2>
            <div className="no-scrollbar flex w-full gap-5 overflow-x-auto pb-4 pt-2">
                {providers.map((provider, i) => (
                    <motion.div
                        key={provider.provider_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex shrink-0 flex-col items-center gap-2"
                    >
                        <Link 
                            to={`/provider/${provider.provider_id}?name=${encodeURIComponent(provider.provider_name)}`}
                            className="group relative flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl bg-secondary shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 md:h-20 md:w-20"
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w154${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 transition-colors group-hover:ring-white/30" />
                        </Link>
                        <span className="text-xs font-medium text-muted-foreground">{provider.provider_name}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
