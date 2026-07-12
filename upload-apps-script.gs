const FOLDER_ID = '1ZGqJb8DmSGUv2WwKPJGOmFkZeezBrkWf';

function doGet() {
  var html = '<form method="POST" enctype="multipart/form-data"><input type="file" name="file" /><input type="submit" /></form>';
  return HtmlService.createHtmlOutput(html);
}

function doPost(e) {
  try {
    var folder = DriveApp.getFolderById(FOLDER_ID);

    // Check for the blob in e.parameter
    if (e.parameter.file && e.parameter.file.getBytes) {
      var blob = e.parameter.file;
      folder.createFile(blob).setDescription('Uploaded ' + new Date().toISOString());
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'File saved: ' + blob.getName() }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Fallback: check all params  
    var keys = Object.keys(e.parameter);
    for (var i = 0; i < keys.length; i++) {
      var val = e.parameter[keys[i]];
      if (val && typeof val === 'object' && val.getBytes) {
        folder.createFile(val).setDescription('Uploaded ' + new Date().toISOString());
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'File saved: ' + val.getName() }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Debug: return what we received
    var info = { keys: keys, types: [], hasPostData: !!e.postData };
    for (var j = 0; j < keys.length; j++) {
      info.types.push(typeof e.parameter[keys[j]]);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'No file blob found', debug: info }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function testDrive() {
  var f = DriveApp.getFolderById(FOLDER_ID);
  Logger.log('OK: ' + f.getName());
}
