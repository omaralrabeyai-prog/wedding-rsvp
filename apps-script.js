/**
 * Wedding RSVP — Google Apps Script Backend
 * ===========================================
 *
 * WHAT THIS DOES:
 *   Receives RSVP form submissions from your wedding website
 *   and writes them into a Google Sheet so you can view everything
 *   in a simple spreadsheet.
 *
 * SETUP INSTRUCTIONS:
 *   1. Create a new Google Sheet (or use an existing one).
 *   2. Go to Extensions → Apps Script.
 *   3. Delete any default code and paste this entire file.
 *   4. Replace SPREADSHEET_ID below with your sheet's ID.
 *   5. Click Deploy → New Deployment → Web App.
 *   6. Set "Execute as" → Me, "Who has access" → Anyone.
 *   7. Click Deploy, copy the Web App URL.
 *   8. Paste that URL into your index.html (the APPS_SCRIPT_URL variable).
 *   9. Test by submitting the form.
 */

// ── CONFIGURATION ──
// Replace this with your Google Sheet's ID.
// Find it in the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
const SPREADSHEET_ID = '1Al70e4yvxUxkVxB9pUws4w00ulxu2aH9yC1DggzmT9A';

// Sheet tab name within the spreadsheet
const SHEET_NAME = 'RSVPs';

// ── DO POST (form submission handler) ──
function doPost(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    // Parse the incoming JSON body
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error('No data received.');
    }

    // Validate required fields
    if (!data.name || !data.attending) {
      throw new Error('Missing required fields: name and attending status.');
    }

    // Write to sheet
    const result = appendToSheet(data);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'RSVP received!',
        row: result
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// ── DO GET (optional: test endpoint) ──
function doGet(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*'
  };

  // If ?sheet=1 is passed, open the sheet in the browser
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

// ── SHEET OPERATIONS ──

/**
 * Appends an RSVP row to the Google Sheet.
 * Creates headers automatically if the sheet is empty.
 */
function appendToSheet(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Define columns (order matters — changing this will shift existing data)
  const headers = [
    'Timestamp',        // A
    'Name(s)',          // B
    'Email',            // C
    'Attending',        // D
    'Number of Guests', // E
    'Dietary',          // F
    'Message',          // G
    'Submitted At (ISO)' // H
  ];

  // Check if sheet is empty (row 1 is empty) and write headers
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight('bold');
  }

  // Build the row
  const now = new Date();
  const row = [
    now,                          // Timestamp
    data.name || '',              // Name(s)
    data.email || '',             // Email
    data.attending || '',         // Attending (yes/no)
    data.guests || '0',           // Number of guests
    data.dietary || '',           // Dietary restrictions
    data.message || '',           // Message
    data.submittedAt || ''        // ISO timestamp from browser
  ];

  // Append the row
  sheet.appendRow(row);

  // Auto-resize columns for readability
  sheet.autoResizeColumns(1, headers.length);

  return sheet.getLastRow();
}

/**
 * (Optional) Run this manually once from the Apps Script editor
 * to set up the sheet headers without waiting for a form submission.
 */
function setupSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  const headers = [
    'Timestamp',
    'Name(s)',
    'Email',
    'Attending',
    'Number of Guests',
    'Dietary',
    'Message',
    'Submitted At (ISO)'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight('bold');
    sheet.autoResizeColumns(1, headers.length);
    return 'Sheet created with headers.';
  } else {
    return 'Sheet already has data. Headers not overwritten.';
  }
}
