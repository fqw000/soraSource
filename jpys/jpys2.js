async function searchResults(keyword) {
    const header = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'RSC': '1',
        'DNT': '1'
    };
    const searchUrl = `https://hnytxj.com/vod/search/${encodeURIComponent(keyword)}?_rsc=xsbs6`;
    try {
        console.log("🔍 开始搜索硬盘，目标URL:", searchUrl);
        const response = await fetchv2(searchUrl, header);
        console.log("✅ 页面请求成功，状态码:", response.status);
        const html = await response.json();
        console.log("📄 获取到HTML内容，长度:", html.length, "字符");
        
        // 先处理数据，构建结果
        const results = [{
            title: "NULL",
            image: "",
            href: ""
        }];

        // 在返回前抛出调试信息
        const debugInfo = {
            URL: searchUrl,
            HTTP状态码: response.status,
            HTML长度: html.length,
            响应详情: html,
            处理结果: results
        };
        
        throw new Error(`=== fetchv2 调试信息 ===\n${JSON.stringify(debugInfo, null, 2)}\n============================`);
        
        // return JSON.stringify(results); // 这行不会执行
        
    } catch (err) {
        console.error("Search error:", err);
        return JSON.stringify([{
            title: "搜索出错: " + err.message,
            image: "https://i.ibb.co/Y4b38sTG/Search-has-no-images.png",
            href: "javascript:void(0)"
        }]);
    }
}
