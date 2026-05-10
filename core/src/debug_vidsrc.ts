import { VidSrcProvider } from './providers/vidsrc/vidsrc.js';

async function run() {
    const mockServer: any = {
        getRegistry: () => ({}),
        createProxyUrl: (url: string, headers: any) => url
    };
    const provider = new VidSrcProvider(mockServer) as any;
    
    const media: any = {
        type: 'series',
        tmdbId: '76479',
        s: 2,
        e: 1
    };

    const pageUrl = provider.buildPageUrl(media);
    console.log('pageUrl:', pageUrl);

    const html = await provider.fetchPage(pageUrl, media);
    if (!html) return console.log('Failed to fetch pageUrl');

    const secondUrl = provider.extractSecondUrl(html);
    console.log('secondUrl:', secondUrl);
    if (!secondUrl) return console.log('Failed to extract secondUrl');

    const secondHtml = await provider.fetchPage(secondUrl.url, media);
    if (!secondHtml) return console.log('Failed to fetch secondHtml');
    
    console.log('--- secondHtml ---');
    console.log(secondHtml.substring(0, 1000));
    console.log('...');
    const srcMatch = secondHtml.match(/src[\s:=]+['"]([^'"]+)['"]/ig);
    console.log('All src matches in secondHtml:', srcMatch);

    const thirdUrl = provider.extractThirdUrl(secondHtml, secondUrl.url);
    console.log('thirdUrl:', thirdUrl);
    if (!thirdUrl) return console.log('Failed to extract thirdUrl');

    const thirdHtml = await provider.fetchPage(thirdUrl.url, media);
    const m3u8Urls = provider.extractM3u8Urls(thirdHtml);
    console.log('m3u8Urls:', m3u8Urls);
    
    const fs = await import('fs');
    fs.writeFileSync('debug_output.txt', `pageUrl: ${pageUrl}\nsecondUrl: ${JSON.stringify(secondUrl)}\nthirdUrl: ${JSON.stringify(thirdUrl)}\n\nsecondHtml:\n${secondHtml}\n\nthirdHtml:\n${thirdHtml}\n\nm3u8Urls: ${JSON.stringify(m3u8Urls)}`);
}

run();
