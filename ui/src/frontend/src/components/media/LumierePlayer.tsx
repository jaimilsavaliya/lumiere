import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Artplayer from "artplayer";
import Hls from "hls.js";
import type { Source, Subtitle } from "@omss/sdk";
import MathCurveLoader from "./MathCurveLoader";

interface LumierePlayerProps {
    sources: Source[];
    subtitles: Subtitle[];
}

export default function LumierePlayer({ sources, subtitles }: LumierePlayerProps) {
    const artRef = useRef<HTMLDivElement>(null);
    const playerInstance = useRef<Artplayer | null>(null);

    // Sort sources: Quality-based with VidSrc priority boost for reliability
    const sortedSources = useMemo(() => {
        const getScore = (source: Source) => {
            let score = 0;
            const q = source.quality.toLowerCase();
            
            // Base resolution score
            if (q.includes("4k") || q.includes("2160")) score += 2160;
            else if (q === "auto") score += 2000;
            else {
                const match = q.match(/\d+/);
                if (match) score += parseInt(match[0], 10);
            }

            // Provider Priority: VidSrc is marked as highly reliable
            if (source.provider.name.toLowerCase().includes("vidsrc")) {
                score += 5000; 
            }

            return score;
        };

        return [...sources].sort((a, b) => getScore(b) - getScore(a));
    }, [sources]);

    const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
    const [loadingContainer, setLoadingContainer] = useState<HTMLElement | null>(null);

    // Reset index when sources change
    useEffect(() => {
        setCurrentSourceIndex(0);
    }, [sources]);

    const currentSource = useMemo(() => sortedSources[currentSourceIndex] || null, [sortedSources, currentSourceIndex]);

    useEffect(() => {
        if (!artRef.current || !currentSource) return;

        // Initialize Artplayer
        const art = new Artplayer({
            container: artRef.current,
            url: currentSource.url,
            type: currentSource.type === "hls" || currentSource.url.includes(".m3u8") ? "m3u8" : "mp4",
            customType: {
                m3u8: function (video: HTMLMediaElement, url: string) {
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        
                        // Catch internal HLS errors (like 404s) and trigger fallback
                        hls.on(Hls.Events.ERROR, function (_event, data) {
                            if (data.fatal) {
                                switch (data.type) {
                                    case Hls.ErrorTypes.NETWORK_ERROR:
                                        console.error("[LumierePlayer] Fatal network error encountered, triggering fallback");
                                        hls.destroy();
                                        art.emit('video:error');
                                        break;
                                    case Hls.ErrorTypes.MEDIA_ERROR:
                                        console.warn("[LumierePlayer] Fatal media error encountered, trying to recover");
                                        hls.recoverMediaError();
                                        break;
                                    default:
                                        console.error("[LumierePlayer] Unrecoverable fatal error, triggering fallback");
                                        hls.destroy();
                                        art.emit('video:error');
                                        break;
                                }
                            }
                        });
                        
                        art.on('destroy', () => hls.destroy());
                    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = url;
                    }
                },
            },
            theme: "#F59E0B",
            volume: 0.7,
            autoplay: true,
            pip: true,
            screenshot: true,
            setting: true,
            loop: false,
            playbackRate: true,
            aspectRatio: true,
            fullscreen: true,
            fullscreenWeb: true,
            subtitleOffset: true,
            miniProgressBar: true,
            mutex: true,
            backdrop: true,
            playsInline: true,
            autoPlayback: true,
            airplay: true,
            moreVideoAttr: {
                crossOrigin: "anonymous",
            },
            quality: sortedSources.map((s, index) => ({
                default: index === currentSourceIndex,
                html: `${s.quality} - ${s.provider.name}`,
                url: s.url,
                index: index 
            })),
            subtitle: {
                url: subtitles[0]?.url || "",
                type: "vtt",
                escape: false, // Don't escape HTML tags (fix visual issue)
                style: {
                    color: "#F59E0B",
                    fontSize: "24px",
                },
            },
            icons: {
                loading: '<div id="lumiere-math-loader"></div>',
            },
        }, (art) => {
            // Explicitly hide subtitles on load
            art.subtitle.show = false;
        });

        // Get reference to the loading container
        if (art.template.$loading) {
            setLoadingContainer(art.template.$loading);
        }

        // Handle quality changes (source changes)
        art.on('setting', () => {
            const currentUrl = art.url;
            const newIndex = sortedSources.findIndex(s => s.url === currentUrl);
            if (newIndex !== -1 && newIndex !== currentSourceIndex) {
                setCurrentSourceIndex(newIndex);
            }
        });

        // Auto-try next source on error
        const handleFallback = () => {
            console.error(`[LumierePlayer] Source ${currentSourceIndex} failed or timed out, trying next...`);
            if (currentSourceIndex < sortedSources.length - 1) {
                art.notice.show = "Server unresponsive. Trying next available server...";
                setTimeout(() => {
                    setCurrentSourceIndex(prev => prev + 1);
                }, 1000); // Try next faster
            } else {
                art.notice.show = "All servers failed to load.";
            }
        };

        art.on('video:error', handleFallback);

        // Timeout fallback: if the video doesn't play or load metadata within 10 seconds, skip
        let isLoaded = false;
        
        art.on('video:loadedmetadata', () => {
            isLoaded = true;
        });

        art.on('video:playing', () => {
            isLoaded = true;
        });

        const timeoutId = setTimeout(() => {
            if (!isLoaded && currentSourceIndex < sortedSources.length - 1) {
                console.warn(`[LumierePlayer] Source ${currentSourceIndex} timed out after 10s.`);
                handleFallback();
            }
        }, 10000);

        playerInstance.current = art;

        return () => {
            clearTimeout(timeoutId);
            if (playerInstance.current) {
                playerInstance.current.destroy();
                playerInstance.current = null;
            }
        };
    }, [currentSource, sortedSources, subtitles]);

    // Handle initial source availability
    if (sortedSources.length === 0) {
        return (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl bg-muted/5 border-2 border-dashed border-muted/30">
                <p className="text-muted-foreground text-sm">No video sources found</p>
            </div>
        );
    }

    return (
        <div className="group relative">
            <div 
                ref={artRef} 
                className="aspect-video w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
                style={{ backgroundColor: "#000" }}
            />
            
            {/* Inject the math loader via portal when Artplayer shows its loading container */}
            {loadingContainer && createPortal(<MathCurveLoader />, loadingContainer)}
        </div>
    );
}
