"use client";

type CalendarExportButtonsProps = {
  type: "game" | "campaign";
  id: string;
  game: string;
  date: string;
  times: string[];
  description: string;
  location?: string;
  hostName?: string;
  meetingFrequency?: string;
  daysOfWeek?: string[];
};

export default function CalendarExportButtons({
  type,
  id,
  game,
  date,
  times,
  description,
  location,
  hostName,
  meetingFrequency,
  daysOfWeek,
}: CalendarExportButtonsProps) {
  const handleGoogleCalendar = () => {
    const eventDate = new Date(date);
    
    // Parse the first time slot if available
    let startTime = eventDate;
    let endTime = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); // Default 3 hours
    
    if (times && times.length > 0) {
      const firstTime = times[0];
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
    
    const formatGoogleDate = (date: Date): string => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    };
    
    const url = `${window.location.origin}/${type === 'game' ? 'games' : 'campaigns'}/${id}`;
    
    let eventDescription = description || `Join us for ${game}${type === 'campaign' ? ' campaign' : ''}`;
    if (times && times.length > 0) {
      eventDescription += `\n\nTime Slots: ${times.join(', ')}`;
    }
    if (type === 'campaign' && meetingFrequency) {
      eventDescription += `\n\nMeeting Frequency: ${meetingFrequency}`;
    }
    if (type === 'campaign' && daysOfWeek && daysOfWeek.length > 0) {
      eventDescription += `\n\nDays: ${daysOfWeek.join(', ')}`;
    }
    eventDescription += `\n\nView details: ${url}`;
    if (hostName) {
      eventDescription += `\n\nHost: ${hostName}`;
    }
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${game} - ${type === 'game' ? 'Game Session' : 'Campaign'}`,
      dates: `${formatGoogleDate(startTime)}/${formatGoogleDate(endTime)}`,
      details: eventDescription,
      location: location || '',
    });
    
    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  };
  
  const handleICalDownload = () => {
    window.location.href = `/api/${type === 'game' ? 'games' : 'campaigns'}/${id}/ical`;
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-slate-300">Add to Calendar</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleGoogleCalendar}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2z"/>
          </svg>
          Google Calendar
        </button>
        <button
          onClick={handleICalDownload}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          iCal / Outlook
        </button>
      </div>
    </div>
  );
}
