import { useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, ArrowRight, Bot, Box, BrainCircuit, Camera, ChevronRight, CircleHelp, Database, FileWarning, Leaf, MapPin, Recycle, ShieldCheck, Sparkles, Sprout, Trash2, Zap } from "lucide-react";
import { Badge, MetricCard } from "@/components/ui";
import ReportIssueModal from "@/components/ReportIssueModal";

const metrics = [
  { icon: <Bot size={19} />, value: "2,480", label: "Queries processed", note: "demo telemetry", tone: "green" as const },
  { icon: <FileWarning size={19} />, value: "184", label: "Waste reports", note: "demo telemetry", tone: "red" as const },
  { icon: <Recycle size={19} />, value: "1,920", label: "Guidance provided", note: "demo telemetry", tone: "cyan" as const },
  { icon: <Box size={19} />, value: "5", label: "Core categories", note: "segregation model", tone: "blue" as const },
];

const categories = [
  { name: "Biodegradable", description: "Food scraps, garden waste, and other organics.", icon: Sprout, tone: "green", count: "01" },
  { name: "Recyclable", description: "Paper, glass, metals, and clean plastics.", icon: Recycle, tone: "cyan", count: "02" },
  { name: "E-Waste", description: "Devices, chargers, batteries, and electronics.", icon: Zap, tone: "blue", count: "03" },
  { name: "Hazardous", description: "Paint, chemicals, sharps, and toxic materials.", icon: ShieldCheck, tone: "red", count: "04" },
  { name: "Mixed Waste", description: "Residual waste that cannot be recovered.", icon: Trash2, tone: "gray", count: "05" },
];

const pipeline = [
  ["01", "Ask", "Describe the material or disposal question.", CircleHelp],
  ["02", "Understand", "Native AI interprets the material and context.", BrainCircuit],
  ["03", "Act", "Get a clear next step for your local context.", ArrowRight],
] as const;

export default function Home() {
  const [reportOpen, setReportOpen] = useState(false);
  return <div className="page-content">
    <section className="hero-section">
      <div className="hero-copy">
        <Badge tone="green">Next-gen ecological intelligence</Badge>
        <h1>Turn waste into<br /><span>the right choice.</span></h1>
        <p>Ask better questions, understand your waste stream, and make confident disposal decisions with a native AI assistant specialized in waste management.</p>
        <div className="hero-actions">
          <Link href="/assistant" className="button button-primary"><Bot size={18} /> Ask AI Assistant <ArrowRight size={16} /></Link>
          <button className="button button-report" onClick={() => setReportOpen(true)}><AlertTriangle size={18} /> Report Waste Issue</button>
        </div>
        <Link href="/classify" className="hero-secondary-link"><Camera size={15} /> Or scan an item for classification <ArrowRight size={14} /></Link>
        <div className="hero-trust"><span><ShieldCheck size={15} /> No fabricated answers</span><span><Database size={15} /> Server-side AI</span></div>
      </div>
      <div className="command-deck glass-card">
        <div className="deck-orbit orbit-one" /><div className="deck-orbit orbit-two" />
        <div className="card-topline"><div className="deck-title"><span className="deck-icon"><Bot size={21} /></span><div><strong>AI command deck</strong><small>Integration telemetry</small></div></div><Badge tone="green">Ready</Badge></div>
        <div className="deck-lines">
          <div className="telemetry-row"><span><span className="telemetry-icon green"><ShieldCheck size={16} /></span>Response integrity</span><strong>Native AI</strong></div>
          <div className="telemetry-row"><span><span className="telemetry-icon cyan"><Database size={16} /></span>Knowledge routing</span><strong>Agent-led</strong></div>
          <div className="telemetry-row"><span><span className="telemetry-icon blue"><Sparkles size={16} /></span>Image analysis</span><strong className="muted">Model pending</strong></div>
        </div>
        <div className="deck-visual"><div className="visual-grid" /><div className="visual-scan-line" /><div className="visual-center"><Leaf size={34} /><span>Eco intelligence</span></div><div className="visual-corner top-left">SYS / 09</div><div className="visual-corner bottom-right">READY_01</div></div>
        <div className="deck-footer"><span><i className="pulse-dot" /> Interface online</span><span>v2.0 / native AI</span></div>
      </div>
    </section>

    <section className="report-issue-card glass-card" aria-label="Report a waste issue"><div className="report-issue-card-icon"><AlertTriangle size={24} /></div><div className="report-issue-card-copy"><div className="eyebrow">Community action / civic reporting</div><h2>REPORT WASTE ISSUE</h2><p>See an uncleared or illegally dumped waste area? Report it to help keep your community clean.</p></div><div className="report-issue-card-actions"><span><MapPin size={14} /> Location + photo ready</span><button className="button button-report" onClick={() => setReportOpen(true)}>Open Report Form <ArrowRight size={16} /></button></div></section>

    <section className="metrics-grid">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>

    <section className="section-block">
      <div className="section-kicker-row"><div><div className="eyebrow">Intelligence architecture</div><h2>From question to ecological action.</h2></div><Link href="/about" className="text-link">How it works <ArrowRight size={15} /></Link></div>
      <div className="pipeline-grid">{pipeline.map(([number, title, copy, Icon]) => <div className="pipeline-card" key={number}><span className="pipeline-number">{number}</span><Icon size={21} className="pipeline-icon" /><h3>{title}</h3><p>{copy}</p></div>)}</div>
    </section>

    <section className="section-block categories-block">
      <div className="section-kicker-row"><div><div className="eyebrow">Smart bin matrix</div><h2>Know your waste stream.</h2></div><Link href="/guide" className="text-link">Open waste guide <ArrowRight size={15} /></Link></div>
      <div className="category-grid">{categories.map(({ name, description, icon: Icon, tone, count }) => <Link href="/guide" className="category-card" key={name}><div className={`category-icon category-${tone}`}><Icon size={22} /></div><div className="category-count">{count}</div><h3>{name}</h3><p>{description}</p><span className="card-arrow"><ChevronRight size={16} /></span></Link>)}</div>
    </section>

    <section className="cta-strip glass-card"><div className="cta-icon"><Bot size={24} /></div><div><div className="eyebrow">Need a clear answer?</div><h2>Ask the waste management assistant.</h2><p>Questions are answered by the server-side native AI. No fake responses, no hidden fallback.</p></div><Link href="/assistant" className="button button-primary">Start a conversation <ArrowRight size={16} /></Link></section>
    <ReportIssueModal open={reportOpen} onClose={() => setReportOpen(false)} />
  </div>;
}
