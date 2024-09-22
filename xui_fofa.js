export default {
  async fetch(request) {
    if (request.method === 'GET') {
      // 返回简单的 HTML 界面
      return new Response(renderHTML(), {
        headers: { 'content-type': 'text/html;charset=UTF-8' },
      });
    }

    if (request.method === 'POST') {
      // 获取上传的文件
      const formData = await request.formData();
      const file = formData.get('file');
      const fileType = file.name.split('.').pop().toLowerCase();  // 获取文件扩展名

      if (!file) {
        return new Response('No file uploaded', { status: 400 });
      }

      // 根据文件类型解析
      let hosts;
      if (fileType === 'csv') {
        const csvText = await file.text();
        hosts = parseCSV(csvText);
      } else if (fileType === 'json') {
        const jsonText = await file.text();
        hosts = parseJSON(jsonText);
      } else {
        return new Response('Unsupported file type. Please upload a CSV or JSON file.', { status: 400 });
      }

      // 执行登录测试
      const results = await runLoginTests(hosts);

      // 返回带有结果的 HTML 页面
      return new Response(renderHTML(results), {
        headers: { 'content-type': 'text/html;charset=UTF-8' },
      });
    }

    return new Response('Method Not Allowed', { status: 405 });
  }
}

// 渲染简单的 HTML 界面，包括文件上传和结果展示
function renderHTML(results = []) {
  let resultsTable = '';
  if (results.length > 0) {
    resultsTable = `
      <h2>测试结果：</h2>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>Host</th>
          <th>Result</th>
        </tr>
        ${results.map(result => `
          <tr>
            <td>${result.host}</td>
            <td>${result.result}</td>
          </tr>
        `).join('')}
      </table>
    `;
  }

  return `
    <html>
      <head>
        <title>Login Test</title>
      </head>
      <body>
        <h1>上传 CSV 或 JSON 文件并开始测试</h1>
        <form method="post" enctype="multipart/form-data">
          <input type="file" name="file" accept=".csv,.json" required />
          <input type="submit" value="上传并开始测试" />
        </form>
        ${resultsTable}
      </body>
    </html>
  `;
}

// 解析 CSV 文件为 host 列表
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const hosts = [];

  // 假设CSV第一行是列标题
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(',');
    if (columns[0]) {
      hosts.push(columns[0].trim()); // 提取第一列作为host
    }
  }

  return hosts;
}

// 解析 JSON 文件为 host 列表
function parseJSON(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    if (Array.isArray(data)) {
      return data.map(item => item.host || '').filter(Boolean);
    }
    return [];
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

// 执行登录测试
async function runLoginTests(hosts) {
  const results = [];

  for (const host of hosts) {
    try {
      const loginUrl = `https://${host}/login`;
      const payload = new URLSearchParams({
        username: 'admin',
        password: 'admin',
      });
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json, text/plain, */*',
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: payload,
      });

      // 处理响应并判断登录是否成功
      if (response.status === 200) {
        const json = await response.json();
        if (json.success) {
          results.push({ host, result: 'Success' });
        } else {
          results.push({ host, result: 'Failed - Incorrect response' });
        }
      } else {
        results.push({ host, result: `Failed - Status ${response.status}` });
      }
    } catch (error) {
      results.push({ host, result: `Error - ${error.message}` });
    }
  }

  return results;
}
