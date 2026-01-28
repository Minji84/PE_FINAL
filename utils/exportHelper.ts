import { SearchResult } from '../types';

export const downloadSearchResultsExcel = (results: SearchResult[], query: string) => {
  if (!results || results.length === 0) return;

  // 1. Sort by Priority (Ascending: 1 -> 2 -> 3)
  const sortedResults = [...results].sort((a, b) => (a.priority || 3) - (b.priority || 3));

  // 2. Generate HTML Table for Excel
  // We use an HTML table structure which Excel can interpret as a worksheet.
  // This allows us to use styles (colors, fonts) unlike CSV.
  
  const tableRows = sortedResults.map((r, index) => {
    // Top 10 Highlighting Logic
    const isTop10 = index < 10;
    const rowStyle = isTop10 
      ? 'background-color: #FFF2CC; font-weight: bold; border: 1px solid #E2E8F0;' // Light Yellow for Top 10
      : 'border: 1px solid #E2E8F0;';
    
    const priorityLabel = r.priority === 1 ? 'Official (1)' : r.priority === 2 ? 'Industry (2)' : 'General (3)';
    const title = (r.koreanTitle || r.title || '');
    const snippet = (r.koreanSnippet || r.snippet || '');
    const source = (r.source || '');
    const category = r.category || 'Other';
    const date = r.date || '';

    return `
      <tr style="${rowStyle}">
        <td style="text-align: center;">${index + 1}</td>
        <td style="text-align: center;">${priorityLabel}</td>
        <td style="text-align: center;">${category}</td>
        <td style="text-align: center;">${date}</td>
        <td>${source}</td>
        <td>${title}</td>
        <td>${snippet}</td>
        <td><a href="${r.link}">${r.link}</a></td>
      </tr>
    `;
  }).join('');

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Strategy Report</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Malgun Gothic', 'Arial', sans-serif; }
        .header { background-color: #4472C4; color: white; font-weight: bold; text-align: center; }
        td { padding: 8px; vertical-align: middle; }
      </style>
    </head>
    <body>
      <table>
        <!-- Meta Info Row -->
        <tr>
          <td colspan="8" style="font-size: 16pt; font-weight: bold; background-color: #F8F9FA; padding: 20px;">
            POSCO Europe Strategy - Search Context: "${query}"
          </td>
        </tr>
        <tr>
          <td colspan="8" style="color: #666; font-style: italic;">
            Export Date: ${new Date().toLocaleString('ko-KR')} | Total Signals: ${sortedResults.length}
          </td>
        </tr>
        <tr></tr>
        
        <!-- Headers -->
        <tr class="header">
          <th width="50">Rank</th>
          <th width="120">Priority</th>
          <th width="100">Category</th>
          <th width="120">Date</th>
          <th width="150">Source</th>
          <th width="400">Title (KR)</th>
          <th width="500">Snippet (KR)</th>
          <th width="300">Original Link</th>
        </tr>
        
        <!-- Data -->
        ${tableRows}
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
  // Extension must be .xls for HTML-based Excel hack to open without warnings in most cases
  link.setAttribute('download', `POSCO_Strategy_Report_${dateStr}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyEmailReport = async (report: string, results: SearchResult[]) => {
  const date = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  
  // Extract only High Priority (Official) signals for the email summary
  const topSignals = results.filter(r => r.priority === 1).slice(0, 5);
  
  // Simple plain text formatter for email bodies
  const emailBody = `
[POSCO Europe] 일일 전략 보고 - ${date}

수신: 전략기획실 제위
발신: AI Strategy Agent

1. Executive Summary
--------------------------------------------------
${report ? report.replace(/[*#]/g, '').slice(0, 800) + '...' : '분석된 보고서 내용이 없습니다.'}

(전체 분석 내용은 대시보드를 확인하십시오.)


2. Critical Alerts (Official & High Priority)
--------------------------------------------------
${topSignals.length > 0 
    ? topSignals.map(s => `• [${s.category}] ${s.koreanTitle}\n  - 출처: ${s.source} | 링크: ${s.link}`).join('\n\n')
    : '특이 사항 없음.'}

--------------------------------------------------
* 본 메일은 POSCO Europe AI Agent에 의해 자동 생성되었습니다.
`.trim();

  try {
    await navigator.clipboard.writeText(emailBody);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};
