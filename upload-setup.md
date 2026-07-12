/**
 * BEHIND-THE-SCENES: Google Drive Picker Setup Instructions
 * ===========================================================
 * 
 * This enables direct upload to Google Drive with NO file size limits.
 * Files go straight to your folder — Apps Script is NOT involved.
 * 
 * SETUP:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project (or select existing)
 * 3. Enable "Google Drive API"
 * 4. Go to "APIs & Services" → "Credentials"
 * 5. Create OAuth 2.0 Client ID → "Web application"
 * 6. Add "https://omaralrabeyai-prog.github.io" to Authorized JavaScript origins
 * 7. Copy the Client ID
 * 8. Paste it below and deploy this page
 * 
 * The Google Picker shows a file selector → user picks a file →
 * it uploads DIRECTLY to your Drive folder. No size limits!
 */

// ── CONFIG ──
const DRIVE_FOLDER_ID = '1ZGqJb8DmSGUv2WwKPJGOmFkZeezBrkWf';
const API_KEY = 'YOUR_API_KEY';
const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const APP_ID = 'YOUR_GOOGLE_CLOUD_PROJECT_ID';
