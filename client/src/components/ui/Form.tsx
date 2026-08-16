import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

const baseInput = "w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all";

const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

export function Input({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div>
      {label && <label className={labelClass}>{label}</label>}
      <input className={`${baseInput} ${error ? 'border-red-300 focus:border-red-400' : ''}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <div>
      {label && <label className={labelClass}>{label}</label>}
      <textarea className={`${baseInput} ${error ? 'border-red-300' : ''}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  return (
    <div>
      {label && <label className={labelClass}>{label}</label>}
      <select className={`${baseInput} ${error ? 'border-red-300' : ''}`} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', size = 'md', loading, fullWidth, children, className = '', disabled, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-700 active:bg-slate-800',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
      {children}
    </button>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {children}
    </span>
  );
}
