// Icon set — single source for all icons used in the portal.
// All icons are 24x24 viewBox, current-color stroke, 1.75 default width.

const I = (path, opts = {}) => ({ size = 18, className = '', strokeWidth = 1.75, fill = 'none', ...rest } = {}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...opts}
    {...rest}
  >
    {path}
  </svg>
)

export const HomeIcon       = I(<><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></>)
export const BookIcon       = I(<><path d="M4 4h11a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4Z"/><path d="M19 16H8a4 4 0 0 0-4 4"/></>)
export const NewsIcon       = I(<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></>)
export const SkillsIcon     = I(<><path d="M12 3 4 7v6c0 4.5 3.4 7.5 8 8 4.6-.5 8-3.5 8-8V7Z"/><path d="m9 12 2 2 4-4"/></>)
export const PromptIcon     = I(<><path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4H8l-4 3v-4.4A8.4 8.4 0 1 1 21 11.5Z"/></>)
export const EventIcon      = I(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>)
export const TeamIcon       = I(<><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.4"/><path d="M14.5 20a4.5 4.5 0 0 1 7 0"/></>)
export const ArchIcon       = I(<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>)
export const SignalIcon     = I(<><path d="M3 12c2-3 5-5 9-5s7 2 9 5"/><path d="M6 15c1.5-2 3.5-3 6-3s4.5 1 6 3"/><circle cx="12" cy="18" r="1.4" fill="currentColor"/></>)

export const SearchIcon     = I(<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>)
export const BellIcon       = I(<><path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></>)
export const SettingsIcon   = I(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>)
export const SunIcon        = I(<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>)
export const MoonIcon       = I(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>)
export const ChevronRight   = I(<path d="m9 6 6 6-6 6"/>)
export const ChevronDown    = I(<path d="m6 9 6 6 6-6"/>)
export const PanelLeftIcon  = I(<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></>)
export const ArrowRight     = I(<><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></>)
export const ArrowUpRight   = I(<><path d="M7 17 17 7"/><path d="M8 7h9v9"/></>)
export const TrendUp        = I(<><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></>)
export const SparkleIcon    = I(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>)
export const PinIcon        = I(<><path d="M12 17v5"/><path d="M9 17h6l-1.4-3.5a2 2 0 0 1 .3-2.1L17 8.3a2 2 0 0 0-.3-3L15 3.5a2 2 0 0 0-2.8 0L9 6.6a2 2 0 0 1-2.1.4L3 5.5l8 8 1 1Z"/></>)
export const CommandIcon    = I(<path d="M9 6V4a3 3 0 1 0-3 3h2v10H6a3 3 0 1 0 3-3v-4h6v4a3 3 0 1 0 3-3h-2V7h2a3 3 0 1 0-3-3v2H9Z"/>)
export const PlusIcon       = I(<><path d="M12 5v14M5 12h14"/></>)
export const FilterIcon     = I(<path d="M3 5h18l-7 9v6l-4-2v-4Z"/>)
export const CustomizeIcon  = I(<><path d="M4 6h12"/><circle cx="18" cy="6" r="2"/><path d="M4 12h6"/><circle cx="14" cy="12" r="2"/><path d="M4 18h10"/><circle cx="18" cy="18" r="2"/></>)
