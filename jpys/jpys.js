
// 工具函数 - 确保URL为绝对路径
function ensureAbsoluteUrl(url, baseUrl = 'www.hnytxj.com') {
    if (!url || url === 'N/A') return 'N/A';
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}

// 工具函数 - 创建错误响应
function createErrorResponse(errorType, message, additionalData = {}) {
    return JSON.stringify([{
        error: errorType,
        message: message,
        ...additionalData
    }]);
}

// 默认图片URL
const DEFAULT_IMAGE = 'https://i.ibb.co/Y4b38sTG/Search-has-no-images.png';

/**
 * 搜索影视作品
 * @param {string} keyword - 搜索关键词
 * @returns {Promise<string>} JSON格式的搜索结果
 */
async function searchResults(keyword) {
    const searchUrl = `https://www.hnytxj.com/vod/search/${encodeURIComponent(keyword)}`;
    try {
        const response = await fetchv2(searchUrl);
        if (!response.ok) {
            return createErrorResponse('搜索失败', `HTTP错误: ${response.status}`, { status: response.status });
        }
        
        const html = await response.text();
        const results = [];

        const articleRegex = /<a href="(\/detail\/\d+)">[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<div class="title"><span><span[^>]*>([^<]+)<\/span><\/span><\/div>/g;
        let match;

        while ((match = articleRegex.exec(html)) !== null) {
            const href = ensureAbsoluteUrl(match[1].trim());
            const title = match[3].trim();
            let image = match[2].trim();
            
            // 处理图片URL
            if (!image || image === '#' || image.includes('placeholder')) {
                image = DEFAULT_IMAGE;
            } else {
                image = ensureAbsoluteUrl(image);
            }

            results.push({
                title,
                image,
                href
            });
        }

        return JSON.stringify(results);
    } catch (error) {
        return createErrorResponse('搜索失败', error.message, { keyword });
    }
}

/**
 * 提取影视详情信息
 * @param {string} url - 详情页URL
 * @returns {Promise<string>} JSON格式的详情信息
 */
async function extractDetails(url) {
    try {
        const response = await fetchv2(url);
        if (!response.ok) {
            return createErrorResponse('详情提取失败', `HTTP错误: ${response.status}`, { status: response.status, url });
        }
        
        const html = await response.text();
        
        // 初始化详情对象默认值
        const details = {
            title: '未知标题',
            alias: 'N/A',
            directors: [],
            actors: [],
            genres: [],
            score: 'N/A',
            airdate: 'N/A',
            duration: 'N/A',
            language: 'N/A',
            description: '暂无简介',
            playUrl: 'N/A',
            episodes: [],
            image: DEFAULT_IMAGE
        };

        // 提取标题
        const titleMatch = html.match(/<h1 class="title">([^<]+)<\/h1>/);
        if (titleMatch) details.title = titleMatch[1].trim();

        // 提取别名
        const aliasMatch = html.match(/<div class="name">别名:<\/div>\s*<a[^>]*>([^<]+)<\/a>/);
        if (aliasMatch) details.alias = aliasMatch[1].trim();

        // 提取导演
        const directorSection = html.match(/<div class="name">导演:<\/div>([\s\S]*?)<\/div>/);
        if (directorSection) {
            const directorMatches = directorSection[1].match(/<a[^>]*>([^<]+)<\/a>/g);
            if (directorMatches) {
                directorMatches.forEach(match => {
                    const name = match.replace(/<[^>]*>/g, '').trim();
                    if (name) details.directors.push(name);
                });
            }
        }

        // 提取主演
        const actorSection = html.match(/<div class="name">主演:<\/div>([\s\S]*?)<\/div>/);
        if (actorSection) {
            const actorMatches = actorSection[1].match(/<a[^>]*>([^<]+)<\/a>/g);
            if (actorMatches) {
                actorMatches.forEach(match => {
                    const name = match.replace(/<[^>]*>/g, '').trim();
                    if (name) details.actors.push(name);
                });
            }
        }

        // 提取类型
        const tagsSection = html.match(/<div class="tags">([\s\S]*?)<\/div>/);
        if (tagsSection) {
            const tagMatches = tagsSection[1].match(/<a[^>]*>([^<]+)<\/a>/g);
            if (tagMatches) {
                tagMatches.forEach(match => {
                    const genre = match.replace(/<[^>]*>/g, '').trim();
                    if (genre) details.genres.push(genre);
                });
            }
        }

        // 提取评分
        const scoreMatch = html.match(/<div class="score[^"]*">([^<]+)<\/div>/);
        if (scoreMatch) details.score = scoreMatch[1].trim();

        // 提取上映时间
        const dateMatch = html.match(/<div class="item-top">(\d{4}-\d{2}-\d{2})<\/div>/);
        if (dateMatch) details.airdate = dateMatch[1].trim();

        // 提取片长
        const durationMatch = html.match(/<div class="item-top">([^<]*\d+分\d*秒?[^<]*)<\/div>/);
        if (durationMatch) details.duration = durationMatch[1].trim();

        // 提取语言
        const languageMatch = html.match(/<div class="item-top">([^<]*语[^<]*)<\/div>/);
        if (languageMatch) details.language = languageMatch[1].trim();

        // 提取简介
        const introMatch = html.match(/<div class="intro">[\s\S]*?<div class="wrapper_more_text">([\s\S]*?)<\/div>/);
        if (introMatch) {
            details.description = introMatch[1]
                .replace(/<[^>]*>/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        // 提取播放链接
        const playLinkMatch = html.match(/<a href="(\/vod\/play\/[^"]+)">[\s\S]*?立即播放<\/a>/);
        if (playLinkMatch) details.playUrl = ensureAbsoluteUrl(playLinkMatch[1]);

        // 提取剧集列表
        const episodeRegex = /<a href="(\/vod\/play\/\d+\/sid\/\d+)">(\d+)<\/a>/g;
        let episodeMatch;
        const seenEpisodes = new Set();
        
        while ((episodeMatch = episodeRegex.exec(html)) !== null) {
            const episodeUrl = ensureAbsoluteUrl(episodeMatch[1]);
            const episodeNumber = parseInt(episodeMatch[2], 10);
            
            // 去重处理
            if (!seenEpisodes.has(episodeUrl)) {
                seenEpisodes.add(episodeUrl);
                details.episodes.push({
                    number: episodeNumber,
                    url: episodeUrl,
                    title: `第${episodeNumber}集`
                });
            }
        }

        // 按剧集编号排序
        details.episodes.sort((a, b) => a.number - b.number);

        // 提取封面图片
        const imageMatch = html.match(/<img[^>]*src="([^"]*upload[^"]*\.(webp|jpg|jpeg|png))"[^>]*>/i);
        if (imageMatch) details.image = ensureAbsoluteUrl(imageMatch[1]);

        return JSON.stringify([details]);
        
    } catch (error) {
        return createErrorResponse('详情提取失败', error.message, { url });
    }
}

/**
 * 提取剧集列表
 * @param {string} url - 详情页URL
 * @returns {Promise<string>} JSON格式的剧集列表
 */
async function extractEpisodes(url) {
    try {
        const response = await fetchv2(url);
        if (!response.ok) {
            return createErrorResponse('剧集提取失败', `HTTP错误: ${response.status}`, { status: response.status, url });
        }
        
        const html = await response.text();
        const episodes = [];
        const seenUrls = new Set();

        // 提取剧集链接
        const episodeRegex = /<a href="(\/vod\/play\/\d+\/sid\/\d+)">(\d+)<\/a>/g;
        let match;
        
        while ((match = episodeRegex.exec(html)) !== null) {
            const episodeUrl = ensureAbsoluteUrl(match[1]);
            const episodeNumber = parseInt(match[2], 10);
            
            // 去重处理
            if (!seenUrls.has(episodeUrl)) {
                seenUrls.add(episodeUrl);
                episodes.push({
                    href: episodeUrl,
                    number: episodeNumber,
                    title: `第${episodeNumber}集`
                });
            }
        }

        // 按剧集编号排序
        episodes.sort((a, b) => a.number - b.number);

        // 如果没有找到剧集，返回空数组而不是错误
        return JSON.stringify(episodes);
        
    } catch (error) {
        return createErrorResponse('剧集提取失败', error.message, { url });
    }
}

/**
 * 提取流媒体URL（目前直接返回输入URL）
 * @param {string} url - 输入URL
 * @returns {Promise<string>} 处理后的URL
 */
async function extractStreamUrl(url) {
    try {
        // 这里可以添加URL验证或处理逻辑
        return ensureAbsoluteUrl(url);
    } catch (error) {
        return createErrorResponse('流媒体URL处理失败', error.message, { url });
    }
}
