/**
 * Wedding Photo Upload Backend
 * 
 * Guests upload photos through the website — they never access
 * the Drive folder directly, so they CANNOT see or delete anything.
 * 
 * SETUP:
 * 1. Open the Google Drive folder you want photos saved to
 * 2. Copy the folder ID from the URL and paste it as FOLDER_ID below
 * 3. Deploy: Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web App URL and paste into index.html
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
    let uploadedCount = 0;

    // Handle file upload from FormData
    if (e.parameter && e.parameter.files) {
      const blobs = e.parameter.files;
      if (Array.isArray(blobs)) {
        for (let blob of blobs) {
          const file = folder.createFile(blob);
          file.setDescription('Uploaded by wedding guest on ' + new Date().toISOString());
          uploadedCount++;
        }
      } else {
        const file = folder.createFile(blobs);
        file.setDescription('Uploaded by wedding guest on ' + new Date().toISOString());
        uploadedCount++;
      }
    }

    // Handle single blob upload
    if (e.postData && e.postData.contents && e.postData.type) {
      // Parse multipart form data
      const boundary = e.postData.type.split('boundary=')[1];
      if (boundary) {
        const parts = e.postData.contents.split('--' + boundary);
        for (let part of parts) {
          if (part.indexOf('filename') !== -1 && part.indexOf('Content-Type:') !== -1) {
            const nameMatch = part.match(/filename="(.+)"/);
            const typeMatch = part.match(/Content-Type:\s*(.+)/);
            const contentStart = part.indexOf('\r\n\r\n') + 4;
            if (contentStart > 3) {
              const content = part.substring(contentStart, part.lastIndexOf('\r\n'));
              const fileName = nameMatch ? nameMatch[1] : 'photo_' + Date.now() + '.jpg';
              const contentType = typeMatch ? typeMatch[1].trim() : 'image/jpeg';
              if (content) {
                const blob = Utilities.newBlob(content, contentType, fileName);
                folder.createFile(blob);
                uploadedCount++;
              }
            }
          }
        }
      }
    }

    if (uploadedCount > 0) {
      return respond({ success: true, count: uploadedCount, message: uploadedCount + ' file(s) uploaded successfully' });
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
