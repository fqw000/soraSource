// 以下为searchResults函数的代码
// 该函数用于搜索关键词并返回结果
//  * 搜索影视作品
//  * @param {string} keyword - 搜索关键词
//  * @returns {Promise<string>} JSON格式的搜索结果
async function searchResults(keyword) {
    const searchUrl = `https://www.hnytxj.com/vod/search/${encodeURIComponent(keyword)}`;
    try {
        const response = await fetchv2(searchUrl);
        const html = await response.text();
        const results = [];

        // 改进的正则表达式，处理标题中可能包含的样式标签
        const regex = /<a href="(\/detail\/\d+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<div class="title">([\s\S]*?)<\/div>/g;
        let match;

        while ((match = regex.exec(html)) !== null) {
            // 确保URL是完整的
            const href = match[1].startsWith('http') ? match[1] : `https://www.hnytxj.com${match[1]}`;
            
            // 处理图片URL
            const image_formart = mathc[1].replace(/\?[^"]+/g, ");
            const image = image_formart.startsWith('http') ? image_formart : `https://www.hnytxj.com${image_formart}`;
            
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

// // 以下为在页面的colsole中执行的代码，用于测试和调试的代码
// // 更灵活的正则表达式
// const regex = /<a href="(\/detail\/\d+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<div class="title">([\s\S]*?)<\/div>/g;
// // 获取页面HTML内容
// const html = document.documentElement.outerHTML;

// // 存储结果
// const results = [];

// // 执行匹配
// let match;
// while ((match = regex.exec(html)) !== null) {
//             // 确保URL是完整的
//             const href = match[1].startsWith('http') ? match[1] : `https://www.hnytxj.com${match[1]}`;
            
//             // 处理图片URL（如果有必要）
//             const image = match[2].startsWith('http') ? match[2] : `https://www.hnytxj.com${match[2]}`;
            
//             // 提取标题（优先使用alt属性，如果没有则使用标题div）
//             const title = match[3] || match[4];
            
//             // 清理标题中的HTML标签（特别是<span style>标签）
//             title_cleand = title.replace(/<span[^>]*>|<\/span>/g, '').trim();
            
//             results.push({
//                 title: title_cleand.trim(),
//                 image: image.trim(),
//                 href: href.trim()
//             });
//         }

// // 输出结果到控制台
// console.log("匹配到的文章数量:", results.length);
// console.table(results);


// 以下为extractDetails函数的代码
// 该函数用于提取影视详情信息
//  * 提取影视详情信息
//  * @param {string} url - 详情页URL
//  * @returns {Promise<string>} JSON格式的详情信息
async function extractDetails(url) {
    try {
        const response = await fetchv2(url);
        const html = await response.text();
        
        // 别名提取
        const aliasMatch = html.match(/别名:<\/div>([\s\S]*?)<\/div>/);
        let alias = "N/A";
        if (aliasMatch) {
            alias = aliasMatch[1]
                .replace(/<a href="\/vod\/search\/[^"]+">([^<]+)<\/a>/g, '$1')
                .replace(/\s+/g, ' ')
                .trim();
        }

        // 简介提取
        const descriptionMatch = html.match(/<div class="jiantou"><\/div><\/label>\s*([\s\S]*?)<\/div>/);
        const description = descriptionMatch ? descriptionMatch[1].trim() : "No description available.";

        // 上映日期提取
        const airdateMatch = html.match(/<div class="item-top">(\d+-\d+-\d+)<\/div>/);
        const airdate = airdateMatch ? airdateMatch[1].trim() : "N/A";

        const details = [{
            alias,
            description,
            airdate
        }];

        console.log(JSON.stringify(details));
        return JSON.stringify(details);
    } catch (error) {
        console.error("提取详情出错:", error);
        return JSON.stringify([{
            alias: "N/A",
            description: "获取详情失败",
            airdate: "N/A"
        }]);
    }
}

// 以下为在页面的colsole中执行的代码，用于测试和调试的代码
// 获取页面HTML内容
// const html = document.documentElement.outerHTML;
// const results = [];

// // 别名提取
// const aliasMatch = html.match(/别名:<\/div>([\s\S]*?)<\/div>/);
// let alias = "N/A";
// if (aliasMatch) {
//     alias = aliasMatch[1]
//         .replace(/<a href="\/vod\/search\/[^"]+">([^<]+)<\/a>/g, '$1 || ')
//         .replace(/\s+/g, ' ')
//         .trim();
// }

// // 简介提取 - 修正正则表达式
// const descriptionMatch = html.match(/<div class="jiantou"><\/div><\/label>\s*([\s\S]*?)<\/div>/);
// const description = descriptionMatch ? descriptionMatch[1].trim() : "No description available.";

// // 上映日期提取
// const airdateMatch = html.match(/<div class="item-top">(\d+-\d+-\d+)<\/div>/);
// const airdate = airdateMatch ? airdateMatch[1].trim() : "N/A";

// const details = [{
//     alias,
//     description,
//     airdate
// }];

// console.log("提取的详情信息:");
// console.log(JSON.stringify(details, null, 2));
// console.table(details);




//  以下为extractEpisode函数的代码
//  该函数用于提取剧集信息
//  * 提取剧集信息
//  * @param {string} url - 详情页URL
//  * @returns {Promise<string>} JSON格式的剧集信息
async function extractEpisodes(url) {
    try {
        const response = await fetchv2(url);
        const html = await response.text();
        const episodes = [];

        // 使用正则表达式匹配剧集链接和集数
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
    } catch (error) {
        console.error("提取剧集出错:", error);
        return JSON.stringify([]);
    }
}

// // 以下为在页面的colsole中执行的代码，用于测试和调试的代码
// // 获取页面HTML内容
// // 测试代码 - 直接在浏览器控制台运行
// const html = document.documentElement.outerHTML;
// const episodes = [];

// // 使用正则表达式匹配剧集链接和集数
// const regex = /<div class=" listitem"><a href="(\/vod\/play\/\d+\/sid\/\d+)">(\d+)<\/a><\/div>/g;

// let match;
// while ((match = regex.exec(html)) !== null) {
//     const href = match[1].startsWith('http') ? match[1] : `https://www.hnytxj.com${match[1]}`;
//     const episodeNumber = parseInt(match[2], 10);
    
//     episodes.push({
//         href: href.trim(),
//         number: episodeNumber
//     });
// }

// console.log("提取到的剧集数量:", episodes.length);
// console.table(episodes);

async function extractStreamUrl(url) {
    return url;
}
