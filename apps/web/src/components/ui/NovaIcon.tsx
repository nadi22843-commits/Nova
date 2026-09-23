import type { SVGProps, ReactNode } from 'react';

export type NovaIconName =
  | 'logo' | 'search' | 'shorts' | 'heart' | 'heartFilled' | 'cart' | 'user' | 'plus'
  | 'car' | 'home' | 'electronics' | 'sofa' | 'hobby' | 'services' | 'work' | 'more'
  | 'location' | 'shield' | 'star' | 'bell' | 'filter';

type Props = SVGProps<SVGSVGElement> & { name: NovaIconName; size?: number };

export function NovaIcon({ name, size = 22, ...props }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  };

  const paths: Record<NovaIconName, ReactNode> = {
    logo: <><path d="M12 2.7 15.3 8.7 21.3 12l-6 3.3L12 21.3l-3.3-6L2.7 12l6-3.3L12 2.7Z"/><path d="M12 7.8 13.3 10.7 16.2 12l-2.9 1.3L12 16.2l-1.3-2.9L7.8 12l2.9-1.3L12 7.8Z"/></>,
    search: <><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 4.2 4.2"/></>,
    shorts: <><rect x="5" y="3.5" width="14" height="17" rx="4"/><path d="m10.4 8.4 5 3.6-5 3.6V8.4Z" fill="currentColor" stroke="none"/></>,
    heart: <path d="M20.8 4.9a5.4 5.4 0 0 0-7.6 0L12 6.1l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.5a5.4 5.4 0 0 0 0-7.6Z"/>,
    heartFilled: <path d="M20.8 4.9a5.4 5.4 0 0 0-7.6 0L12 6.1l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.5a5.4 5.4 0 0 0 0-7.6Z" fill="currentColor" stroke="currentColor"/>,
    cart: <><path d="M3.5 5h2l1.5 9.2a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 2-1.6L20 8H6"/><circle cx="9" cy="19.5" r="1" fill="currentColor"/><circle cx="17" cy="19.5" r="1" fill="currentColor"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    car: <><path d="m5 11 1.5-4h11l1.5 4"/><path d="M3.5 11h17v6h-17z"/><circle cx="7" cy="17" r="1.4" fill="currentColor"/><circle cx="17" cy="17" r="1.4" fill="currentColor"/></>,
    home: <><path d="m3.5 11 8.5-7 8.5 7"/><path d="M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6"/></>,
    electronics: <><rect x="3" y="5" width="13" height="10" rx="1.5"/><path d="M8 19h3M9.5 15v4"/><rect x="17" y="8" width="4" height="10" rx="1"/></>,
    sofa: <><path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11"/><path d="M4 10.5a2 2 0 0 0-2 2V17h20v-4.5a2 2 0 0 0-2-2"/><path d="M5 17v2M19 17v2"/></>,
    hobby: <><path d="M4 12.5h16M7.5 7.5h9l2 5H5.5l2-5Z"/><path d="M9 7.5V5h6v2.5"/><circle cx="8" cy="16.5" r="2"/><circle cx="16" cy="16.5" r="2"/></>,
    services: <><rect x="4" y="7" width="16" height="12" rx="2"/><path d="M9 7V5h6v2M4 12h16M10 12v2h4v-2"/></>,
    work: <><circle cx="12" cy="8" r="3"/><path d="M5.5 20c.7-4 2.9-6 6.5-6s5.8 2 6.5 6"/></>,
    more: <><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    shield: <><path d="M12 3 20 6v5c0 5.1-3.2 8.4-8 10-4.8-1.6-8-4.9-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
    bell: <><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></>,
    filter: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></>,
    star: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 3Z"/>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}
