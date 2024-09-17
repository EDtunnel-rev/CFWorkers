// 文件路径: workers-site/index.js

async function handleRequest() {
    const url = 'https://oaiapi.us.kg';

    // 随机生成复杂的浏览器指纹，包括WebGL、Canvas等
    const generateFingerprint = () => {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
            'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        ];

        const acceptLanguages = [
            'en-US,en;q=0.9',
            'zh-CN,zh;q=0.9',
            'es-ES,es;q=0.9',
            'fr-FR,fr;q=0.9'
        ];

        const screenResolutions = [
            '1920x1080',
            '1366x768',
            '1440x900',
            '1536x864',
            '1280x720'
        ];

        const plugins = [
            '0',  // 无插件
            '2',  // 模拟2个插件
            '5',  // 模拟5个插件
            '10'  // 模拟10个插件
        ];

        const dnt = [
            '1',  // Do Not Track 开启
            '0'   // Do Not Track 关闭
        ];

        const timeFormats = [
            '12-hour', // 12小时制
            '24-hour'  // 24小时制
        ];

        // 模拟 WebGL 支持情况
        const webglSupport = [
            'WebGL Supported',
            'WebGL Not Supported'
        ];

        // 模拟 Canvas 支持情况
        const canvasSupport = [
            'Canvas Enabled',
            'Canvas Disabled'
        ];

        return {
            'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
            'Accept-Language': acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)],
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            // 添加屏幕分辨率
            'X-Screen-Resolution': screenResolutions[Math.floor(Math.random() * screenResolutions.length)],
            // 模拟浏览器插件数
            'X-Plugins': plugins[Math.floor(Math.random() * plugins.length)],
            // Do Not Track 选项
            'DNT': dnt[Math.floor(Math.random() * dnt.length)],
            // 模拟时间格式（用于伪造用户所在地区）
            'X-Time-Format': timeFormats[Math.floor(Math.random() * timeFormats.length)],
            // 模拟WebGL支持情况
            'X-WebGL-Support': webglSupport[Math.floor(Math.random() * webglSupport.length)],
            // 模拟Canvas支持情况
            'X-Canvas-Support': canvasSupport[Math.floor(Math.random() * canvasSupport.length)]
        };
    };

    async function makeRequest() {
        const headers = generateFingerprint();
        const requestOptions = {
            method: 'GET',
            headers: headers
        };

        // 发起请求到 example.com
        const response = await fetch(url, requestOptions);
        const responseBody = await response.text();

        // 记录日志：成功访问了 example.com
        console.log('Request sent with headers:', headers);
        console.log('Response status:', response.status);

        return new Response('Request sent successfully!', { status: 200 });
    }

    return makeRequest();
}

// Cloudflare Worker 入口函数
addEventListener('fetch', event => {
    event.respondWith(handleRequest());
});
