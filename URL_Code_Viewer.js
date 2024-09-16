addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname === '/') {
    return new Response(renderHTML(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  } else if (url.pathname === '/fetch') {
    const targetUrl = url.searchParams.get('url')
    const type = url.searchParams.get('type') || 'html'

    if (!targetUrl) {
      return new Response('请输入一个网址', { status: 400 })
    }

    try {
      const res = await fetch(targetUrl)
      const contentType = res.headers.get('Content-Type')

      if (type === 'html') {
        const html = await res.text()
        return new Response(html, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        })
      } else if (type === 'js' && contentType.includes('text/javascript')) {
        const js = await res.text()
        return new Response(js, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        })
      } else {
        return new Response('无法获取指定内容', { status: 400 })
      }
    } catch (err) {
      return new Response('获取内容失败', { status: 500 })
    }
  } else {
    return new Response('404 Not Found', { status: 404 })
  }
}

function renderHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>URL Code Viewer</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        input, select {
          padding: 10px;
          margin-bottom: 10px;
          width: 300px;
        }
        #code {
          width: 100%;
          height: 300px;
          white-space: pre-wrap;
          background-color: #f4f4f4;
          padding: 10px;
          overflow: auto;
        }
        button {
          padding: 10px 15px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>

    <h2>输入网址，获取 HTML 或 JS 代码</h2>
    <input id="urlInput" type="text" placeholder="输入网址" />
    <select id="typeSelect">
      <option value="html">HTML</option>
      <option value="js">JS</option>
    </select>
    <button id="fetchBtn">获取代码</button>
    <button id="copyBtn">一键复制</button>

    <pre id="code">代码将显示在这里...</pre>

    <script>
      const fetchBtn = document.getElementById('fetchBtn')
      const copyBtn = document.getElementById('copyBtn')
      const urlInput = document.getElementById('urlInput')
      const typeSelect = document.getElementById('typeSelect')
      const codeDisplay = document.getElementById('code')

      // 通过 Cloudflare Worker 获取内容
      fetchBtn.addEventListener('click', async () => {
        const url = urlInput.value
        const type = typeSelect.value
        if (!url) {
          alert('请输入网址')
          return
        }

        try {
          const response = await fetch(\`/fetch?url=\${encodeURIComponent(url)}&type=\${type}\`)
          if (!response.ok) {
            throw new Error('获取失败')
          }
          const text = await response.text()
          codeDisplay.textContent = text
        } catch (error) {
          codeDisplay.textContent = '获取内容失败'
        }
      })

      // 一键复制功能
      copyBtn.addEventListener('click', () => {
        const text = codeDisplay.textContent
        navigator.clipboard.writeText(text).then(() => {
          alert('代码已复制！')
        }).catch(err => {
          alert('复制失败')
        })
      })
    </script>

    </body>
    </html>
  `
}
