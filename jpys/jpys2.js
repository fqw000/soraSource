async function searchResults(keyword) {
    const header = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'RSC': '1',
        'DNT': '1'
    };
    const searchUrl = `https://hnytxj.com/vod/search/${encodeURIComponent(keyword)}?_rsc=xsbs6`;
    
    // 第一步：只测试 fetchv2，查看response
    const response = await fetchv2(searchUrl, header);
    throw new Error(`🔍 第一步 - 响应对象详情:
URL: ${searchUrl}
状态码: ${response.status}
OK状态: ${response.ok}
是否有Body: ${!!response.body}
响应对象Keys: ${Object.keys(response).join(', ')}
响应体：${JSON.stringify(response)}
============================`);
}

// 单独运行这个来测试 response
// searchResults("测试").then(console.log).catch(console.error);
