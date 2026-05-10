import { BaseProvider } from '@omss/framework';
import type {
    ProviderCapabilities,
    ProviderMediaObject,
    ProviderResult,
    Source
} from '@omss/framework';

export class VidSrcMeProvider extends BaseProvider {
    readonly id = 'vidsrcme';
    readonly name = 'VidSrcMe';
    readonly enabled = true;
    readonly BASE_URL = 'https://vidsrcme.ru';
    readonly HEADERS = {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150 Safari/537.36',
        Referer: this.BASE_URL
    };

    readonly capabilities: ProviderCapabilities = {
        supportedContentTypes: ['movies', 'tv']
    };

    async getMovieSources(media: ProviderMediaObject): Promise<ProviderResult> {
        return this.getSources(media);
    }

    async getTVSources(media: ProviderMediaObject): Promise<ProviderResult> {
        return this.getSources(media);
    }

    private async getSources(
        media: ProviderMediaObject
    ): Promise<ProviderResult> {
        try {
            const pageUrl = media.type === 'movie' 
                ? `${this.BASE_URL}/embed/movie/${media.tmdbId}`
                : `${this.BASE_URL}/embed/tv/${media.tmdbId}/${media.s}/${media.e}`;

            const response = await fetch(pageUrl, { headers: this.HEADERS });
            if (!response.ok) return this.emptyResult('Failed to fetch embed page', media);
            
            const html = await response.text();
            
            // VidSrcMe often uses a more direct approach or embeds another well-known provider
            // For now, we'll try to extract the most common HLS pattern found on these mirrors
            const m3u8Match = html.match(/file["']?\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
            
            if (!m3u8Match) {
                return this.emptyResult('No direct HLS stream found. This mirror might require deeper browser emulation.', media);
            }

            const streamUrl = m3u8Match[1];
            const sources: Source[] = [{
                url: this.createProxyUrl(streamUrl, {
                    ...this.HEADERS,
                    Referer: this.BASE_URL
                }),
                type: 'hls',
                quality: 'Auto',
                audioTracks: [
                    {
                        label: 'English',
                        language: 'eng'
                    }
                ],
                provider: {
                    id: this.id,
                    name: this.name
                }
            }];

            return {
                sources,
                subtitles: [],
                diagnostics: []
            };
        } catch (error) {
            return this.emptyResult(error instanceof Error ? error.message : 'Unknown error', media);
        }
    }

    private emptyResult(message: string, media: ProviderMediaObject): ProviderResult {
        return {
            sources: [],
            subtitles: [],
            diagnostics: [{
                code: 'PROVIDER_ERROR',
                message: `${this.name}: ${message}`,
                field: '',
                severity: 'error'
            }]
        };
    }
}
