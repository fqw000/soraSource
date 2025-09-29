// MD5哈希函数
function md5(string) {
    function rotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function addUnsigned(lX, lY) {
        let lX8 = (lX & 0x80000000);
        let lY8 = (lY & 0x80000000);
        let lX4 = (lX & 0x40000000);
        let lY4 = (lY & 0x40000000);
        let lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        if (lX4 | lY4) {
            if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        } else return (lResult ^ lX8 ^ lY8);
    }

    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }

    function FF(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(string) {
        let lWordCount;
        let lMessageLength = string.length;
        let lNumberOfWords_temp1 = lMessageLength + 8;
        let lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        let lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        let lWordArray = Array(lNumberOfWords - 1);
        let lBytePosition = 0;
        let lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    }

    function wordToHex(lValue) {
        let WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    }

    let x = [];
    let k, AA, BB, CC, DD, a, b, c, d;
    let S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    let S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    let S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    let S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    string = utf8Encode(string);

    x = convertToWordArray(string);

    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
        AA = a; BB = b; CC = c; DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }
    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

// SHA1哈希函数
function sha1(msg) {
    function rotateLeft(n, s) {
        return (n << s) | (n >>> (32 - s));
    }

    function cvtHex(val) {
        let str = "";
        let i;
        let v;
        for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f;
            str += v.toString(16);
        }
        return str;
    }

    let blockstart;
    let i, j;
    let W = new Array(80);
    let H0 = 0x67452301;
    let H1 = 0xEFCDAB89;
    let H2 = 0x98BADCFE;
    let H3 = 0x10325476;
    let H4 = 0xC3D2E1F0;
    let A, B, C, D, E;
    let temp;

    msg = utf8Encode(msg);

    let msg_len = msg.length;
    let word_array = [];
    for (i = 0; i < msg_len - 3; i += 4) {
        j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 |
            msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
        word_array.push(j);
    }

    switch (msg_len % 4) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
            break;
        case 2:
            i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
            break;
        case 3:
            i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
            break;
    }
    word_array.push(i);

    while ((word_array.length % 16) != 14) word_array.push(0);

    word_array.push(msg_len >>> 29);
    word_array.push((msg_len << 3) & 0x0ffffffff);

    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
        for (i = 16; i <= 79; i++) W[i] = rotateLeft(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;

        for (i = 0; i <= 19; i++) {
            temp = (rotateLeft(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotateLeft(B, 30);
            B = A;
            A = temp;
        }

        for (i = 20; i <= 39; i++) {
            temp = (rotateLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotateLeft(B, 30);
            B = A;
            A = temp;
        }

        for (i = 40; i <= 59; i++) {
            temp = (rotateLeft(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotateLeft(B, 30);
            B = A;
            A = temp;
        }

        for (i = 60; i <= 79; i++) {
            temp = (rotateLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotateLeft(B, 30);
            B = A;
            A = temp;
        }

        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }

    temp = cvtHex(H0) + cvtHex(H1) + cvtHex(H2) + cvtHex(H3) + cvtHex(H4);
    return temp.toLowerCase();
}

// UTF-8编码辅助函数
function utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < string.length; n++) {
        let c = string.charCodeAt(n);
        if (c < 128) {
            utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }
    }
    return utftext;
}

// 以上为md5和sha1函数定义

async function searchResults(keyword) {

    try {
        // 将关键字进行URL编码
        const encodedKeyword = encodeURIComponent(keyword);

        // 获取搜索结果总页数
        const headers = {
            'RSC': '1'
        };
        const response = await fetchv2(`https://hnytxj.com/vod/search/${encodedKeyword}?_rsc=xsbs6`, { headers });

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

        const pageRegex = /"result":.*"totalPage":(\d+)/
        const match = data.match(pageRegex);
        const totalPage = match ? parseInt(match[1], 10) : 1;
        console.log('Total Pages:', totalPage);

        // ---- 以下为使用api获取数据

        const pageSize = '24';   // 定义每页的数量，默认是12，按需调整
        const maxPages = 2;      // 最大获取页数

        // 确定需要获取的页数
        const pagesToFetch = totalPage > maxPages ? maxPages : totalPage;
        console.log(`📄 需要获取 ${pagesToFetch} 页数据`);

        const allResults = [];

        for (let currentPage = 1; currentPage <= pagesToFetch; currentPage++) {
            const pageNum = currentPage.toString();
            const t = Date.now();

            const signKey = 'keyword=' + keyword + '&pageNum=' + pageNum + '&pageSize=' + pageSize + '&type=false&key=cb808529bae6b6be45ecfab29a4889bc&t=' + t;

            const searchUrl = "https://www.hnytxj.com/api/mw-movie/anonymous/video/searchByWord?keyword=" + encodedKeyword + "&pageNum=" + pageNum + "&pageSize=" + pageSize + "&type=false";
            const sign = sha1(md5(signKey));
            console.log("sign:", sign, "t:", t, "signKey:", signKey);
            
            throw new Error(`sign: ${sign}, t: ${t}, signKey: ${signKey}, searchUrl: ${searchUrl}`);
            
            console.log(`🔍 正在获取第 ${currentPage} 页数据...`);

            try {
                const response2 = await fetchv2(searchUrl, {
                    headers: {
                        Referer: 'https://hnytxj.com/',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        sign: sign,
                        t: t
                    }
                });

                const json_data = await response2.json();
                const movieList = json_data.data?.result?.list;
                console.log("json_data:", json_data);

                if (movieList && movieList.length > 0) {
                    console.log(`🎬 第 ${currentPage} 页找到 ${movieList.length} 部影片`);

                    // 处理每部影片
                    movieList.forEach(movie => {
                        const href = `https://www.hnytxj.com/detail/${movie.vodId}`;
                        const image = movie.vodPic;
                        const title = movie.vodName;

                        allResults.push({
                            title: title?.trim() || '',
                            image: image?.trim() || '',
                            href: href?.trim() || ''
                        });
                    });

                } else {
                    console.log(`❌ 第 ${currentPage} 页没有找到影片数据`);
                }

                // 添加延迟避免请求过快
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`❌ 获取第 ${currentPage} 页数据时出错:`, error);
            }
        }

        return JSON.stringify(allResults);
    } catch (error) {
        console.error(`❌ 搜索失败:`, error);
        return JSON.stringify([]);
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

    const header = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9'
    }

    const response = await fetchv2(url, header);
    console.log("✅ 页面请求成功，状态码:", response.status);
    const html = await response.text();
    console.log("📄 获取到HTML的长度:", html.length, "字符");

    // 从URL提取cid
    const cidMatch = url.match(/\/(\d+)$/);
    if (!cidMatch) {
        console.error("❌ 无法从URL中提取cid");
        return JSON.stringify([]);
    }
    const cid = cidMatch[1];
    console.log("✅ 提取到cid:", cid);

    const episodes = [];

    // 解码HTML实体和转义字符
    const decodedHtml = html
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '')
        .replace(/\\r/g, '')
        .replace(/\\t/g, '')
        .replace(/\\/g, '');

    // 匹配episodeList数组
    const episodeListRegex = /episodeList":(\[[^\]]*\])/s;
    const episodeListMatch = decodedHtml.match(episodeListRegex);

    if (episodeListMatch) {
        console.log("✅ 找到episodeList数据");

        try {
            // 方法1：直接解析JSON
            const episodeListStr = episodeListMatch[1];
            console.log("提取到的JSON字符串:", episodeListStr.substring(0, 100) + "...");

            const episodeData = JSON.parse(episodeListStr);
            console.log(`✅ 成功解析 ${episodeData.length} 个剧集项`);

            episodeData.forEach(item => {
                const href = `https://www.hnytxj.com/vod/play/${cid}/sid/${item.nid}`;

                episodes.push({
                    href: href.trim(),
                    number: parseInt(item.name, 10)
                });
            });

        } catch (parseError) {
            console.log("❌ JSON解析失败，尝试备用方法:", parseError.message);

            // 方法2：在提取到的episodeList字符串上执行正则匹配
            const episodeListStr = episodeListMatch[1];
            const itemRegex = /"nid":([^,]+),"name":"([^"]+)"/g;
            let match;

            while ((match = itemRegex.exec(episodeListStr)) !== null) {
                const nid = match[1];
                const name = match[2];
                const href = `https://www.hnytxj.com/vod/play/${cid}/sid/${nid}`;

                episodes.push({
                    href: href.trim(),
                    number: parseInt(name, 10)
                });
            }

            console.log(`备用方法提取到 ${episodes.length} 个剧集`);
        }
    } else {
        console.log("❌ 未找到episodeList数据，尝试备用匹配方法");

        // 备用方法：直接匹配JSON结构中的episodeList
        const jsonRegex = /"episodeList":(\[.*?\])/s;
        const jsonMatch = decodedHtml.match(jsonRegex);

        if (jsonMatch) {
            try {
                const episodeListStr = jsonMatch[1];
                const episodeData = JSON.parse(episodeListStr);

                episodeData.forEach(item => {
                    const href = `https://www.hnytxj.com/vod/play/${cid}/sid/${item.nid}`;

                    episodes.push({
                        href: href.trim(),
                        number: parseInt(item.name, 10)
                    });
                });
            } catch (e) {
                console.error("❌ 解析episodeList失败:", e);
            }
        }
    }
    // // 检查响应,可以临时启用：
    //     throw new Error(`
    //     === extractEpisodes 调试信息 ===
    //     URL: ${url}
    //     HTTP状态码: ${response.status}
    //     HTML长度: ${html.length}
    //     CID: ${cid}
    //     episodeListMatch: ${episodeListMatch ? '✅ 找到' : '❌ 未找到'}
    //     提取到的剧集数量: ${episodes.length}
    //     剧集详情: ${JSON.stringify(episodes, null, 2)}
    //     ============================
    //     `);

    // console.log(`✅ 成功提取 ${episodes.length} 个剧集`);
    // console.table(episodes);
    return JSON.stringify(episodes);
}

async function extractStreamUrl(url) {
    // const crypto = require('crypto');
    // sora 不支持调用crypto模块，该用本地函数实现md5和sha1功能

    try {
        console.log('开始获取stream URL', JSON.stringify({ url }));
        // 解析URL获取pid和nid
        const parts = url.split('/');
        const pid = parts[5];
        const nid = parts[7];

        // const t = new Date().getTime();
        const t = Date.now();


        const signkey = 'clientType=1&id=' + pid + '&nid=' + nid + '&key=cb808529bae6b6be45ecfab29a4889bc&t=' + t;
        const md5Hash = md5(signkey);  // 替换 crypto.createHash('md5').update(signkey).digest('hex')
        const sign = sha1(md5Hash);    // 替换 crypto.createHash('sha1').update(md5Hash).digest('hex')

        console.log('MD5 Hash:', JSON.stringify({ md5Hash }));
        console.log('SHA1 Sign:', JSON.stringify({ sign }));


        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'deviceid': '63ffad23-a598-4f96-85d7-7bf5f3e4a0a2',
            'sign': sign,
            't': t.toString()
        };

        const apiUrl = 'https://www.hnytxj.com/api/mw-movie/anonymous/v2/video/episode/url?clientType=1&id=' + pid + '&nid=' + nid;
        const response = await fetchv2(apiUrl, headers);
        const json_data = await response.json();

        // 检查响应,可以临时启用：
        // throw new Error(`API响应详情: ${JSON.stringify({
        //     status: '成功',
        //     code: json_data.code,
        // 	url: url,
        //     apiUrl: apiUrl,
        // 	t: t,
        // 	md5Hash: md5Hash,
        // 	signkey:signkey,
        // 	sign: sign,
        //     fullData: json_data, // 完整数据，但可能很长
        // 	json_data_list: json_data.data ? json_data.data.list : 'N/A',
        // 	json_data_length: json_data.data ? json_data.data.list.length : 0
        // }, null, 2)}`);

        // 检查数据有效性并按照规范输出
        if (json_data && json_data.data && json_data.data.list && json_data.data.list.length > 0) {
            const streams = json_data.data.list.map(item => ({
                title: item.resolutionName || 'Unknown Resolution',
                streamUrl: item.url,
                headers: {}
            }));

            // 按照文档规范输出
            const result = {
                streams: streams,
            };

            // throw new Error(`调试信息 - result: ${JSON.stringify(result, null, 2)}`);

            // 返回规范化的结果
            // return result;
            return JSON.stringify(result);


        } else {
            throw new Error('Invalid API response or no stream URL found');
        }


    } catch (error) {
        throw new Error('Failed to extract stream URL: ' + error.message);
    }
}

searchResults("战").then(console.log);
// extractDetails("https://www.hnytxj.com/detail/107070").then(console.log);
// extractEpisodes("https://www.hnytxj.com/detail/107070").then(console.log);
// extractStreamUrl("https://www.hnytxj.com/vod/play/107070/sid/554915").then(console.log);
// extractStreamUrl("https://www.hnytxj.com/vod/play/139196/sid/1231041")
//   .then(streamUrl => {
//     console.log('提取的视频流URL:', streamUrl);
//   })
//   .catch(error => {
//     console.error('错误:', error.message);
//   });// MD5哈希函数
function md5(string) {
    function rotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function addUnsigned(lX, lY) {
        let lX8 = (lX & 0x80000000);
        let lY8 = (lY & 0x80000000);
        let lX4 = (lX & 0x40000000);
        let lY4 = (lY & 0x40000000);
        let lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        if (lX4 | lY4) {
            if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        } else return (lResult ^ lX8 ^ lY8);
    }

    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }

    function FF(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(string) {
        let lWordCount;
        let lMessageLength = string.length;
        let lNumberOfWords_temp1 = lMessageLength + 8;
        let lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        let lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        let lWordArray = Array(lNumberOfWords - 1);
        let lBytePosition = 0;
        let lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    }

    function wordToHex(lValue) {
        let WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    }

    let x = [];
    let k, AA, BB, CC, DD, a, b, c, d;
    let S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    let S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    let S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    let S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    string = utf8Encode(string);

    x = convertToWordArray(string);

    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
        AA = a; BB = b; CC = c; DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }
    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

// SHA1哈希函数
function sha1(msg) {
    function rotateLeft(n, s) {
        return (n << s) | (n >>> (32 - s));
    }

    function cvtHex(val) {
        let str = "";
        let i;
        let v;
        for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f;
            str += v.toString(16);
        }
        return str;
    }

    let blockstart;
    let i, j;
    let W = new Array(80);
    let H0 = 0x67452301;
    let H1 = 0xEFCDAB89;
    let H2 = 0x98BADCFE;
    let H3 = 0x10325476;
    let H4 = 0xC3D2E1F0;
    let A, B, C, D, E;
    let temp;

    msg = utf8Encode(msg);

    let msg_len = msg.length;
    let word_array = [];
    for (i = 0; i < msg_len - 3; i += 4) {
        j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 |
            msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
        word_array.push(j);
    }

    switch (msg_len % 4) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
            break;
        case 2:
            i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
            break;
        case 3:
            i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
            break;
    }
    word_array.push(i);

    while ((word_array.length % 16) != 14) word_array.push(0);

    word_array.push(msg_len >>> 29);
    word_array.push((msg_len << 3) & 0x0ffffffff);

    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
        for (i = 16; i <= 79; i++) W[i] = rotateLeft(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;

        for (i = 0; i <= 19; i++) {
            temp = (rotateLeft(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotateLeft(B, 30);
            B = A;
            A = temp;
        }

        for (i = 20; i <= 39; i++) {
            temp = (rotateLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotateLeft(B, 30);
            B = A;
            A = temp;
        }

        for (i = 40; i <= 59; i++) {
            temp = (rotateLeft(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotateLeft(B, 30);
            B = A;
            A = temp;
        }

        for (i = 60; i <= 79; i++) {
            temp = (rotateLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotateLeft(B, 30);
            B = A;
            A = temp;
        }

        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }

    temp = cvtHex(H0) + cvtHex(H1) + cvtHex(H2) + cvtHex(H3) + cvtHex(H4);
    return temp.toLowerCase();
}

// UTF-8编码辅助函数
function utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < string.length; n++) {
        let c = string.charCodeAt(n);
        if (c < 128) {
            utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }
    }
    return utftext;
}

// 以上为md5和sha1函数定义

async function searchResults(keyword) {

    // 将关键字进行URL编码
    const encodedKeyword = encodeURIComponent(keyword);

    try {

        // 获取搜索结果总页数
        const headers = {
            'RSC': '1'
        };
        const response = await fetchv2(`https://hnytxj.com/vod/search/${encodedKeyword}?_rsc=xsbs6`, { headers });

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

        const pageRegex = /"result":.*"totalPage":(\d+)/
        const match = data.match(pageRegex);
        const totalPage = match ? parseInt(match[1], 10) : 1;
        console.log('Total Pages:', totalPage);

        // ---- 以下为使用api获取数据

        const pageSize = '24';   // 定义每页的数量，默认是12，按需调整
        const maxPages = 2;      // 最大获取页数

        // 确定需要获取的页数
        const pagesToFetch = totalPage > maxPages ? maxPages : totalPage;
        console.log(`📄 需要获取 ${pagesToFetch} 页数据`);

        const allResults = [];

        for (let currentPage = 1; currentPage <= pagesToFetch; currentPage++) {
            const pageNum = currentPage.toString();
            const t = Date.now();

            const signKey = 'keyword=' + keyword + '&pageNum=' + pageNum + '&pageSize=' + pageSize + '&type=false&key=cb808529bae6b6be45ecfab29a4889bc&t=' + t;

            const searchUrl = "https://www.hnytxj.com/api/mw-movie/anonymous/video/searchByWord?keyword=" + encodedKeyword + "&pageNum=" + pageNum + "&pageSize=" + pageSize + "&type=false";
            const sign = sha1(md5(signKey));
            console.log("sign:", sign, "t:", t, "signKey:", signKey);
            throw new Error("sign：" + sign + " t:" + t + " signKey:" + signKey);
            console.log(`🔍 正在获取第 ${currentPage} 页数据...`);

            try {
                const response2 = await fetchv2(searchUrl, {
                    headers: {
                        Referer: 'https://hnytxj.com/',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        sign: sign,
                        t: t
                    }
                });

                const json_data = await response2.json();
                const movieList = json_data.data?.result?.list;
                console.log("json_data:", json_data);

                if (movieList && movieList.length > 0) {
                    console.log(`🎬 第 ${currentPage} 页找到 ${movieList.length} 部影片`);

                    // 处理每部影片
                    movieList.forEach(movie => {
                        const href = `https://www.hnytxj.com/detail/${movie.vodId}`;
                        const image = movie.vodPic;
                        const title = movie.vodName;

                        allResults.push({
                            title: title?.trim() || '',
                            image: image?.trim() || '',
                            href: href?.trim() || ''
                        });
                    });

                } else {
                    console.log(`❌ 第 ${currentPage} 页没有找到影片数据`);
                }

                // 添加延迟避免请求过快
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`❌ 获取第 ${currentPage} 页数据时出错:`, error);
            }
        }

        return JSON.stringify(allResults);
    } catch (error) {
        console.error(`❌ 搜索失败:`, error);
        return JSON.stringify([]);
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

    const header = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9'
    }

    const response = await fetchv2(url, header);
    console.log("✅ 页面请求成功，状态码:", response.status);
    const html = await response.text();
    console.log("📄 获取到HTML的长度:", html.length, "字符");

    // 从URL提取cid
    const cidMatch = url.match(/\/(\d+)$/);
    if (!cidMatch) {
        console.error("❌ 无法从URL中提取cid");
        return JSON.stringify([]);
    }
    const cid = cidMatch[1];
    console.log("✅ 提取到cid:", cid);

    const episodes = [];

    // 解码HTML实体和转义字符
    const decodedHtml = html
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '')
        .replace(/\\r/g, '')
        .replace(/\\t/g, '')
        .replace(/\\/g, '');

    // 匹配episodeList数组
    const episodeListRegex = /episodeList":(\[[^\]]*\])/s;
    const episodeListMatch = decodedHtml.match(episodeListRegex);

    if (episodeListMatch) {
        console.log("✅ 找到episodeList数据");

        try {
            // 方法1：直接解析JSON
            const episodeListStr = episodeListMatch[1];
            console.log("提取到的JSON字符串:", episodeListStr.substring(0, 100) + "...");

            const episodeData = JSON.parse(episodeListStr);
            console.log(`✅ 成功解析 ${episodeData.length} 个剧集项`);

            episodeData.forEach(item => {
                const href = `https://www.hnytxj.com/vod/play/${cid}/sid/${item.nid}`;

                episodes.push({
                    href: href.trim(),
                    number: parseInt(item.name, 10)
                });
            });

        } catch (parseError) {
            console.log("❌ JSON解析失败，尝试备用方法:", parseError.message);

            // 方法2：在提取到的episodeList字符串上执行正则匹配
            const episodeListStr = episodeListMatch[1];
            const itemRegex = /"nid":([^,]+),"name":"([^"]+)"/g;
            let match;

            while ((match = itemRegex.exec(episodeListStr)) !== null) {
                const nid = match[1];
                const name = match[2];
                const href = `https://www.hnytxj.com/vod/play/${cid}/sid/${nid}`;

                episodes.push({
                    href: href.trim(),
                    number: parseInt(name, 10)
                });
            }

            console.log(`备用方法提取到 ${episodes.length} 个剧集`);
        }
    } else {
        console.log("❌ 未找到episodeList数据，尝试备用匹配方法");

        // 备用方法：直接匹配JSON结构中的episodeList
        const jsonRegex = /"episodeList":(\[.*?\])/s;
        const jsonMatch = decodedHtml.match(jsonRegex);

        if (jsonMatch) {
            try {
                const episodeListStr = jsonMatch[1];
                const episodeData = JSON.parse(episodeListStr);

                episodeData.forEach(item => {
                    const href = `https://www.hnytxj.com/vod/play/${cid}/sid/${item.nid}`;

                    episodes.push({
                        href: href.trim(),
                        number: parseInt(item.name, 10)
                    });
                });
            } catch (e) {
                console.error("❌ 解析episodeList失败:", e);
            }
        }
    }
    // // 检查响应,可以临时启用：
    //     throw new Error(`
    //     === extractEpisodes 调试信息 ===
    //     URL: ${url}
    //     HTTP状态码: ${response.status}
    //     HTML长度: ${html.length}
    //     CID: ${cid}
    //     episodeListMatch: ${episodeListMatch ? '✅ 找到' : '❌ 未找到'}
    //     提取到的剧集数量: ${episodes.length}
    //     剧集详情: ${JSON.stringify(episodes, null, 2)}
    //     ============================
    //     `);

    // console.log(`✅ 成功提取 ${episodes.length} 个剧集`);
    // console.table(episodes);
    return JSON.stringify(episodes);
}

async function extractStreamUrl(url) {
    // const crypto = require('crypto');
    // sora 不支持调用crypto模块，该用本地函数实现md5和sha1功能

    try {
        console.log('开始获取stream URL', JSON.stringify({ url }));
        // 解析URL获取pid和nid
        const parts = url.split('/');
        const pid = parts[5];
        const nid = parts[7];

        // const t = new Date().getTime();
        const t = Date.now();


        const signkey = 'clientType=1&id=' + pid + '&nid=' + nid + '&key=cb808529bae6b6be45ecfab29a4889bc&t=' + t;
        const md5Hash = md5(signkey);  // 替换 crypto.createHash('md5').update(signkey).digest('hex')
        const sign = sha1(md5Hash);    // 替换 crypto.createHash('sha1').update(md5Hash).digest('hex')

        console.log('MD5 Hash:', JSON.stringify({ md5Hash }));
        console.log('SHA1 Sign:', JSON.stringify({ sign }));


        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'deviceid': '63ffad23-a598-4f96-85d7-7bf5f3e4a0a2',
            'sign': sign,
            't': t.toString()
        };

        const apiUrl = 'https://www.hnytxj.com/api/mw-movie/anonymous/v2/video/episode/url?clientType=1&id=' + pid + '&nid=' + nid;
        const response = await fetchv2(apiUrl, headers);
        const json_data = await response.json();

        // 检查响应,可以临时启用：
        // throw new Error(`API响应详情: ${JSON.stringify({
        //     status: '成功',
        //     code: json_data.code,
        // 	url: url,
        //     apiUrl: apiUrl,
        // 	t: t,
        // 	md5Hash: md5Hash,
        // 	signkey:signkey,
        // 	sign: sign,
        //     fullData: json_data, // 完整数据，但可能很长
        // 	json_data_list: json_data.data ? json_data.data.list : 'N/A',
        // 	json_data_length: json_data.data ? json_data.data.list.length : 0
        // }, null, 2)}`);

        // 检查数据有效性并按照规范输出
        if (json_data && json_data.data && json_data.data.list && json_data.data.list.length > 0) {
            const streams = json_data.data.list.map(item => ({
                title: item.resolutionName || 'Unknown Resolution',
                streamUrl: item.url,
                headers: {}
            }));

            // 按照文档规范输出
            const result = {
                streams: streams,
            };

            // throw new Error(`调试信息 - result: ${JSON.stringify(result, null, 2)}`);

            // 返回规范化的结果
            // return result;
            return JSON.stringify(result);


        } else {
            throw new Error('Invalid API response or no stream URL found');
        }


    } catch (error) {
        throw new Error('Failed to extract stream URL: ' + error.message);
    }
}

// searchResults("战").then(console.log);
// extractDetails("https://www.hnytxj.com/detail/107070").then(console.log);
// extractEpisodes("https://www.hnytxj.com/detail/107070").then(console.log);
// extractStreamUrl("https://www.hnytxj.com/vod/play/107070/sid/554915").then(console.log);
// extractStreamUrl("https://www.hnytxj.com/vod/play/139196/sid/1231041")
//   .then(streamUrl => {
//     console.log('提取的视频流URL:', streamUrl);
//   })
//   .catch(error => {
//     console.error('错误:', error.message);
//   });
