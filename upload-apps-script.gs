/**
 * Wedding Photo Upload Backend (Simplified)
 * Guests upload through the website — never access the folder.
 */

const FOLDER_ID = '1ZGqJb8DmSGUv2WwKPJGOmFkZeezBrkWf';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Upload endpoint ready' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    let count = 0;

    // Loop through all parameters — any blob is a file
    const keys = Object.keys(e.parameter);
    for (let key of keys) {
      const val = e.parameter[key];
      // In Apps Script, uploaded files come as Blob objects
      if (val && typeof val === 'object' && val.getBytes) {
        folder.createFile(val).setDescription('Wedding upload ' + new Date().toISOString());
        count++;
      }
    }

    // Fallback: if postData exists, try to create a blob from it
    if (count === 0 && e.postData && e.postData.contents) {
      const blob = Utilities.newBlob(
        e.postData.contents,
        e.postData.type || 'application/octet-stream',
        'photo_' + Date.now() + '.jpg'
      );
      folder.createFile(blob);
      count++;
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: count > 0, count: count, message: count + ' file(s) uploaded' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
