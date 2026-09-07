import { Link } from "wouter";
import { ArrowRight, Bot, Check, CircleDot, Code2, Database, FileText, GitBranch, Layers3, LockKeyhole, Network, Server, Sparkles } from "lucide-react";
import { Badge, SectionHeader } from "@/components/ui";
import { trpc } from "@/lib/trpc";

const architecture = [
  { number: "01", title: "Manus frontend", text: "Accessible interface for questions, classification, reports, and learning.", icon: Layers3, tone: "green" },
  { number: "02", title: "n8n Webhook", text: "Configurable server-side handoff with timeout and invalid-response handling.", icon: Network, tone: "cyan" },
  { number: "03", title: "AI Agent + LLM", text: "Your separate n8n workflow owns reasoning, tools, knowledge, and integrations.", icon: Bot, tone: "blue" },
  { number: "04", title: "Actionable result", text: "The returned response is surfaced without a fabricated frontend fallback.", icon: Check, tone: "green" },
];

export default function About() {
  const { data } = trpc.integrations.health.useQuery();
  return <div className="page-content about-page">
    <SectionHeader eyebrow="Project architecture" title="Built to keep the intelligence honest." description="EcoSort AI is a polished frontend for a separately managed n8n AI Agent. The boundary is explicit, inspectable, and ready to connect to your workflow." action={<Badge tone="green">College AI project / v1.0</Badge>} />
    <section className="about-hero glass-card"><div className="about-hero-icon"><GitBranch size={27} /></div><div><h2>Website → n8n → AI Agent → response</h2><p>The interface handles user experience, validation, session identity, and loading/error states. The workflow handles the intelligence.</p></div><div className="architecture-status"><span className="status-dot" /> {data?.n8nConfigured ? "Webhook connected" : "Webhook URL pending"}</div></section>
    <section className="architecture-grid">{architecture.map(({ number, title, text, icon: Icon, tone }) => <article className="architecture-card" key={number}><span className="architecture-number">{number}</span><div className={`architecture-icon architecture-${tone}`}><Icon size={22} /></div><h3>{title}</h3><p>{text}</p></article>)}</section>
    <div className="about-columns"><section className="about-detail glass-card"><div className="eyebrow">What is included</div><h2>A real product surface, not a static demo.</h2><div className="detail-list"><div><FileText size={18} /><span><strong>Typed integration layer</strong><small>Chat, reports, and classification use server-side procedures.</small></span></div><div><LockKeyhole size={18} /><span><strong>Credential boundary</strong><small>Astra credentials stay server-side and are not bundled into client code.</small></span></div><div><Database size={18} /><span><strong>n8n-friendly payloads</strong><small>Chat sends message + sessionId; other features include explicit type fields.</small></span></div><div><Code2 size={18} /><span><strong>Replaceable config</strong><small>Set N8N_WEBHOOK_URL without touching the visual interface.</small></span></div></div></section><section className="about-detail note-detail"><div className="eyebrow">What is intentionally not claimed</div><h2>No pretend AI.</h2><p>The assistant never invents an answer when the webhook is missing or unavailable. The classifier never labels an image until a connected model returns a result.</p><div className="note-quote"><CircleDot size={16} /><span>“A clear pending state is more useful than a confident fiction.”</span></div><Link href="/assistant" className="button button-secondary">Try the assistant surface <ArrowRight size={16} /></Link></section></div>
    <section className="config-card"><div><div className="eyebrow">Configuration checklist</div><h2>Connect your own n8n workflow.</h2><p>Set the server environment variable below, then refresh the app. No client rebuild or API key exposure required.</p></div><div className="config-code"><span>N8N_WEBHOOK_URL</span><code>https://your-n8n-host/webhook/ecosort</code><small><Server size={13} /> Server-side only</small></div></section>
  </div>;
}
