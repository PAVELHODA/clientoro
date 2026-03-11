import { usePathname } from 'next/navigation';

export function useActive(path: string) {
  const pathname = usePathname();
  return pathname.startsWith(path);
}
