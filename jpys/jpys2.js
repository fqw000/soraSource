async function searchResults(keyword) {
    const encodedKeyword = encodeURIComponent(keyword);
    const searchUrl = `https://hnytxj.com/vod/search/${encodedKeyword}?_rsc=xsbs6`;
    const headers = {
        'RSC': '1'
    };
    
    try {
        // 获取搜索结果总页数
        const response = await fetchv2(searchUrl, headers); 
        const json_data = await response.json();
        
        console.log(`response status: ${response.status}`);
        console.log("获取到响应", response);
        console.log("获取到data", json_data);
        
        // 检查响应，可以临时启用：
        throw new Error(`API响应详情: ${JSON.stringify({
            status: '成功',
            code: json_data.code,
            searchUrl: searchUrl,
            fullData: json_data // 完整数据，但可能很长
        }, null, 2)}`);

        return JSON.stringify([{ title: 'NULL', image: '', href: '' }]);
        
    } catch (error) {
        console.error(`❌ 搜索失败:`, error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    return JSON.stringify({
        description: 'NULL',
        aliases: 'Duration: Unknown',
        airdate: 'Aired: Unknown'
    });
}

async function extractEpisodes(url) {
    return JSON.stringify([]);
}

async function extractStreamUrl(url) {
    return JSON.stringify({ streams: [] });
}

// 测试调用
// searchResults("战").then(console.log);
