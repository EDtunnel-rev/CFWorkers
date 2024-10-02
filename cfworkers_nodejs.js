// Cloudflare Worker entry point: /index.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'POST') {
      const reqBody = await request.json()
      const { code, apiKey, channel, model } = reqBody

      if (!code || !apiKey || !model || !channel) {
          return new Response("Invalid input. Code, API Key, Channel, and Model are required.", { status: 400 })
      }

      const result = await aiConvert(code, apiKey, channel, model)

      return new Response(JSON.stringify({ result }), {
          headers: { 'Content-Type': 'application/json' }
      })
  }

  return new Response(getHtml(), {
      headers: { 'Content-Type': 'text/html' }
  })
}

// Function to handle the AI conversion request to a single API channel
async function aiConvert(code, apiKey, channel, model) {
  const prompt = `将以下Cloudflare Workers代码转换为Node.js代码:\n\n${code}`

  const apiUrl = channel === "openai" 
      ? "https://api.openai.com/v1/chat/completions"
      : `https://custom-api-endpoint/${channel}`

  const payload = {
      model: model,
      messages: [
          {
              role: "system",
              content: "You are a helpful assistant that converts Cloudflare Workers code to Node.js."
          },
          {
              role: "user",
              content: prompt
          }
      ],
      temperature: 0,
      max_tokens: 1000
  }

  const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
  }

  try {
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
      })

      if (response.ok) {
          const data = await response.json()
          return data.choices[0].message.content.trim()
      } else {
          return "Failed to convert code. API request was not successful."
      }
  } catch (error) {
      return `Error occurred: ${error.message}`
  }
}

// HTML for the visual interface
function getHtml() {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Cloudflare Workers to Node.js Converter</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 50px; }
        input, textarea { width: 100%; padding: 10px; margin-top: 10px; }
        button { padding: 10px 20px; margin-top: 20px; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>Cloudflare Workers to Node.js Converter</h1>
      <form id="convertForm">
        <label for="code">Cloudflare Workers Code:</label>
        <textarea id="code" rows="10" required></textarea>

        <label for="model">Model:</label>
        <select id="model" required>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4-turbo">GPT-4-Turbo</option>
          <option value="gpt-3.5-turbo">GPT-3.5-Turbo</option>
          <option value="o1-mini">O1-Mini</option>
          <option value="o1-preview">O1-Preview</option>
        </select>

        <label for="apiKey">OpenAI API Key:</label>
        <input id="apiKey" type="text" placeholder="输入您的 OpenAI API Key" required>

        <label for="channel">API 调用渠道:</label>
        <input id="channel" type="text" placeholder="输入渠道 (如: openai)" required>

        <button type="submit">Convert</button>
      </form>

      <h2>Converted Code:</h2>
      <pre id="result"></pre>

      <script>
        document.getElementById('convertForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          const code = document.getElementById('code').value;
          const apiKey = document.getElementById('apiKey').value;
          const channel = document.getElementById('channel').value;
          const model = document.getElementById('model').value;

          const response = await fetch(window.location.href, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, apiKey, channel, model })
          });

          const data = await response.json();
          document.getElementById('result').textContent = data.result;
        });
      </script>
    </body>
  </html>
  `
}
