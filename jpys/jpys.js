async function searchResults(keyword) {
    const header = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Referer': 'https://www.hnytxj.com',
    'Accept-Language': 'zh-CN,zh;q=0.9'
    };
    const searchUrl = `https://www.hnytxj.com/vod/search/${encodeURIComponent(keyword)}`;
    try {
        const response = await fetchv2(searchUrl, header);
        const html = await response.text();
        const results = [];

        // 改进的正则表达式，处理标题中可能包含的样式标签
        const regex = /<a href="(\/detail\/\d+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<div class="title">([\s\S]*?)<\/div>/g;
        let match;

        while ((match = regex.exec(html)) !== null) {
            // 确保URL是完整的
            const href = match[1].startsWith('http') ? match[1] : `https://www.hnytxj.com${match[1]}`;
            
            // 处理图片URL
            const image_format = match[2].replace(/\?.*$/, '');
            const image = image_format.startsWith('http') ? image_format : `https://www.hnytxj.com${image_format}`;
            
            // 提取标题 - 需要清理HTML标签
            let title = match[3] || match[4];
            
            // 清理标题中的HTML标签（特别是<span style>标签）
            const title_cleaned = title.replace(/<span[^>]*>|<\/span>/g, '').trim();
            
            results.push({
                title: title_cleaned.trim(),
                image: image.trim(),
                href: href.trim()
            });
        }

        console.log(results);
        return JSON.stringify(results);
    } catch (err) {
        console.error("Search error:", err);
        return JSON.stringify([{
            title: "搜索出错: " + err.message,
            image: "https://i.ibb.co/Y4b38sTG/Search-has-no-images.png",
            href: "javascript:void(0)"
        }]);
    }
}

async function extractDetails(url) {
    const header = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9'
    };
    console.log{"url:", url};
    const response = await fetchv2(url, header);
    const html = await response.text();

    const aliasMatch = html.match(/别名:<\/div>([\s\S]*?)<\/div>/);
    let alias = "N/A";
    if (aliasMatch) {
        alias = aliasMatch[1]
            .replace(/<a href="\/vod\/search\/[^"]+">([^<]+)<\/a>/g, '$1 || ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    const descriptionMatch = html.match(/<div class="jiantou"><\/div><\/label>\s*([\s\S]*?)<\/div>/);
    const airdateMatch = html.match(/<div class="item-top">(\d+-\d+-\d+)<\/div>/);

    const description = descriptionMatch ? descriptionMatch[1].trim() : "No description available.";
    const airdate = airdateMatch ? airdateMatch[1].trim() : "N/A";

    const details = [{
        alias,
        description,
        airdate
    }];

    console.log(JSON.stringify(details));
    return JSON.stringify(details);
}

async function extractEpisodes(url) {
    const header = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9'
    };
    console.log{"url:", url};
    const response = await fetchv2(url, header);
    const html = await response.text();
    console.log(html);
    const episodes = [];

    const regex = /<div class=" listitem"><a href="(\/vod\/play\/\d+\/sid\/\d+)">(\d+)<\/a><\/div>/g;
            
            let match;
            while ((match = regex.exec(html)) !== null) {
                const href = match[1].startsWith('http') ? match[1] : `https://www.hnytxj.com${match[1]}`;
                const episodeNumber = parseInt(match[2], 10);
                
                episodes.push({
                    href: href.trim(),
                    number: episodeNumber
                });
            }

    console.log(episodes);
    return JSON.stringify(episodes);
}


async function extractStreamUrl(url) {
    return url;
}
