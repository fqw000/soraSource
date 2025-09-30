async function searchResults(keyword) {
    const header = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'RSC': '1',
        'DNT': '1'
    };
    const searchUrl = `https://hnytxj.com/vod/search/${encodeURIComponent(keyword)}?_rsc=xsbs6`;
    
    const response = await fetchv2(searchUrl, header);
    const data = await response.text();
    const pageRegex = /"result":.*"totalPage":(\d+)/
    const match = data.match(pageRegex);
    throw new Error(`--------------
        data: ${data}
        match: ${match}
    ---------------`);
}
