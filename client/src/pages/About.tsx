import { Link } from "wouter";
import { ArrowRight, Bot, Check, CircleDot, Code2, Database, FileText, GitBranch, Layers3, LockKeyhole, Network, Server } from "lucide-react";
import { Badge, SectionHeader } from "@/components/ui";
import { trpc } from "@/lib/trpc";

const architecture = [
  { number: "01", title: "Manus frontend", text: "Accessible interface for questions, classification, reports, and learning.", icon: Layers3, tone: "green" },
  { number: "02", title: "Native AI service", text: "The chatbot calls the server-side Manus LLM helper; no browser API key is exposed.", icon: Bot, tone: "cyan" },
  { number: "03", title: "Waste expertise", text: "A focused system prompt covers segregation, recycling, composting, hazards, e-waste, and collection guidance.", icon: Network, tone: "blue" },
  { number: "04", title: "Actionable result", text: "The returned answer is surfaced with loading and error states, without fabricated frontend fallbacks.", icon: Check, tone: "green" },
];

export default function About() {
  const { data } = trpc.integrations.health.useQuery();
  return <div className="page-content about-page">
    <SectionHeader eyebrow="Project architecture" title="Built to keep the intelligence honest." description="EcoSort AI uses a native, server-side Manus LLM for the chatbot. Reports and image classification remain prepared for separate workflow integrations." action={<Badge tone="green">College AI project / v2.0</Badge>} />
    <section className="about-hero glass-card"><div className="about-hero-icon"><GitBranch size={27} /></div><div><h2>Website → Native AI → response</h2><p>The interface handles user experience, validation, session identity, and loading/error states. The server keeps the AI connection private and specializes the assistant for waste management.</p></div><div className="architecture-status"><span className="status-dot" /> {data?.nativeAIConfigured ? "Native AI connected" : "AI connection pending"}</div></section>
    <section className="architecture-grid">{architecture.map(({ number, title, text, icon: Icon, tone }) => <article className="architecture-card" key={number}><span className="architecture-number">{number}</span><div className={`architecture-icon architecture-${tone}`}><Icon size={22} /></div><h3>{title}</h3><p>{text}</p></article>)}</section>
    <div className="about-columns"><section className="about-detail glass-card"><div className="eyebrow">What is included</div><h2>A real product surface, not a static demo.</h2><div className="detail-list"><div><FileText size={18} /><span><strong>Native AI chat</strong><small>Questions are handled through a server-side LLM procedure.</small></span></div><div><LockKeyhole size={18} /><span><strong>Credential boundary</strong><small>AI credentials stay server-side and are not bundled into client code.</small></span></div><div><Database size={18} /><span><strong>Focused expertise</strong><small>The system prompt covers the requested waste-management domains.</small></span></div><div><Code2 size={18} /><span><strong>Workflow-ready extensions</strong><small>Classification and reports retain separate integration boundaries.</small></span></div></div></section><section className="about-detail note-detail"><div className="eyebrow">What is intentionally not claimed</div><h2>No pretend AI.</h2><p>The assistant never invents an answer when the native model is unavailable. The classifier never labels an image until a connected model returns a result.</p><div className="note-quote"><CircleDot size={16} /><span>“A clear pending state is more useful than a confident fiction.”</span></div><Link href="/assistant" className="button button-secondary">Try the native assistant <ArrowRight size={16} /></Link></section></div>
    <section className="config-card"><div><div className="eyebrow">Server-side architecture</div><h2>No chatbot API key in the browser.</h2><p>The assistant uses Manus's preconfigured server-side LLM connection. The frontend only sends the question and session ID to the typed server procedure.</p></div><div className="config-code"><span>AI ROUTE</span><code>server → Manus LLM → client</code><small><Server size={13} /> Credential-safe</small></div></section>
  </div>;
}
