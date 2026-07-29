import { getCachedAccessToken } from './firebase';

export interface CalendarEventInput {
  summary: string;
  description: string;
  location?: string;
  startDateTime: string; // ISO string e.g. 2026-08-01T10:00:00+05:30
  endDateTime: string;   // ISO string e.g. 2026-08-01T11:00:00+05:30
}

export interface CalendarEventResult {
  id: string;
  htmlLink: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
}

export interface GmailSendInput {
  to: string;
  subject: string;
  bodyText: string;
}

export interface GmailSendResult {
  id: string;
  threadId: string;
  labelIds?: string[];
}

/**
 * Creates an event on the user's primary Google Calendar
 */
export async function createGoogleCalendarEvent(input: CalendarEventInput): Promise<CalendarEventResult> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Google OAuth Access Token missing. Please sign in with Google first.');
  }

  const payload = {
    summary: input.summary,
    description: input.description,
    location: input.location || 'Marudhar Fashion Point, Near Main Market, Pali, Rajasthan',
    start: {
      dateTime: input.startDateTime,
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: input.endDateTime,
      timeZone: 'Asia/Kolkata',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'email', minutes: 1440 },
      ],
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Google Calendar API Error:', errorData);
    throw new Error(errorData.error?.message || `Calendar API error (${response.status})`);
  }

  return await response.json();
}

/**
 * Fetches upcoming events from user's primary Google Calendar
 */
export async function listGoogleCalendarEvents(): Promise<CalendarEventResult[]> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Google OAuth Access Token missing.');
  }

  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(now)}&orderBy=startTime&singleEvents=true&maxResults=10`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to fetch calendar events');
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Encodes text into standard RFC 2822 base64url format for Gmail API
 */
function encodeBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends an email directly from the user's Gmail account
 */
export async function sendGmailMessage(input: GmailSendInput): Promise<GmailSendResult> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Google OAuth Access Token missing. Please sign in with Google first.');
  }

  const rawMessage = [
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    input.bodyText,
  ].join('\r\n');

  const encodedMessage = encodeBase64Url(rawMessage);

  const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Gmail API Send Error:', errorData);
    throw new Error(errorData.error?.message || `Gmail API error (${response.status})`);
  }

  return await response.json();
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
}

/**
 * Lists files created by or shared with this application in Google Drive
 */
export async function listGoogleDriveFiles(): Promise<DriveFileItem[]> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Google OAuth Access Token missing.');
  }

  const url = 'https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,webViewLink,thumbnailLink,createdTime)&pageSize=20&orderBy=createdTime%20desc';

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to list Google Drive files');
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Uploads a file (product image, measurement sheet, invoice PDF) directly to Google Drive
 */
export async function uploadFileToGoogleDrive(file: File): Promise<DriveFileItem> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Google OAuth Access Token missing. Please sign in with Google first.');
  }

  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', file);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,thumbnailLink,createdTime', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Google Drive Upload Error:', errorData);
    throw new Error(errorData.error?.message || `Drive Upload error (${response.status})`);
  }

  return await response.json();
}

/**
 * Ensures the Marudhar Backup folder exists and returns its ID
 */
export async function ensureMarudharBackupFolder(): Promise<string> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Google OAuth Access Token missing. Please sign in with Google first.');

  const folderName = 'Marudhar Fashion Point Backups';
  
  // Search for the folder
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(folderName)}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id)`;
  const searchRes = await fetch(searchUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create it
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  const createData = await createRes.json();
  if (!createRes.ok) {
    if (createRes.status === 401) throw new Error('Google Drive session expired. Please reconnect Drive.');
    throw new Error(createData.error?.message || 'Failed to create folder');
  }
  return createData.id;
}

/**
 * Uploads backup data to a specific folder
 */
export async function uploadBackupToDrive(jsonData: any, fileName: string, folderId: string): Promise<any> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Token missing');

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId]
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' }));

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Google Drive session expired. Please reconnect Drive.');
    const err = await response.json();
    throw new Error(err.error?.message || 'Upload failed');
  }

  return await response.json();
}

/**
 * Downloads file content from Drive
 */
export async function downloadBackupFromDrive(fileId: string): Promise<any> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Token missing');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Google Drive session expired. Please reconnect Drive.');
    throw new Error('Download failed');
  }
  return await response.json();
}

/**
 * Deletes a file from Drive
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Token missing');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok && response.status !== 404) {
    if (response.status === 401) throw new Error('Google Drive session expired. Please reconnect Drive.');
    throw new Error('Delete failed');
  }
}
