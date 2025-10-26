/**
 * Utility functions for generating calendar export files (iCal format)
 */

/**
 * Format a date to iCal format (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape special characters in iCal text fields
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Fold long lines according to iCal specification (max 75 octets per line)
 */
function foldLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) {
    return line;
  }
  
  const result: string[] = [];
  const currentLine = line.substring(0, maxLength);
  let remaining = line.substring(maxLength);
  
  result.push(currentLine);
  
  while (remaining.length > 0) {
    const chunk = remaining.substring(0, maxLength - 1); // -1 for the leading space
    result.push(' ' + chunk);
    remaining = remaining.substring(maxLength - 1);
  }
  
  return result.join('\r\n');
}

/**
 * Generate an iCal file for a game session
 */
export function generateGameSessionICal(
  session: {
    id: string;
    game: string;
    date: string;
    times: string[];
    description: string;
    location?: string;
  },
  hostName?: string
): string {
  const now = new Date();
  const eventDate = new Date(session.date);
  
  // Parse the first time slot if available
  let startTime = eventDate;
  let endTime = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); // Default 3 hours
  
  if (session.times && session.times.length > 0) {
    const firstTime = session.times[0];
    const timeMatch = firstTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const meridiem = timeMatch[3]?.toUpperCase();
      
      if (meridiem === 'PM' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }
      
      startTime = new Date(eventDate);
      startTime.setHours(hours, minutes, 0, 0);
      endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration
    }
  }
  
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thegatheringcall.com'}/games/${session.id}`;
  
  let description = session.description || `Join us for ${session.game}`;
  if (session.times && session.times.length > 0) {
    description += `\\n\\nTime Slots: ${session.times.join(', ')}`;
  }
  description += `\\n\\nView details: ${url}`;
  if (hostName) {
    description += `\\n\\nHost: ${hostName}`;
  }
  
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Gathering Call//Game Session//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    foldLine(`UID:game-${session.id}@thegatheringcall.com`),
    foldLine(`DTSTAMP:${formatICalDate(now)}`),
    foldLine(`DTSTART:${formatICalDate(startTime)}`),
    foldLine(`DTEND:${formatICalDate(endTime)}`),
    foldLine(`SUMMARY:${escapeICalText(session.game)} - Game Session`),
    foldLine(`DESCRIPTION:${escapeICalText(description)}`),
  ];
  
  if (session.location) {
    lines.push(foldLine(`LOCATION:${escapeICalText(session.location)}`));
  }
  
  lines.push(foldLine(`URL:${url}`));
  lines.push('STATUS:CONFIRMED');
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  
  return lines.join('\r\n');
}

/**
 * Generate an iCal file for a campaign
 */
export function generateCampaignICal(
  campaign: {
    id: string;
    game: string;
    date: string;
    times: string[];
    description: string;
    location?: string;
    meetingFrequency?: string;
    daysOfWeek?: string[];
  },
  hostName?: string
): string {
  const now = new Date();
  const eventDate = new Date(campaign.date);
  
  // Parse the first time slot if available
  let startTime = eventDate;
  let endTime = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); // Default 3 hours
  
  if (campaign.times && campaign.times.length > 0) {
    const firstTime = campaign.times[0];
    const timeMatch = firstTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const meridiem = timeMatch[3]?.toUpperCase();
      
      if (meridiem === 'PM' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }
      
      startTime = new Date(eventDate);
      startTime.setHours(hours, minutes, 0, 0);
      endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration
    }
  }
  
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thegatheringcall.com'}/campaigns/${campaign.id}`;
  
  let description = campaign.description || `Join us for ${campaign.game} campaign`;
  if (campaign.times && campaign.times.length > 0) {
    description += `\\n\\nTime Slots: ${campaign.times.join(', ')}`;
  }
  if (campaign.meetingFrequency) {
    description += `\\n\\nMeeting Frequency: ${campaign.meetingFrequency}`;
  }
  if (campaign.daysOfWeek && campaign.daysOfWeek.length > 0) {
    description += `\\n\\nDays: ${campaign.daysOfWeek.join(', ')}`;
  }
  description += `\\n\\nView details: ${url}`;
  if (hostName) {
    description += `\\n\\nHost: ${hostName}`;
  }
  
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Gathering Call//Campaign//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    foldLine(`UID:campaign-${campaign.id}@thegatheringcall.com`),
    foldLine(`DTSTAMP:${formatICalDate(now)}`),
    foldLine(`DTSTART:${formatICalDate(startTime)}`),
    foldLine(`DTEND:${formatICalDate(endTime)}`),
    foldLine(`SUMMARY:${escapeICalText(campaign.game)} - Campaign`),
    foldLine(`DESCRIPTION:${escapeICalText(description)}`),
  ];
  
  if (campaign.location) {
    lines.push(foldLine(`LOCATION:${escapeICalText(campaign.location)}`));
  }
  
  lines.push(foldLine(`URL:${url}`));
  lines.push('STATUS:CONFIRMED');
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  
  return lines.join('\r\n');
}

/**
 * Generate a Google Calendar URL for a game session
 */
export function generateGameSessionGoogleCalendarUrl(
  session: {
    id: string;
    game: string;
    date: string;
    times: string[];
    description: string;
    location?: string;
  },
  hostName?: string
): string {
  const eventDate = new Date(session.date);
  
  // Parse the first time slot if available
  let startTime = eventDate;
  let endTime = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); // Default 3 hours
  
  if (session.times && session.times.length > 0) {
    const firstTime = session.times[0];
    const timeMatch = firstTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const meridiem = timeMatch[3]?.toUpperCase();
      
      if (meridiem === 'PM' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }
      
      startTime = new Date(eventDate);
      startTime.setHours(hours, minutes, 0, 0);
      endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);
    }
  }
  
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thegatheringcall.com'}/games/${session.id}`;
  
  let description = session.description || `Join us for ${session.game}`;
  if (session.times && session.times.length > 0) {
    description += `\n\nTime Slots: ${session.times.join(', ')}`;
  }
  description += `\n\nView details: ${url}`;
  if (hostName) {
    description += `\n\nHost: ${hostName}`;
  }
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${session.game} - Game Session`,
    dates: `${formatICalDate(startTime).replace(/[-:]/g, '')}/${formatICalDate(endTime).replace(/[-:]/g, '')}`,
    details: description,
    location: session.location || '',
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate a Google Calendar URL for a campaign
 */
export function generateCampaignGoogleCalendarUrl(
  campaign: {
    id: string;
    game: string;
    date: string;
    times: string[];
    description: string;
    location?: string;
    meetingFrequency?: string;
    daysOfWeek?: string[];
  },
  hostName?: string
): string {
  const eventDate = new Date(campaign.date);
  
  // Parse the first time slot if available
  let startTime = eventDate;
  let endTime = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); // Default 3 hours
  
  if (campaign.times && campaign.times.length > 0) {
    const firstTime = campaign.times[0];
    const timeMatch = firstTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const meridiem = timeMatch[3]?.toUpperCase();
      
      if (meridiem === 'PM' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }
      
      startTime = new Date(eventDate);
      startTime.setHours(hours, minutes, 0, 0);
      endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);
    }
  }
  
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thegatheringcall.com'}/campaigns/${campaign.id}`;
  
  let description = campaign.description || `Join us for ${campaign.game} campaign`;
  if (campaign.times && campaign.times.length > 0) {
    description += `\n\nTime Slots: ${campaign.times.join(', ')}`;
  }
  if (campaign.meetingFrequency) {
    description += `\n\nMeeting Frequency: ${campaign.meetingFrequency}`;
  }
  if (campaign.daysOfWeek && campaign.daysOfWeek.length > 0) {
    description += `\n\nDays: ${campaign.daysOfWeek.join(', ')}`;
  }
  description += `\n\nView details: ${url}`;
  if (hostName) {
    description += `\n\nHost: ${hostName}`;
  }
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${campaign.game} - Campaign`,
    dates: `${formatICalDate(startTime).replace(/[-:]/g, '')}/${formatICalDate(endTime).replace(/[-:]/g, '')}`,
    details: description,
    location: campaign.location || '',
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
