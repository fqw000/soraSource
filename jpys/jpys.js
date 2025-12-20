/**
 * sora-金牌影视视视频爬虫工具
 * 功能：搜索影片、提取详情、获取剧集、解析流媒体地址
 * 特点：使用MD5+SHA1签名验证，支持分页搜索和多清晰度流媒体
 */

// ==========================================
// 哈希函数模块
// ==========================================

/**
 * MD5哈希函数
 * @param {string} string - 输入字符串
 * @returns {string} MD5哈希值
 */
function md5(string) {
    /**
     * 循环左移
     */
    function rotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    /**
     * 无符号加法
     */
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

    // 逻辑函数定义
    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }

    // 转换函数
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

    /**
     * 将字符串转换为字数组
     */
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

    /**
     * 将字转换为十六进制字符串
     */
    function wordToHex(lValue) {
        let WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    }

    // MD5主算法
    let x = [];
    let k, AA, BB, CC, DD, a, b, c, d;
    
    // 常量定义
    let S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    let S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    let S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    let S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    string = utf8Encode(string);
    x = convertToWordArray(string);

    // 初始化哈希值
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

    // 主循环
    for (k = 0; k < x.length; k += 16) {
        AA = a; BB = b; CC = c; DD = d;
        
        // 第一轮
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
        
        // 第二轮
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
        
        // 第三轮
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
        
        // 第四轮
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

/**
 * SHA1哈希函数
 * @param {string} msg - 输入消息
 * @returns {string} SHA1哈希值
 */
function sha1(msg) {
    /**
     * 循环左移
     */
    function rotateLeft(n, s) {
        return (n << s) | (n >>> (32 - s));
    }

    /**
     * 转换为十六进制
     */
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

    // 填充处理
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

    // SHA1主算法
    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
        for (i = 16; i <= 79; i++) W[i] = rotateLeft(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;

        // 四轮处理
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

/**
 * UTF-8编码函数
 * @param {string} string - 输入字符串
 * @returns {string} UTF-8编码后的字符串
 */
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

// ==========================================
// 核心功能模块
// ==========================================

/**
 * 搜索影片结果
 * @param {string} keyword - 搜索关键词
 * @returns {string} JSON格式的搜索结果
 */
async function searchResults(keyword) {
//     console("🎯 ==========================================");
//     console("🎯 开始搜索影片");
//     console("🎯 ==========================================");
//     console(`🔍 搜索关键词: ${keyword}`);

    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const header = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'RSC': '1',
            'DNT': '1'
        };
        
        const searchUrl = `https://m.ghw9zwp5.com/vod/search/${encodeURIComponent(keyword)}?_rsc=xsbs6`;
//     console(`🌐 搜索URL: ${searchUrl}`);
        
        const response = await fetchv2(searchUrl, header);
        const data = await response.text();
        
        // 解析总页数
        const pageRegex = /"result":.*"totalPage":(\d+)/;
        const match = data.match(pageRegex);
        const totalPage = match ? parseInt(match[1], 10) : 1;
        
//     console("📊 ==========================================");
//     console("📊 页面解析结果");
//     console("📊 ==========================================");
//     console(`📄 正则匹配: ${match ? '成功' : '失败'}`);
//     console(`📄 总页数: ${totalPage}`);
//     console("📊 ==========================================\n");
        
//     console("🚀 ==========================================");
//     console("🚀 开始API搜索流程");
//     console("🚀 ==========================================");

        const pageSize = '24';
        const maxPages = 2;
        const pagesToFetch = totalPage > maxPages ? maxPages : totalPage;
//     console(`📄 计划获取页数: ${pagesToFetch}/${totalPage}`);
        
        const allResults = [];

        for (let currentPage = 1; currentPage <= pagesToFetch; currentPage++) {
            const pageNum = currentPage.toString();
            const t = Date.now();
            const signKey = 'keyword=' + keyword + '&pageNum=' + pageNum + '&pageSize=' + pageSize + '&type=false&key=cb808529bae6b6be45ecfab29a4889bc&t=' + t;
            const searchUrl = "https://m.ghw9zwp5.com/api/mw-movie/anonymous/video/searchByWord?keyword=" + encodedKeyword + "&pageNum=" + pageNum + "&pageSize=" + pageSize + "&type=false";
            const sign = sha1(md5(signKey));
            
//     console(`🔑 第 ${currentPage} 页签名信息:`);
//     console(`   📍 时间戳: ${t}`);
//     console(`   🔐 签名Key: ${signKey}`);
//     console(`   🎯 签名: ${sign}`);

            try {
//     console(`🔍 正在获取第 ${currentPage} 页数据...`);
                const headers = {
                    'Referer': 'https://m.ghw9zwp5.com/',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'sign': sign,
                    't': t
                };
                
                const response2 = await fetchv2(searchUrl, headers);
                const json_data = await response2.json();
                const movieList = json_data.data?.result?.list;
                
//     console(`📦 API响应数据长度: ${JSON.stringify(json_data).length} 字符`);

                if (movieList && movieList.length > 0) {
//     console(`🎬 第 ${currentPage} 页找到 ${movieList.length} 部影片`);
                    
                    movieList.forEach((movie, index) => {
                        const href = `https://www.m.ghw9zwp5.com/detail/${movie.vodId}`;
                        const image = movie.vodPic;
                        const title = movie.vodName;

                        allResults.push({
                            title: title?.trim() || '',
                            image: image?.trim() || '',
                            href: href?.trim() || ''
                        });
                        
//     console(`   ${index + 1}. ${title}`);
                    });
                } else {
//     console(`❌ 第 ${currentPage} 页没有找到影片数据`);
                }

                // 请求间隔
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`💥 获取第 ${currentPage} 页数据时出错:`, error.message);
            }
        }

//     console("✅ ==========================================");
//     console("✅ 搜索完成");
//     console("✅ ==========================================");
//     console(`📊 总共找到 ${allResults.length} 部影片`);
        
        return JSON.stringify(allResults);

    } catch (error) {
        console.error("💥 ==========================================");
        console.error("💥 搜索过程发生错误");
        console.error("💥 ==========================================");
        console.error(`错误详情: ${error.message}`);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

/**
 * 提取影片详情信息
 * @param {string} url - 影片详情页URL
 * @returns {string} JSON格式的详情信息
 */
async function extractDetails(url) {
//     console("🎯 ==========================================");
//     console("🎯 开始提取影片详情");
//     console("🎯 ==========================================");
//     console(`🔗 目标URL: ${url}`);
    
    const header = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
    };
    
    try {
        const response = await fetchv2(url, header);
//     console(`✅ 页面请求成功，状态码: ${response.status}`);
        
        const html = await response.text();
//     console(`📄 获取到HTML内容，长度: ${html.length} 字符`);

        // 提取别名
        const aliasMatch = html.match(/别名:<\/div>([\s\S]*?)<\/div>/);
        let alias = "N/A";
        if (aliasMatch) {
            alias = aliasMatch[1]
                .replace(/<a href="\/vod\/search\/[^"]+">([^<]+)<\/a>/g, '$1 || ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        // 提取描述
        const descriptionMatch = html.match(/<div class="jiantou"><\/div><\/label>\s*([\s\S]*?)<\/div>/);
        const airdateMatch = html.match(/<div class="item-top">(\d+-\d+-\d+)<\/div>/);

        const description = descriptionMatch ? descriptionMatch[1].trim() : "暂无描述";
        const airdate = airdateMatch ? airdateMatch[1].trim() : "N/A";
        
//     console("📊 ==========================================");
//     console("📊 详情提取结果");
//     console("📊 ==========================================");
//     console(`🏷️  别名: ${alias}`);
//     console(`📅 上映日期: ${airdate}`);
//     console(`📝 描述: ${description.substring(0, 50)}...`);
//     console("📊 ==========================================");

        const details = [{
            alias,
            description,
            airdate
        }];

        return JSON.stringify(details);
        
    } catch (error) {
        console.error("💥 提取详情时出错:", error.message);
        return JSON.stringify([{ alias: "N/A", description: "提取失败", airdate: "N/A" }]);
    }
}

/**
 * 提取影片剧集列表
 * @param {string} url - 影片详情页URL
 * @returns {string} JSON格式的剧集列表
 */
async function extractEpisodes(url) {
//     console("🎯 ==========================================");
//     console("🎯 开始提取剧集列表");
//     console("🎯 ==========================================");
//     console(`🔗 目标URL: ${url}`);

    const header = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9'
    };

    try {
        const response = await fetchv2(url, header);
//     console(`✅ 页面请求成功，状态码: ${response.status}`);
        
        const html = await response.text();
//     console(`📄 获取到HTML内容，长度: ${html.length} 字符`);

        // 从URL提取cid
        const cidMatch = url.match(/\/(\d+)$/);
        if (!cidMatch) {
            console.error("❌ 无法从URL中提取cid");
            return JSON.stringify([]);
        }
        const cid = cidMatch[1];
//     console(`✅ 提取到影片ID: ${cid}`);

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
//     console("✅ 找到剧集列表数据");
            
            try {
                // 方法1：直接解析JSON
                const episodeListStr = episodeListMatch[1];
//     console(`📦 剧集数据长度: ${episodeListStr.length} 字符`);

                const episodeData = JSON.parse(episodeListStr);
//     console(`🎬 成功解析 ${episodeData.length} 个剧集`);

                episodeData.forEach((item, index) => {
                    const href = `https://www.m.ghw9zwp5.com/vod/play/${cid}/sid/${item.nid}`;
                    episodes.push({
                        href: href.trim(),
                        number: parseInt(item.name, 10)
                    });
                    
                    if (index < 5) { // 只显示前5个剧集信息
//     console(`   ${index + 1}. 剧集 ${item.name} -> ${href}`);
                    }
                });
                
                if (episodeData.length > 5) {
//     console(`   ... 还有 ${episodeData.length - 5} 个剧集`);
                }

            } catch (parseError) {
//     console("⚠️  JSON解析失败，尝试备用方法");
//     console(`🔧 错误详情: ${parseError.message}`);

                // 方法2：正则匹配备用方案
                const episodeListStr = episodeListMatch[1];
                const itemRegex = /"nid":([^,]+),"name":"([^"]+)"/g;
                let match;
                let count = 0;

                while ((match = itemRegex.exec(episodeListStr)) !== null) {
                    const nid = match[1];
                    const name = match[2];
                    const href = `https://www.m.ghw9zwp5.com/vod/play/${cid}/sid/${nid}`;
                    episodes.push({
                        href: href.trim(),
                        number: parseInt(name, 10)
                    });
                    count++;
                }

//     console(`🔧 备用方法提取到 ${count} 个剧集`);
            }
        } else {
//     console("❌ 未找到剧集列表数据，尝试备用匹配方法");

            // 备用方法：直接匹配JSON结构
            const jsonRegex = /"episodeList":(\[.*?\])/s;
            const jsonMatch = decodedHtml.match(jsonRegex);

            if (jsonMatch) {
                try {
                    const episodeListStr = jsonMatch[1];
                    const episodeData = JSON.parse(episodeListStr);

                    episodeData.forEach(item => {
                        const href = `https://www.m.ghw9zwp5.com/vod/play/${cid}/sid/${item.nid}`;
                        episodes.push({
                            href: href.trim(),
                            number: parseInt(item.name, 10)
                        });
                    });
                    
//     console(`🔧 备用方法解析到 ${episodes.length} 个剧集`);
                } catch (e) {
                    console.error("💥 解析剧集列表失败:", e.message);
                }
            } else {
                console.error("💥 所有解析方法都失败了");
            }
        }

//     console("✅ ==========================================");
//     console(`✅ 剧集提取完成: 共 ${episodes.length} 个剧集`);
//     console("✅ ==========================================");

        return JSON.stringify(episodes);
        
    } catch (error) {
        console.error("💥 ==========================================");
        console.error("💥 提取剧集时发生错误");
        console.error("💥 ==========================================");
        console.error(`错误详情: ${error.message}`);
        return JSON.stringify([]);
    }
}

/**
 * 提取流媒体播放地址
 * @param {string} url - 剧集播放页URL
 * @returns {string} JSON格式的流媒体信息
 */
async function extractStreamUrl(url) {
//     console("🎯 ==========================================");
//     console("🎯 开始提取流媒体地址");
//     console("🎯 ==========================================");
//     console(`🔗 目标URL: ${url}`);

    try {
        // 解析URL获取pid和nid
        const parts = url.split('/');
        const pid = parts[5];
        const nid = parts[7];
        
//     console(`📋 解析参数: PID=${pid}, NID=${nid}`);

        const t = Date.now();
        const signkey = 'clientType=1&id=' + pid + '&nid=' + nid + '&key=cb808529bae6b6be45ecfab29a4889bc&t=' + t;
        const md5Hash = md5(signkey);
        const sign = sha1(md5Hash);
        
//     console("🔑 ==========================================");
//     console("🔑 签名生成信息");
//     console("🔑 ==========================================");
//     console(`📅 时间戳: ${t}`);
//     console(`🔐 签名密钥: ${signkey}`);
//     console(`🔒 MD5哈希: ${md5Hash}`);
//     console(`🎯 SHA1签名: ${sign}`);
//     console("🔑 ==========================================");

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'deviceid': '63ffad23-a598-4f96-85d7-7bf5f3e4a0a2',
            'sign': sign,
            't': t.toString()
        };

        const apiUrl = 'https://m.ghw9zwp5.com/api/mw-movie/anonymous/v2/video/episode/url?clientType=1&id=' + pid + '&nid=' + nid;
//     console(`🌐 API请求URL: ${apiUrl}`);
        
        const response = await fetchv2(apiUrl, headers);
        const json_data = await response.json();
        
//     console("📦 ==========================================");
//     console("📦 API响应数据");
//     console("📦 ==========================================");
//     console(`📊 响应状态: ${json_data.code}`);
//     console(`📊 数据条数: ${json_data.data?.list?.length || 0}`);
//     console("📦 ==========================================");

        // 检查数据有效性
        if (json_data && json_data.data && json_data.data.list && json_data.data.list.length > 0) {
            const streams = json_data.data.list.map((item, index) => {
//     console(`   ${index + 1}. ${item.resolutionName} -> ${item.url.substring(0, 50)}...`);
                return {
                    title: item.resolutionName || '未知清晰度',
                    streamUrl: item.url,
                    headers: {}
                };
            });

            const result = {
                streams: streams,
            };

//     console("✅ ==========================================");
//     console("✅ 流媒体地址提取成功");
//     console("✅ ==========================================");
//     console(`📊 找到 ${streams.length} 个清晰度`);
            
            return JSON.stringify(result);

        } else {
            throw new Error('API响应无效或未找到流媒体地址');
        }

    } catch (error) {
        console.error("💥 ==========================================");
        console.error("💥 提取流媒体地址失败");
        console.error("💥 ==========================================");
        console.error(`错误详情: ${error.message}`);
        throw new Error('提取流媒体地址失败: ' + error.message);
    }
}
