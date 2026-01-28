const https = require('https');
const fs = require('fs');

// 설정: 검색할 키워드들 (요청된 5가지)
const SEARCH_QUERIES = [
  "Automotive trend",
  "steel company trend",
  "electric vehicle",
  "energy",
  "AI"
];

// 이메일 설정 (지정된 수신자)
const EMAIL_RECIPIENTS = 'jewoong85@gmail.com'; 

// 1. 검색 함수 (Google Serper API 사용)
async function search(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q: query,
      gl: "de", // 유럽(독일) 기준 검색 결과
      hl: "en", // 언어는 영어
      num: 10,  // 키워드당 10개
      tbs: "qdr:d" // 지난 24시간 이내 뉴스만 (qdr:d = past 24h)
    });

    const options = {
      hostname: 'google.serper.dev',
      path: '/search',
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json.organic || []);
        } catch (e) {
          console.error("JSON Error:", e);
          resolve([]);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

// 2. 엑셀 파일 내용 생성 (HTML 형식 활용)
function generateExcelContent(results) {
  const tableRows = results.map((r, index) => {
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${r.source || 'Web'}</td>
        <td>${r.title}</td>
        <td>${r.snippet}</td>
        <td><a href="${r.link}">${r.link}</a></td>
        <td>${r.date || ''}</td>
      </tr>
    `;
  }).join('');

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8"></head>
    <body>
      <table border="1">
        <tr style="background-color: #4472C4; color: white;">
          <th>No</th><th>Source</th><th>Title</th><th>Snippet</th><th>Link</th><th>Date</th>
        </tr>
        ${tableRows}
      </table>
    </body>
    </html>
  `;
}

// 3. 이메일 발송 함수
async function sendEmail(excelContent) {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const dateStr = new Date().toISOString().slice(0,10);
  
  await transporter.sendMail({
    from: `"POSCO Market Watch" <${process.env.EMAIL_USER}>`,
    to: EMAIL_RECIPIENTS,
    subject: `[Daily] Market Trend Report (Automotive/Steel/EV/Energy/AI) - ${dateStr}`,
    html: `<h3>일일 마켓 트렌드 리포트 (${dateStr})</h3>
           <p>지정된 5대 키워드(Automotive trend, Steel trend, EV, Energy, AI)에 대한 지난 24시간 유럽 관련 뉴스입니다.</p>`,
    attachments: [{ filename: `Trend_Report_${dateStr}.xls`, content: excelContent }]
  });
  console.log(`Email sent to ${EMAIL_RECIPIENTS}`);
}

// 실행
async function run() {
  try {
    if (!process.env.SERPER_API_KEY || !process.env.EMAIL_USER) {
      console.log("필수 설정(Secrets: SERPER_API_KEY, EMAIL_USER, EMAIL_PASS)이 없습니다. GitHub Settings를 확인하세요.");
      return;
    }
    
    let allResults = [];
    for (const query of SEARCH_QUERIES) {
      console.log(`Searching: ${query}`);
      const res = await search(query);
      // 결과에 검색 키워드 태그 추가
      const taggedRes = res.map(item => ({ ...item, title: `[${query}] ${item.title}` }));
      allResults = [...allResults, ...taggedRes];
    }
    
    // 중복 제거
    const unique = Array.from(new Map(allResults.map(item => [item.link, item])).values());
    
    if (unique.length > 0) {
      await sendEmail(generateExcelContent(unique));
    } else {
      console.log("지난 24시간 동안 새로운 뉴스가 없습니다.");
    }
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}

run();
