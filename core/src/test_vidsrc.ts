import { VidSrcProvider } from './providers/vidsrc/vidsrc.js';
import { VidSrcMeProvider } from './providers/vidsrcme/vidsrcme.js';

async function testProvider(ProviderClass: any, name: string) {
    console.log(`\n--- Testing ${name} Provider ---`);
    
    const mockServer: any = {
        getRegistry: () => ({}),
        createProxyUrl: (url: string, headers: any) => {
            return `http://localhost/v1/proxy?data=${encodeURIComponent(JSON.stringify({ url, headers }))}`;
        }
    };

    const provider = new ProviderClass(mockServer);

    const media: any = {
        type: 'series',
        tmdbId: '76479', // The Boys
        title: 'The Boys',
        s: 2,
        e: 1
    };

    console.log(`Fetching sources for: ${media.title} (TMDB: ${media.tmdbId} S${media.s} E${media.e})...`);
    
    try {
        const result = await provider.getTVSources(media);
        
        if (result.sources && result.sources.length > 0) {
            console.log(`✅ ${name} Success! Found ${result.sources.length} sources:`);
            result.sources.slice(0, 3).forEach((s: any, i: number) => {
                console.log(`[${i}] Quality: ${s.quality} | Provider: ${s.provider.name}`);
                console.log(`    URL: ${s.url.substring(0, 80)}...`);
            });
        } else {
            console.error(`❌ ${name} No sources found.`);
            console.error('Diagnostics:', JSON.stringify(result.diagnostics, null, 2));
        }
    } catch (error) {
        console.error(`❌ ${name} Test crashed with error:`, error);
    }
}

async function runTests() {
    await testProvider(VidSrcProvider, 'VidSrc');
    await testProvider(VidSrcMeProvider, 'VidSrcMe');
}

runTests();
