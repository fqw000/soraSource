async function searchResults(keyword) {
    const header = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'RSC': '1',
        'DNT': '1'
    };
    const searchUrl = `https://hnytxj.com/vod/search/${encodeURIComponent(keyword)}?_rsc=xsbs6`;
    
    // 测试 fetchv2
    const response = await fetchv2(searchUrl, header).catch(error => {
        throw new Error(`🚨 FETCHV2_ERROR: ${error.message} | 值： ${response}`);
    });
    
    // 测试 response.json()
    const html = await response.json().catch(error => {
        throw new Error(`🚨 JSON_PARSE_ERROR: ${error.message} | Status: ${response.status}`| 值： ${html});
    });
    
    // 成功
    throw new Error(`✅ SUCCESS: 数据长度 ${html.length}`);
}
