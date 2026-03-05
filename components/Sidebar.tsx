import Link from 'next/link';
import { BarChart3, Gauge, Settings, TrendingUp, Tv, LineChart } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: Gauge },
  { href: '/series', label: 'Series', icon: Tv },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/growth', label: 'Growth', icon: TrendingUp },
  { href: '/forecast', label: 'Forecast', icon: LineChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="border-r border-slate-800/80 bg-slate-950/80 p-5">
      <h1 className="mb-6 text-xl font-semibold text-purple-300">Netflix Series Analytics</h1>
      <nav className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-slate-300 transition hover:bg-slate-900 hover:text-purple-200">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
