import type { SVGProps } from 'react';

type IconName =
  | 'arrow-right'
  | 'book'
  | 'bell'
  | 'check'
  | 'chevron-right'
  | 'clipboard'
  | 'close'
  | 'code'
  | 'eye'
  | 'eye-off'
  | 'gauge'
  | 'home'
  | 'layers'
  | 'lock'
  | 'logout'
  | 'menu'
  | 'plus'
  | 'project'
  | 'repeat'
  | 'spark'
  | 'user'
  | 'users'
  | 'wifi'
  | 'wifi-off';

const paths: Record<IconName, React.ReactNode> = {
  'arrow-right': <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  'chevron-right': <path d="m9 18 6-6-6-6"/>,
  clipboard: <><rect width="14" height="18" x="5" y="3" rx="2"/><path d="M9 3V1h6v2M9 8h6M9 12h4"/></>,
  close: <><path d="M18 6 6 18M6 6l12 12"/></>,
  code: <><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14"/></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  'eye-off': <><path d="m3 3 18 18M10.6 10.6A2 2 0 0 0 13.4 13.4M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.1 3.1M6.6 6.6C3.6 8.5 2 12 2 12s3.5 7 10 7a10.5 10.5 0 0 0 4-.8"/></>,
  gauge: <><path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 14 4-4M4 18h16"/></>,
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
  layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>,
  lock: <><rect width="16" height="12" x="4" y="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  project: <><path d="M4 7h16v12H4zM8 7V4h8v3"/><path d="M4 12h16"/></>,
  repeat: <><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></>,
  spark: <><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
  wifi: <><path d="M5 12.6a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r="1"/></>,
  'wifi-off': <><path d="m3 3 18 18M8.5 16a5 5 0 0 1 4.5-1.3M5 12.6a10 10 0 0 1 3-1.8M14.5 11a10 10 0 0 1 4.5 1.6"/><circle cx="12" cy="20" r="1"/></>,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {paths[name]}
    </svg>
  );
}
