import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Activity, ArrowUpRight, Bot, BookOpen, Camera, FileWarning, Info, Leaf, Menu, MessageCircle, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

const navigation = [
  { label: "Dashboard", href: "/", icon: Activity },
  { label: "AI Assistant", href: "/assistant", icon: MessageCircle },
  { label: "Classify Waste", href: "/classify", icon: Camera },
  { label: "Report Waste", href: "/report", icon: FileWarning },
  { label: "Waste Guide", href: "/guide", icon: BookOpen },
  { label: "About", href: "/about", icon: Info },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: health } = trpc.integrations.health.useQuery(undefined, { staleTime: 30_000 });
  const agentReady = Boolean(health?.n8nConfigured);

  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark"><Leaf size={20} strokeWidth={2.5} /></span>
            <span><strong>EcoSort</strong> <em>AI</em></span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {navigation.map(({ label, href }) => (
              <Link key={href} href={href} className={location === href ? "nav-link active" : "nav-link"}>{label}</Link>
            ))}
          </nav>

          <div className="topbar-actions">
            <span className={agentReady ? "status-chip ready" : "status-chip waiting"}>
              <span className="status-dot" /> {agentReady ? "Agent connected" : "Agent setup pending"}
            </span>
            <span className="avatar" aria-label="EcoSort workspace">ES</span>
            <button className="icon-button mobile-menu-button" aria-label="Open navigation" onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="mobile-nav">
            {navigation.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={location === href ? "mobile-nav-link active" : "mobile-nav-link"}>
                <Icon size={17} /> {label} <ArrowUpRight size={14} className="mobile-nav-arrow" />
              </Link>
            ))}
          </div>
        )}
      </header>
      <main className="page-wrap">{children}</main>
      <footer className="footer">
        <div><span className="footer-brand"><Leaf size={14} /> EcoSort AI</span><span>Frontend for an n8n-powered waste intelligence agent.</span></div>
        <div className="footer-meta"><span><Bot size={13} /> n8n-ready</span><span><Activity size={13} /> {agentReady ? "Connected" : "Awaiting webhook"}</span></div>
      </footer>
    </div>
  );
}
