
async function searchResults(keyword) {

    try {
		// 获取搜索结果总页数
    	const encodedKeyword = encodeURIComponent(keyword);
		const headers = {
		'RSC': '1'
        };
        const response = await fetch(`https://hnytxj.com/vod/search/${encodedKeyword}?_rsc=xsbs6`, { headers });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        	// 根据实际返回内容类型选择解析方式
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
		console.log(`返回内容： ${data}， --- :${JSON.stringify(data)}`);
		throw new Error(`返回内容：${data} `);

        return JSON.stringify([]);
    } catch (error) {
        console.error(`❌ 搜索失败:`, error);
        return JSON.stringify([]);
    }
}

async function extractDetails(url) {
	return JSON.stringify([]);
}

async function extractEpisodes(url) {

    return JSON.stringify([]);
}

async function extractStreamUrl(url) {
	return JSON.stringify([]);
}

searchResults("战").then(console.log);
