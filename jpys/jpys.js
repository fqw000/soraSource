
async function searchResults(keyword) {
    const header = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Referer': 'https://www.hnytxj.com',
    'Accept-Language': 'zh-CN,zh;q=0.9'
    };
    const searchUrl = `https://www.hnytxj.com/vod/search/${encodeURIComponent(keyword)}`;
    try {
        console.log("🔍 开始搜索硬盘，目标URL:", searchUrl);
        const response = await fetchv2(searchUrl, header);
        console.log("✅ 页面请求成功，状态码:", response.status);
        const html = await response.text();
        console.log("📄 获取到HTML内容，长度:", html.length, "字符");

        const results = [];

        // 改进的正则表达式，处理标题中可能包含的样式标签
        const regex = /<a href="(\/detail\/\d+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<div class="title">([\s\S]*?)<\/div>/g;
        let match;

        while ((match = regex.exec(html)) !== null) {
            // 确保URL是完整的
            const href = match[1].startsWith('http') ? match[1] : `https://www.hnytxj.com${match[1]}`;
            
            // 处理图片
            const image_format = match[2].replace(/\?.*$/, '');
            const image = image_format.startsWith('http') ? image_format : `https://www.hnytxj.com${image_format}`;
            
            // 提取标题 - 需要清理HTML标签
            let title = match[3]
            
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
        'Accept-Language': 'zh-CN,zh;q=0.9',
        // 'Referer': searchUrl  // ✅ 使用搜索页URL
    };
    console.log("🔍 开始提取详情，目标URL:", url);
    const response = await fetchv2(url, header);
    console.log("✅ 页面请求成功，状态码:", response.status);
    const html = await response.text();
    console.log("📄 获取到HTML内容，长度:", html.length, "字符");

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

    console.log("🔍 开始提取剧集，目标URL:", url);

    const SCRAPINGBEE_API_KEY = 'DCRBF5EH2699UPEQUXDGL0YYE57TNFGT411LY957EX7JUROJF4JWQ7XTWEJ37JKDQ8C5OKGKGKHZ40G7';

    const api_url = `https://app.scrapingbee.com/api/v1/?api_key=${SCRAPINGBEE_API_KEY}&url=${encodeURIComponent(url)}&render_js=true&wait_for=.listitem`;

    const response = await fetchv2(api_url);
    console.log("✅ 页面请求成功，状态码:", response.status);
    const html = await response.text();
    console.log("📄 获取到HTML内容，长度:", html.length, "字符");
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
  // 使用Node.js内置的加密模块
  const crypto = require('crypto');
  
  // 从URL中解析出 pid 和 nid
  const parts = url.split('/');
  const pid = parts[5];
  const nid = parts[7];
  
  const t = new Date().getTime();
  
  // 构建签名所需的字符串
  const signkey = 'clientType=1&id=' + pid + '&nid=' + nid + '&key=cb808529bae6b6be45ecfab29a4889bc&t=' + t;
  console.log("📝 生成签名字符串:", signkey);
  
  // 使用MD5和SHA1生成签名
  const md5Hash = crypto.createHash('md5').update(signkey).digest('hex');
  console.log("🔐 生成MD5哈希:", md5Hash);
  const sign = crypto.createHash('sha1').update(md5Hash).digest('hex');
  console.log("🔐 生成签名:", sign);
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'deviceid': '63ffad23-a598-4f96-85d7-7bf5f3e4a0a2',
    'sign': sign,
    't': t.toString()
  };

  const apiUrl = 'https://m.sunnafh.com/api/mw-movie/anonymous/v2/video/episode/url?clientType=1&id=' + pid + '&nid=' + nid;
  console.log("🔗 请求API URL:", apiUrl);

  let json_data;
  try {
    const response = await fetch(apiUrl, { headers: headers });
    json_data = await response.json();
  } catch (e) {
    // 捕获请求或解析错误
    return 'Error: ' + e.message;
  }
  
  console.log("📦 API响应数据:", JSON.stringify(json_data));
  // 检查数据是否有效
  if (!json_data || !json_data.data || !json_data.data.list || json_data.data.list.length === 0) {
    return 'Error: Invalid API response or no stream URL found.';
  }

  const link = json_data.data.list[0].url;
  console.log("🔗 提取的流链接:", link);
  return link;
}

// searchResults("战").then(console.log);
// extractDetails("https://www.hnytxj.com/detail/107070").then(console.log);
//  extractEpisodes("https://www.hnytxj.com/detail/107070").then(console.log);
// extractStreamUrl("https://hnytxj.com/vod/play/139191/sid/1231007").then(console.log);
