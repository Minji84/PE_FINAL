const https = require('https');
const fs = require('fs');

// 설정: 검색할 키워드들
const SEARCH_QUERIES = [
  "ArcelorMittal Europe strategy news",
  "Green Steel projects in Europe",
  "EU CBAM regulation steel impact",
  "POSCO Europe market trends",
  "European steel price forecast"
];

// 이메일 설정
const EMAIL_RECIPIENTS = process.env.EMAIL_TO; 

// 1. 검색 함수 (Google Serper API 사용)
async function search(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q: query,
      gl: "de", // 독일 기준 검색
      hl: "en",
      num: 10,  // 키워드당 10개
      tbs: "qdr:d" // 지난 24시간 이내 뉴스만
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
    from: `"POSCO Strategy Bot" <${process.env.EMAIL_USER}>`,
    to: EMAIL_RECIPIENTS,
    subject: `[Daily] POSCO Europe Strategy Report - ${dateStr}`,
    html: `<h3>일일 전략 리포트 (${dateStr})</h3><p>금일 수집된 유럽 철강 시장 주요 뉴스입니다.</p>`,
    attachments: [{ filename: `Report_${dateStr}.xls`, content: excelContent }]
  });
  console.log("Email sent!");
}

// 실행
async function run() {
  try {
    if (!process.env.SERPER_API_KEY || !process.env.EMAIL_USER) {
      console.log("필수 설정(Secrets)이 없습니다. GitHub Settings를 확인하세요.");
      return;
    }
    
    let allResults = [];
    for (const query of SEARCH_QUERIES) {
      console.log(`Searching: ${query}`);
      const res = await search(query);
      allResults = [...allResults, ...res];
    }
    
    // 중복 제거
    const unique = Array.from(new Map(allResults.map(item => [item.link, item])).values());
    
    if (unique.length > 0) {
      await sendEmail(generateExcelContent(unique));
    } else {
      console.log("새로운 뉴스가 없습니다.");
    }
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}

run();