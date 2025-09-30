async function searchResults(keyword) {
    // 配置常量
    const MAX_PAGES_TO_FETCH = 2;    // 最多获取几页数据
    const MIN_TOTAL_PAGES = 3;       // 总页数大于此值时开始获取多页

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    };

    const keywordEncode = encodeURIComponent(keyword);
    const firstPageUrl = `https://www.didahd.pro/search/${keywordEncode}----------1---.html`;

    const allResults = []; // 存储所有结果

    try {
        console.log(`🔍 开始搜索: "${keyword}"`);

        // 第一步：获取第一页并解析总页数
        console.log(`📄 请求第一页: ${firstPageUrl}`);
        const firstPageResponse = await fetchv2(firstPageUrl, headers);

        if (!firstPageResponse.ok) {
            throw new Error(`第一页HTTP错误! 状态码: ${firstPageResponse.status}`);
        }

        const firstPageHtml = await firstPageResponse.text();
        console.log(`✅ 第一页获取成功，长度: ${firstPageHtml.length} 字符`);

        // 解析总页数
        const totalPageRegex = /<a class="btn btn-warm">\d+\/(\d+)<\/a>/;
        const match = firstPageHtml.match(totalPageRegex);
        const totalPage = match ? parseInt(match[1], 10) : 1;
        console.log(`📑 搜索结果共 ${totalPage} 页`);

        // 解析第一页的结果
        const firstPageResults = parsePageResults(firstPageHtml);
        allResults.push(...firstPageResults);
        console.log(`📋 第一页找到 ${firstPageResults.length} 个项目`);

        // 第二步：根据总页数决定是否获取第二页
        let pagesToFetch = 1; // 默认只获取第一页

        if (totalPage > MIN_TOTAL_PAGES) {
            pagesToFetch = Math.min(MAX_PAGES_TO_FETCH, totalPage);
            console.log(`🔄 总页数大于 ${MIN_TOTAL_PAGES}，将获取 ${pagesToFetch} 页数据`);

            // 从第二页开始获取（因为第一页已经获取过了）
            for (let currentPage = 2; currentPage <= pagesToFetch; currentPage++) {
                const pageUrl = `https://www.didahd.pro/search/${keywordEncode}----------${currentPage}---.html`;
                console.log(`⏳ 正在获取第 ${currentPage} 页数据...`);

                try {
                    const pageResponse = await fetchv2(pageUrl, headers);

                    if (!pageResponse.ok) {
                        console.warn(`⚠️ 第 ${currentPage} 页HTTP错误: ${pageResponse.status}，跳过此页`);
                        continue;
                    }

                    const pageHtml = await pageResponse.text();
                    const pageResults = parsePageResults(pageHtml);

                    allResults.push(...pageResults);
                    console.log(`✅ 第 ${currentPage} 页获取成功，找到 ${pageResults.length} 个项目`);

                } catch (pageError) {
                    console.error(`❌ 获取第 ${currentPage} 页数据时出错:`, pageError.message);
                    // 继续获取下一页，不中断整个流程
                }
            }
        } else {
            console.log(`ℹ️ 总页数不超过 ${MIN_TOTAL_PAGES}，只获取第一页数据`);
        }

        // 去重处理（避免重复数据）
        const uniqueResults = removeDuplicateResults(allResults);

        console.log(`🎉 搜索完成！总共找到 ${uniqueResults.length} 个不重复项目`);
        console.log(`⚙️ 配置: 总页数阈值=${MIN_TOTAL_PAGES}, 最大获取页数=${MAX_PAGES_TO_FETCH}`);

        return JSON.stringify(uniqueResults, null, 2);

    } catch(err) {
        console.error('💥 搜索过程发生错误:', err.message);
        return JSON.stringify([{
            title: "搜索出错: " + err.message,
            image: "https://i.ibb.co/Y4b38sTG/Search-has-no-images.png",
            href: "javascript:void(0)"
        }], null, 2);
    }
}

/**
 * 解析单个页面的HTML内容，提取影片信息
 */
function parsePageResults(htmlText) {
    const pageResults = [];

    const liRegex = /<li class="clearfix">([\s\S]*?)<\/li>/g;
    let liMatch;

    while ((liMatch = liRegex.exec(htmlText)) !== null) {
        const liContent = liMatch[1];

        // 主要匹配模式：精确匹配目标元素
        const titleMatch = liContent.match(/<a[^>]*class="[^"]*myui-vodlist__thumb[^"]*"[^>]*href="([^"]*)"[^>]*title="([^"]*)"[^>]*data-original="([^"]*)"[^>]*>/);

        if (titleMatch) {
            const href = titleMatch[1];
            const title = titleMatch[2].trim();
            const image = titleMatch[3].trim();

            if (title && href && image) {
                pageResults.push({
                    title: title,
                    image: image.startsWith('http') ? image : `https:${image}`,
                    href: href.startsWith('http') ? href : `https://www.didahd.pro${href}`
                });
            }
        } else {
            // 备用匹配模式
            const fallbackMatch = liContent.match(/<a[^>]*href="([^"]*)"[^>]*title="([^"]*)"[^>]*data-original="([^"]*)"/);
            if (fallbackMatch) {
                const href = fallbackMatch[1];
                const title = fallbackMatch[2].trim();
                const image = fallbackMatch[3].trim();

                if (title && href && image) {
                    pageResults.push({
                        title: title,
                        image: image.startsWith('http') ? image : `https:${image}`,
                        href: href.startsWith('http') ? href : `https://www.didahd.pro${href}`
                    });
                }
            }
        }
    }

    return pageResults;
}

/**
 * 去除重复的结果（基于标题和链接）
 */
function removeDuplicateResults(results) {
    const seen = new Set();
    return results.filter(item => {
        const identifier = `${item.title}|${item.href}`;
        if (seen.has(identifier)) {
            return false;
        }
        seen.add(identifier);
        return true;
    });
}

// searchResults("战酋").then(console.log);
// [
//   {
//     "title": "战酋",
//     "image": "https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2921792970.webp",
//     "href": "https://www.didahd.pro/detail/2035.html"
//   }
// ]


async function extractDetails(url) {
    const header = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    };
    // console.log("🔍 开始提取详情，目标URL:", url);
    const response = await fetchv2(url, header);
    // console.log("✅ 页面请求成功，状态码:", response.status);
    const html = await response.text();
    // console.log("📄 获取到HTML内容，长度:", html.length, "字符");
    // console.log("🔍 开始解析HTML内容", html);

    // 提取又名
    const aliasMatch = html.match(/又名：<\/span>[\s\S]*?<span>([^<]+)<\/span>/);
    const alias = aliasMatch ? aliasMatch[1].trim() : "N/A";

    // 提取剧情简介
    const descriptionMatch = html.match(/<span class="text-muted">剧情简介：<\/span>[\s\S]*?<span>([\s\S]*?)<\/span>\s*<br><br>/);
    const description = descriptionMatch ? descriptionMatch[1].trim() : "No description available.";

    // 提取首播日期（需要根据实际HTML结构调整）
    const airdateMatch = html.match(/年份：<\/span>[\s\S]*?<a[^>]+>([^<]+)<\/a>/i);
    const airdate = airdateMatch ? airdateMatch[1].trim() : "N/A";

    console.log("Description:", description);
    console.log("Airdate:", airdate);

    const details = [{
        alias,
        description,
        airdate
    }];
    return JSON.stringify(details, null, 2);
}

// extractDetails("https://www.didahd.pro/detail/2035.html").then(console.log);
// [
//   {
//     "alias": "战争酋长",
//     "description": "从土著人的角度讲述了夏威夷群岛的统一，这是一个激动人心的、前所未有的故事。一位夏威夷战争首领加入了一场血腥的战役，以团结交战岛屿，使其免受殖民威胁。",
//     "airdate": "2025"
//   }
// ]

async function extractEpisodes(url) {
    const header = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    };

    try {
        const response = await fetchv2(url, header);
        if (!response.ok) throw new Error(`HTTP错误! 状态码: ${response.status}`);

        const html = await response.text();

        // 提取 playlist0 中的剧集列表区域
        const playlistRegex = /<div id="playlist0"[\s\S]*?<ul class="[^"]*sort-list[^"]*"[\s\S]*?<\/ul>/;
        const playlistMatch = html.match(playlistRegex);

        if (!playlistMatch) {
            console.log("❌ 未找到 playlist0 区域");
            return JSON.stringify([], null, 2);
        }

        const playlistHtml = playlistMatch[0];
        const episodes = [];
        const regex = /<a class="btn btn-default"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g;

        let match;
        while ((match = regex.exec(playlistHtml)) !== null) {
            const href = match[1];
            const text = match[2];
            const numberMatch = text.match(/\d+/);

            if (numberMatch) {
                episodes.push({
                    href: `https://www.didahd.pro${href}`,
                    number: parseInt(numberMatch[0], 10)
                });
            }
        }

        episodes.sort((a, b) => a.number - b.number);
        console.log(`📺 从 playlist0 中提取 ${episodes.length} 个剧集`);
        return JSON.stringify(episodes, null, 2);

    } catch (error) {
        console.error("提取剧集失败:", error.message);
        return JSON.stringify([], null, 2);
    }
}

// extractEpisodes("https://www.didahd.pro/detail/2035.html").then(console.log);
// [
//   {
//     "href": "https://www.didahd.pro/play/2035-4-1.html",
//     "number": 1
//   },
//   {
//     "href": "https://www.didahd.pro/play/2035-4-2.html",
//     "number": 2
//   }
// ]



async function extractStreamUrl(url) {
    console.log("🔍 开始提取播放链接，目标URL:", url);
    const header = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    };
    const response = await fetchv2(url, header);
    const html = await response.text();

    // 提取播放链接
    const streamUrlMatch = html.match(/<source src="([^"]+)" type="application\/x-mpegURL">/);
    const streamUrl = streamUrlMatch ? streamUrlMatch[1].trim() : "N/A";

    console.log("播放链接:", streamUrl);
    return JSON.stringify([{ streamUrl }]);
}

