/**
 * Wedding Photo Upload Backend
 * 
 * Deploy this as a Google Apps Script Web App.
 * Guests upload photos through the website — they never access
 * the Drive folder directly, so they CANNOT delete anything.
 * 
 * SETUP:
 * 1. Open the Google Drive folder you want photos saved to
 * 2. Copy the folder ID from the URL (e.g., "1ZGqJb8DmSGUv2WwKPJGOmFkZeezBrkWf")
 * 3. Paste it as FOLDER_ID below
 * 4. Deploy: Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL and paste into index.html
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
    
    // Handle single file upload
    if (e.parameter.file) {
      const blob = e.parameter.file;
      const file = folder.createFile(blob);
      file.setDescription('Uploaded by wedding guest on ' + new Date().toISOString());
      return respond({ success: true, name: file.getName() });
    }
    
    // Handle multipart file upload
    if (e.postData && e.postData.type && e.postData.type.indexOf('multipart') !== -1) {
      const data = e.postData.contents;
      // Parse boundary and extract file
      const boundary = e.postData.type.split('boundary=')[1];
      if (boundary) {
        const parts = data.split('--' + boundary);
        for (let part of parts) {
          if (part.indexOf('filename') !== -1) {
            const match = part.match(/filename="(.+)"/);
            const contentType = part.match(/Content-Type: (.+)/);
            // Extract binary content
            const contentStart = part.indexOf('\r\n\r\n') + 4;
            const content = part.substring(contentStart, part.lastIndexOf('\r\n'));
            if (content) {
              const blob = Utilities.newBlob(content, contentType ? contentType[1] : 'image/jpeg', match ? match[1] : 'photo.jpg');
              folder.createFile(blob);
            }
          }
        }
      }
      return respond({ success: true, message: 'Files uploaded' });
    }
    
    // Handle FormData upload (simplified)
    // Google Apps Script receives FormData as individual parameters
    // If the file came through as a blob parameter
    const keys = Object.keys(e.parameter);
    let uploaded = false;
    
    for (let key of keys) {
      const value = e.parameter[key];
      if (value && typeof value === 'object' && value.bytes) {
        const file = folder.createFile(value);
        file.setDescription('Uploaded by wedding guest on ' + new Date().toISOString());
        uploaded = true;
      }
    }
    
    if (uploaded) {
      return respond({ success: true, message: 'Files uploaded successfully' });
    }
    
    return respond({ success: false, error: 'No file found in request' });
    
  } catch (err) {
    return respond({ success: false, error: err.toString() });
  }
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
