async function searchResults(keyword) {
    const header = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'RSC': '1',
        'DNT': '1'
    };
    const searchUrl = `https://hnytxj.com/vod/search/${encodeURIComponent(keyword)}?_rsc=xsbs6`;
    
    let finalResult = [];
    
    try {
        const response = await fetchv2(searchUrl, header);
        const html = await response.json();
        
        finalResult = [{ title: "测试数据", image: "", href: "" }];
        
        // 成功时抛出调试信息
        throw new Error(`=== 搜索成功调试信息 ===
关键词: ${keyword}
URL: ${searchUrl}
状态码: ${response.status}
数据长度: ${html.length}
返回结果数量: ${finalResult.length}
============================`);
        
    } catch (err) {
        finalResult = [{ 
            title: "错误: " + err.message, 
            image: "https://i.ibb.co/Y4b38sTG/Search-has-no-images.png", 
            href: "javascript:void(0)" 
        }];
        
        // 错误时也抛出调试信息
        throw new Error(`=== 搜索错误调试信息 ===
关键词: ${keyword}
URL: ${searchUrl}
最终结果: ${JSON.stringify(finalResult)}
原始错误: ${err.message}
============================`);
    }
    
    // 这行不会执行，因为前面一定会throw
    return JSON.stringify(finalResult);
}
