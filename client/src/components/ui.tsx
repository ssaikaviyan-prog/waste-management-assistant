import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({ className = "", variant = "primary", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>;
}

export function Badge({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "cyan" | "blue" | "red" | "gray" }) {
  return <span className={`badge badge-${tone}`}><span className="badge-dot" />{children}</span>;
}

export function SectionHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-header">
    <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>
    {action && <div className="section-header-action">{action}</div>}
  </div>;
}

export function MetricCard({ icon, label, value, note, tone = "green" }: { icon: ReactNode; label: string; value: string; note: string; tone?: "green" | "cyan" | "blue" | "red" }) {
  return <div className="metric-card">
    <div className={`metric-icon metric-${tone}`}>{icon}</div>
    <div><div className="metric-value">{value}</div><div className="metric-label">{label}</div><div className="metric-note">{note}</div></div>
  </div>;
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}
