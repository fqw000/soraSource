
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

var getCryptoJS = `
/*
 * CryptoJS v3.1.2
 * code.google.com/p/crypto-js
 * (c) 2009-2013 by Jeff Mott. All rights reserved.
 * code.google.com/p/crypto-js/wiki/License
 */
var CryptoJS=CryptoJS||function(h,r){var f={},c=f.lib={},n=c.Base=function(){function a(){}return{extend:function(b){a.prototype=this;var d=new a;b&&d.mixIn(b);d.hasOwnProperty("init")||(d.init=function(){d.$super.init.apply(this,arguments)});d.init.prototype=d;d.$super=this;return d},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var d in a)a.hasOwnProperty(d)&&(this[d]=a[d]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}}}(),s=c.WordArray=n.extend({init:function(a,b){a=this.words=a||[];this.sigBytes=b!=r?b:4*a.length},toString:function(a){return(a||p).stringify(this)},concat:function(a){var b=this.words,d=a.words,g=this.sigBytes;a=a.sigBytes;this.clamp();if(g%4)for(var l=0;l<a;l++)b[g+l>>>2]|=(d[l>>>2]>>>24-8*(l%4)&255)<<24-8*((g+l)%4);else if(65536<d.length)for(l=0;l<a;l+=4)b[g+l>>>2]=d[l>>>2];else b.push.apply(b,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,b=this.sigBytes;a[b>>>2]&=4294967295<<32-8*(b%4);a.length=h.ceil(b/4)},clone:function(){var a=n.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var b=[],d=0;d<a;d+=4)b.push(4294967296*h.random()|0);return new s.init(b,a)}}),m=f.enc={},p=m.Hex=
{stringify:function(a){var b=a.words;a=a.sigBytes;for(var d=[],g=0;g<a;g++){var l=b[g>>>2]>>>24-8*(g%4)&255;d.push((l>>>4).toString(16));d.push((l&15).toString(16))}return d.join("")},parse:function(a){for(var b=a.length,d=[],g=0;g<b;g+=2)d[g>>>3]|=parseInt(a.substr(g,2),16)<<24-4*(g%8);return new s.init(d,b/2)}},k=m.Latin1={stringify:function(a){var b=a.words;a=a.sigBytes;for(var d=[],g=0;g<a;g++)d.push(String.fromCharCode(b[g>>>2]>>>24-8*(g%4)&255));return d.join("")},parse:function(a){for(var b=a.length,d=[],g=0;g<b;g++)d[g>>>2]|=(a.charCodeAt(g)&255)<<24-8*(g%4);return new s.init(d,b)}},l=m.Utf8={stringify:function(a){try{return decodeURIComponent(escape(k.stringify(a)))}catch(b){throw Error("Malformed UTF-8 data");}},parse:function(a){return k.parse(unescape(encodeURIComponent(a)))}},x=c.BufferedBlockAlgorithm=n.extend({reset:function(){this._data=new s.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=l.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var b=this._data,d=b.words,g=b.sigBytes,l=this.blockSize,m=g/(4*l),m=a?h.ceil(m):h.max((m|0)-this._minBufferSize,0);a=m*l;g=h.min(4*a,g);if(a){for(var p=0;p<a;p+=l)this._doProcessBlock(d,p);p=d.splice(0,a);b.sigBytes-=g}return new s.init(p,g)},clone:function(){var a=n.clone.call(this);a._data=this._data.clone();return a},_minBufferSize:0});c.Hasher=x.extend({cfg:n.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){x.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);this._doFinalize();return this},blockSize:16,
_createHelper:function(a){return function(b,d){return new a.init(d).finalize(b)}},_createHmacHelper:function(a){return function(b,d){return new u.HMAC.init(a,d).finalize(b)}}});var u=f.algo={};return f}(Math);
(function(h){var r=CryptoJS,f=r.lib,c=f.WordArray,n=f.Hasher,s=r.algo,m=[],p;!function(){for(var c=0;64>c;c++)m[c]=4294967296*h.abs(h.sin(c+1))|0}();f=s.MD5=n.extend({_doReset:function(){this._hash=new c.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(c,f){for(var g=0;16>g;g++){var l=f+g,k=c[l];c[l]=(k<<8|k>>>24)&16711935|(k<<24|k>>>8)&4278255360}var g=this._hash.words,l=g[0],k=g[1],p=g[2],n=g[3];for(var r=0;64>r;r++){if(16>r)var x=c[f+r];else{var u=c[f+(r-3)&15],y=c[f+(r-8)&15],v=c[f+(r-14)&15],w=c[f+(r-16)&15];x=c[f+r&15]=(u^y^v^w)}x=h.sin(r+1);switch(r%4){case 0:x=k^p;v=n;n=p;p=k^x^v;break;case 1:x=p;v=k^n^x;x=x&n;n=p;p=k^n^x^v;break;case 2:x=k^p^n;v=x;x=n;n=p;p=k^v^x;break;case 3:v=p^n;x=k^v;v=x;x=n;n=p;p=k^v^x}x=u=c[f+r&15];v=h.sin(r+1);k=(k+h.sin(r+1)+x+v)&4294967295;v=l+(k<<7|k>>>25);l=n;n=v;k=k<<12|k>>>20;p=p<<17|p>>>15;n=n<<22|n>>>10}g[0]=(g[0]+l)&4294967295;g[1]=(g[1]+k)&4294967295;g[2]=(g[2]+p)&429624536295;g[3]=(g[3]+n)&4294967295},_doFinalize:function(){var c=this._data,f=c.words,g=8*this._nDataBytes,l=8*c.sigBytes;f[l>>>5]|=128<<24-l%32;var k=h.floor(g/4294967296);f[(l+64>>>9<<4)+15]=4294967296*h.floor(g/4294967296);f[(l+64>>>9<<4)+14]=g;this._hash.clamp()},
clone:function(){var c=n.clone.call(this);c._hash=this._hash.clone();return c}});r.MD5=n._createHelper(f);r.HmacMD5=n._createHmacHelper(f)})(Math);
(function(s){var f=CryptoJS,q=f.lib,l=q.WordArray,m=q.Hasher,p=f.algo,j=m.extend({_doReset:function(){this._hash=new l.init([1732584193,4023233417,2562383102,271733878,2562383102])},_doProcessBlock:function(t,u){for(var v=0;16>v;v++)var w=t[u+v];for(var v=16;80>v;v++)var x=t[u+v-3]^t[u+v-8]^t[u+v-14]^t[u+v-16],w=t[u+v]=(x<<1|x>>>31);var v=this._hash.words,t=v[0],y=v[1],z=v[2],A=v[3],B=v[4];for(var C=0;80>C;C++){if(20>C)var D=(y&z|~y&A)+1518500249;else if(40>C)D=(y^z^A)+1859775393;else if(60>C)D=(y&z|y&A|z&A)-1894007588;else D=(y^z^A)-899497514;D=(t<<5|t>>>27)+D+B+w;B=A;A=z;z=y<<30|y>>>2;y=t;t=D}v[0]=(v[0]+t)&4294967295;v[1]=(v[1]+y)&4294967295;v[2]=(v[2]+z)&4294967295;v[3]=(v[3]+A)&4294967295;v[4]=(v[4]+B)&4294967295},_doFinalize:function(){var t=this._data,u=t.words,v=8*this._nDataBytes,w=8*t.sigBytes;u[w>>>5]|=128<<24-w%32;u[(w+64>>>9<<4)+15]=s.floor(v/4294967296);u[(w+64>>>9<<4)+14]=v;this._hash.clamp()},clone:function(){var t=m.clone.call(this);t._hash=this._hash.clone();return t}});f.SHA1=m._createHelper(j);f.HmacSHA1=m._createHmacHelper(j)})(Math);
`
  
  // 留空，等待你填入加密库代码
  eval(getCryptoJS);

  // 从URL中解析出 pid 和 nid
  const parts = url.split('/');
  const pid = parts[5];
  const nid = parts[7];
  
  const t = new Date().getTime();
  
  // 构建签名所需的字符串
  const signkey = 'clientType=1&id=' + pid + '&nid=' + nid + '&key=cb808529bae6b6be45ecfab29a4889bc&t=' + t;
    console.log("📝 生成签名字符串:", signkey);
  
  // 使用MD5和SHA1生成签名
  const sign = CryptoJS.SHA1(CryptoJS.MD5(signkey).toString()).toString();
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'deviceid': '63ffad23-a598-4f96-85d7-7bf5f3e4a0a2',
    'sign': sign,
    't': t
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
  console.log(" 播放链接： ", link);
    return link;
}


// searchResults("战").then(console.log);
// extractDetails("https://www.hnytxj.com/detail/107070").then(console.log);
//  extractEpisodes("https://www.hnytxj.com/detail/107070").then(console.log);
// extractStreamUrl("https://hnytxj.com/vod/play/139191/sid/1231007").then(console.log);
