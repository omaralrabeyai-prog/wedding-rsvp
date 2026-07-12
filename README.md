# Wedding RSVP Website

A simple, elegant wedding invitation website with Google Sheets–backed RSVP functionality. Costs zero dollars to run.

## How It Works

```
Guest's browser             Google Apps Script             Google Sheet
     │                             │                            │
     │── POST (JSON) ─────────────>│                            │
     │                             │── append row ────────────>│
     │<── 200 / success ──────────│                            │
     │                             │                            │
     │           You open the sheet directly to check RSVPs    │
```

- **No database to set up.** The Google Sheet IS your database.
- **No server costs.** Google Apps Script handles submissions for free.
- **No account required for guests.** They just fill the form on your site.

---

## Setup Guide

### Step 1: Create the Google Sheet

1. Go to [sheets.new](https://sheets.new) — this creates a blank spreadsheet.
2. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
   ```
3. Keep this tab open — you'll need it.

### Step 2: Deploy the Apps Script

1. In your sheet, go to **Extensions → Apps Script**.
2. Delete the default `function myFunction() {}` code.
3. Open `apps-script.gs` from this project and paste the entire contents.
4. Replace `YOUR_SPREADSHEET_ID_HERE` on line 20 with the ID you copied.
5. Click **Deploy → New Deployment**.
   - **Type:** Web App
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Click **Deploy**.
   - You may need to review permissions (it'll ask to access your Google Sheet).
   - This is safe — the script only writes to your specific sheet.
7. **Copy the Web App URL** that appears. It looks like:
   ```
   https://script.google.com/macros/s/ABCDEF12345/exec
   ```

### Step 3: Connect the Website

1. Open `index.html` from this project.
2. Search for `YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` (around line 247).
3. Replace it with the URL you copied in Step 2.7.
4. Save the file.

### Step 4: Host the Website

You have free options:

**Option A: GitHub Pages (recommended)**
```bash
# Create a new repo on GitHub, then:
git init
git add .
git commit -m "Wedding RSVP site"
git remote add origin https://github.com/YOUR_USERNAME/wedding-rsvp.git
git push -u origin main
```
Then go to Settings → Pages → deploy from `main` branch / `root` folder.

**Option B: Netlify (drag and drop)**
1. Go to [netlify.com](https://netlify.com).
2. Drag the `wedding-rsvp` folder onto the upload area.
3. Done. You'll get a URL like `wedding-rsvp.netlify.app`.

**Option C: Local testing (no hosting)**
```bash
# Open directly (works but some email clients won't render it)
open index.html

# Better: use Python's built-in server
python3 -m http.server 8000
# Then open http://localhost:8000
```

---

## Testing

Before sharing with guests:

1. **Open the site** locally or from your hosted URL.
2. **Fill out the RSVP form** as if you're a guest.
3. **Submit** — you should see a success message.
4. **Check your Google Sheet** — a new row should appear with the data.
5. **Repeat** with different options (attending yes, no, various guest counts).

If submissions aren't showing up:
- Open the Apps Script editor, go to **Executions** in the sidebar, and check for errors.
- Make sure the Web App URL in `index.html` is pasted correctly (no trailing slash).
- Make sure the sheet ID in `apps-script.gs` is correct.

---

## Customizing the Website

Open `index.html` and find the bracketed `[placeholders]` to replace:

| Placeholder | What to put |
|-------------|-------------|
| `[Name] & [Name]` | Your names |
| `[Date] · [Location]` | Wedding date and city |
| `[Day], [Month] [Date], [Year]` | Full date |
| `[Venue Name]` | Venue name |
| `[Address]` | Venue address |
| `[Dress Code]` | e.g. Semi-Formal, Black Tie |
| `[Time]` | Event times in the schedule |
| `[RSVP Deadline]` | When guests should respond by |

The "Our Story" section has placeholder text — replace it with your own story.

---

## File Structure

```
wedding-rsvp/
├── index.html        # The wedding website (edit to customize)
├── apps-script.gs    # Google Apps Script backend (deploy in Google's editor)
├── css/              # Reserved for additional stylesheets
├── js/               # Reserved for additional scripts
└── README.md         # This file
```

---

## Checking RSVPs

Once guests start submitting:
1. Open your Google Sheet directly.
2. Each submission is a new row.
3. Columns: Timestamp, Name(s), Email, Attending, Guests, Dietary, Message, Submitted At.

You can sort, filter, or add notes directly in the sheet.
