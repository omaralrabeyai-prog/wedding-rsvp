const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'RSVPs';

function doPost(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  try {
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error('No data received.');
    }
    if (!data.name || !data.attending) {
      throw new Error('Missing required fields: name and attending status.');
    }
    const result = appendToSheet(data);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'RSVP received!', row: result }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

function doGet(e) {
  const headers = { 'Access-Control-Allow-Origin': '*' };
  if (e && e.parameter && e.parameter.sheet !== undefined) {
    return HtmlService.createHtmlOutput(
      '<h2>RSVP Backend is running.</h2>' +
      '<p>Open your <a href="https://docs.google.com/spreadsheets/d/' +
      SPREADSHEET_ID + '" target="_blank">Google Sheet</a> to view responses.</p>'
    );
  }
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'online',
      sheetId: SPREADSHEET_ID,
      sheetName: SHEET_NAME,
      message: 'RSVP endpoint is active. POST to submit RSVPs.'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}

function appendToSheet(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  const headers = ['Timestamp', 'Name(s)', 'Attending', 'Dietary', 'Message', 'Submitted At (ISO)'];
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  }
  const now = new Date();
  const row = [
    now,
    data.name || '',
    data.attending || '',
    data.dietary || '',
    data.message || '',
    data.submittedAt || ''
  ];
  sheet.appendRow(row);
  sheet.autoResizeColumns(1, headers.length);
  return sheet.getLastRow();
}

function setupSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  const headers = ['Timestamp', 'Name(s)', 'Attending', 'Dietary', 'Message', 'Submitted At (ISO)'];
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.autoResizeColumns(1, headers.length);
    return 'Sheet created with headers.';
  } else {
    return 'Sheet already has data. Headers not overwritten.';
  }
}
