import { CENSUS_2027, type IsoDate } from '@/data/census2027';

import { shiftDays } from './dates';
import type { ResolvedSchedule } from './schedule-lookup';

const compact = (date: IsoDate): string => date.replaceAll('-', '');

/** RFC 5545 text escaping. */
const escapeText = (value: string): string =>
  value
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replaceAll('\n', '\\n');

/** RFC 5545 requires CRLF line endings and lines folded at 75 octets. */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [line.slice(0, 75)];
  for (let index = 75; index < line.length; index += 74) {
    parts.push(` ${line.slice(index, index + 74)}`);
  }
  return parts.join('\r\n');
}

interface AllDayEvent {
  readonly uid: string;
  readonly summary: string;
  readonly description: string;
  readonly start: IsoDate;
  /** Inclusive last day; DTEND is written as the following day, per the spec. */
  readonly endInclusive: IsoDate;
}

function renderEvent(event: AllDayEvent, stamp: string): readonly string[] {
  return [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(event.start)}`,
    `DTEND;VALUE=DATE:${compact(shiftDays(event.endInclusive, 1))}`,
    `SUMMARY:${escapeText(event.summary)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
  ];
}

function eventsFor(schedule: ResolvedSchedule): readonly AllDayEvent[] {
  const { territory, selfEnumeration, houselisting } = schedule;
  const events: AllDayEvent[] = [];
  const portal = `Official portal: ${CENSUS_2027.officialPortalUrl}`;

  if (selfEnumeration !== null) {
    events.push({
      uid: `self-${territory.code}@janganana-sahayak`,
      summary: `Census 2027 self-enumeration opens (${territory.name})`,
      description: `The self-enumeration window for ${territory.name}. ${portal}`,
      start: selfEnumeration.start,
      endInclusive: selfEnumeration.end,
    });
  }
  if (houselisting !== null) {
    events.push({
      uid: `hlo-${territory.code}@janganana-sahayak`,
      summary: `Census 2027 houselisting visits (${territory.name})`,
      description: `An enumerator may visit during this window if you did not self-enumerate. ${portal}`,
      start: houselisting.start,
      endInclusive: houselisting.end,
    });
  }
  return events;
}

/**
 * Builds a calendar of reminders for one State/UT. Contains only public census
 * dates: no name, no location, nothing identifying the person downloading it.
 */
export function buildScheduleIcs(schedule: ResolvedSchedule, stampInstant: Date): string {
  const stamp = `${stampInstant.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JanGanana Sahayak//Census 2027 reminders//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...eventsFor(schedule).flatMap((event) => renderEvent(event, stamp)),
    'END:VCALENDAR',
  ];
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}

export const icsFileName = (schedule: ResolvedSchedule): string =>
  `census-2027-${schedule.territory.code.toLowerCase()}.ics`;
