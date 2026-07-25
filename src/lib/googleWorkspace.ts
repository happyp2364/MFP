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
