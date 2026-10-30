// Inline SVG icon set: one stroke weight (1.75), currentColor, no icon fonts (DESIGN.md §3.4).

const PATHS = {
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowUpRight: 'M7 17 17 7M8 7h9v9',
  check: 'M5 12.5 10 17.5 19 7.5',
  close: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  monitor: 'M3 5h18v11H3zM8 20h8M12 16v4',
  bag: 'M5 8h14l-1 12H6L5 8zM9 8a3 3 0 0 1 6 0',
  layers: 'M12 3 2 8l10 5 10-5-10-5zM2 13l10 5 10-5M2 17.5 12 22.5l10-5',
  zap: 'M13 2 4 14h7l-1 8 9-12h-7l1-8z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  megaphone: 'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  whatsapp: 'M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.8A8.5 8.5 0 1 1 20.5 11.6zM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9c-1-.4-2.4-1.8-2.8-2.8l.9-1-1-2L9 8.5z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3zM9 12l2 2 4-4',
  gauge: 'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM13.5 10.5 17 7M4 18a9 9 0 1 1 16 0',
  pen: 'M15 4l5 5L9 20H4v-5L15 4z',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h13',
  code: 'M8 7 3 12l5 5M16 7l5 5-5 5M13.5 4l-3 16',
  file: 'M6 3h8l5 5v13H6zM14 3v5h5',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
  linkedin: 'M4 9h3v11H4zM5.5 4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM10 9h3v1.6c.6-1 1.8-1.9 3.6-1.9C19.5 8.7 20 10.6 20 13v7h-3v-6c0-1.6-.3-2.8-1.8-2.8S13 12.3 13 14v6h-3z',
  tiktok: 'M14 3v11.5a3.5 3.5 0 1 1-3-3.46M14 3c.4 2.6 2 4.2 4.5 4.5',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.5',
  alert: 'M12 4 2 20h20L12 4zM12 10v4M12 17v.5',
  calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  refresh: 'M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4',
} as const

export type IconName = keyof typeof PATHS

interface IconProps {
  name: IconName
  size?: number
  className?: string
  title?: string
}

export function Icon({ name, size = 20, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  )
}
