# Google Workspace Extension (OAuth for Personal Accounts)

Extension file location:
- `~/.pi/agent/extensions/google-workspace/index.ts`

Local OAuth credential storage:
- `~/.pi/agent/google-workspace/oauth.json`

## 1) Google Cloud Setup

1. Create a project in Google Cloud Console.
2. Enable these APIs:
   - **Google Drive API**
   - **Google Docs API**
   - **Google Slides API**
   - **Google Sheets API**
3. Configure the OAuth consent screen.
   - Add your account as a test user if your app is in testing mode.
4. Create an OAuth client.
   - Recommended: **Desktop app**
   - If you use **Web application**, add this redirect URI:
     - `http://127.0.0.1:53682/oauth2callback`

## 2) Initial Authentication in pi

1. Run `/reload` in pi.
2. Run `/gws-setup`.
3. Enter your Client ID and Client Secret.
4. Enter Redirect URI (default is recommended).
5. Sign in with Google and approve permissions.
6. On success, `oauth.json` is saved.

## 3) Available Tools

### Drive
- `google_drive_list`
- `google_drive_download`
- `google_drive_upload`
- `google_drive_create_folder`

### Docs
- `google_docs_read`
- `google_docs_create`
- `google_docs_append_text`
- `google_docs_replace_all_text`
- `google_docs_download` (saves local files in `pdf|docx|md|txt|rtf|odt|html_zip`)
  - `md` conversion preserves headings, lists, tables, and inline emphasis as much as possible.

### Sheets
- `google_sheets_create`
- `google_sheets_read`
- `google_sheets_update_values`

### Slides
- `google_slides_read`
- `google_slides_replace_text`

### Status
- `google_workspace_status`

### Download Example

`google_docs_download` accepts:
- `documentId`: Google Docs document ID
- `format`: `pdf` / `docx` / `md` / `txt` / `rtf` / `odt` / `html_zip`
- `outputPath` (optional): target local path (if omitted, it saves to the current working directory with an auto-generated name)

## 4) Sign Out

- Run `/gws-logout`

## Notes

- A `refresh_token` must be issued on first consent for automatic token refresh.
- If no `refresh_token` exists, run `/gws-setup` again.
- This version includes `drive` + `spreadsheets` scopes. If you have an older token, re-run `/gws-setup` and re-consent.
