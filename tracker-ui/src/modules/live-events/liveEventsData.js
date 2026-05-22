export const EVENT_SOURCES = [
  {
    id: 'raw',
    label: 'tarkovdata raw',
    url: 'https://raw.githubusercontent.com/tarkov-dev/tarkovdata/master/live-events.json'
  },
  {
    id: 'jsdelivr',
    label: 'tarkovdata CDN',
    url: 'https://cdn.jsdelivr.net/gh/tarkov-dev/tarkovdata@master/live-events.json'
  }
];

export const FALLBACK_EVENTS = [
  {
    id: 'fallback-events-wiki',
    titleKey: 'liveEvents.fallback.title',
    descriptionKey: 'liveEvents.fallback.description',
    type: 'fallback',
    link: 'https://escapefromtarkov.fandom.com/wiki/Events',
    source: 'FALLBACK',
    status: 'reference'
  }
];

export const VERIFIED_MANUAL_EVENTS = [
  {
    id: 'verified-full-speed-ahead-2026-05',
    title: 'Full Speed Ahead',
    descriptionKey: 'liveEvents.manual.fullSpeedAhead.description',
    type: 'event',
    startDate: '2026-05-15T00:00:00Z',
    endDate: '2026-05-21T23:59:59Z',
    link: 'https://www.tarkovhead.com/en/news/new-full-speed-ahead-event-with-quest-walkthroughs-11',
    source: 'VERIFIED_MANUAL',
    active: true
  }
];
