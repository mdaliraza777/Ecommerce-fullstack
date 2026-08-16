import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {item.to ? (
            <Link to={item.to} className="hover:text-slate-900 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-slate-700 font-medium">{item.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
        </div>
      ))}
    </nav>
  );
}

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function SectionTitle({ title, subtitle, icon: Icon, action }: SectionTitleProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-slate-700" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
