import { useMemo, useState } from "react";
import { BatteryCharging, BookOpen, Box, Check, ChevronRight, CircleAlert, GlassWater, Leaf, Search, Smartphone, Sprout, Trash2, Recycle, Droplets } from "lucide-react";
import { Badge, SectionHeader } from "@/components/ui";

const items = [
  { name: "PET plastic bottle", category: "Recyclable", icon: Droplets, tone: "cyan", bin: "Blue recycling stream", action: "Empty and rinse. Remove the cap if your local program sorts it separately.", impact: "Clean containers are easier to recover." },
  { name: "Fruit & vegetable scraps", category: "Biodegradable", icon: Sprout, tone: "green", bin: "Green compost stream", action: "Place in a compost caddy or municipal organics bin. Keep out plastic bags.", impact: "Organic waste can become soil instead of methane." },
  { name: "Lithium-ion battery", category: "Hazardous", icon: BatteryCharging, tone: "red", bin: "Specialist drop-off", action: "Never put in general trash. Tape exposed terminals and use an approved battery collection point.", impact: "Batteries can start fires in collection vehicles." },
  { name: "Old phone or charger", category: "E-Waste", icon: Smartphone, tone: "blue", bin: "E-waste collection", action: "Back up and wipe personal data, then take devices to an authorized e-waste recycler.", impact: "Electronics contain recoverable metals and hazardous parts." },
  { name: "Cardboard box", category: "Recyclable", icon: Box, tone: "cyan", bin: "Paper recycling", action: "Flatten, keep dry, and remove tape or food contamination where possible.", impact: "Fiber can be recovered multiple times." },
  { name: "Broken glass", category: "Mixed Waste", icon: GlassWater, tone: "gray", bin: "Wrapped residual waste", action: "Wrap securely, label clearly, and follow local glass collection guidance. Never place loose glass in a bag.", impact: "Protects collection workers from sharps." },
  { name: "Paint or cleaning chemicals", category: "Hazardous", icon: CircleAlert, tone: "red", bin: "Household hazardous waste", action: "Keep containers sealed and use a municipal hazardous-waste event or drop-off.", impact: "Never pour chemicals down a drain or into soil." },
  { name: "Food-soiled paper", category: "Biodegradable", icon: Recycle, tone: "green", bin: "Compost or residual", action: "Compost if accepted locally; otherwise place with residual waste. Do not mix with clean paper recycling.", impact: "Contamination can downgrade an entire recycling load." },
];
const filters = ["All items", "Biodegradable", "Recyclable", "E-Waste", "Hazardous", "Mixed Waste"];

export default function Guide() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All items");
  const visible = useMemo(() => items.filter((item) => (filter === "All items" || item.category === filter) && `${item.name} ${item.category} ${item.action}`.toLowerCase().includes(query.toLowerCase())), [filter, query]);
  return <div className="page-content guide-page">
    <SectionHeader eyebrow="Know your waste" title="The practical disposal directory." description="Search common items, see the suggested stream, and follow the action before you throw anything away." action={<div className="guide-stat"><Leaf size={19} /><div><strong>1,420+</strong><span>items ready to index</span></div></div>} />
    <div className="guide-controls"><div className="search-box"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search plastic bottle, battery, banana peel…" /><kbd>⌘ K</kbd></div><div className="filter-row">{filters.map((option) => <button key={option} className={filter === option ? "filter-pill active" : "filter-pill"} onClick={() => setFilter(option)}>{option}</button>)}</div></div>
    <div className="guide-grid">{visible.map((item) => { const Icon = item.icon; return <article className="guide-card" key={item.name}><div className="guide-card-top"><div className={`guide-item-icon guide-${item.tone}`}><Icon size={25} /></div><Badge tone={item.tone === "gray" ? "gray" : item.tone as "green" | "cyan" | "blue" | "red"}>{item.category}</Badge></div><h3>{item.name}</h3><div className="recommended-bin"><Trash2 size={16} /><div><span>Recommended stream</span><strong>{item.bin}</strong></div></div><div className="guide-action"><Check size={15} /><div><span>Actionable instruction</span><p>{item.action}</p></div></div><div className={`impact-note impact-${item.tone}`}><SparkleIcon />{item.impact}<ChevronRight size={15} /></div></article>; })}</div>{visible.length === 0 && <div className="empty-guide"><BookOpen size={26} /><h3>No matching items yet.</h3><p>Try a broader keyword or choose “All items”.</p></div>}
  </div>;
}
function SparkleIcon() { return <span className="impact-spark">✦</span>; }
