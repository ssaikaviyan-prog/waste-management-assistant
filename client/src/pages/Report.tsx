import { FormEvent, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, FileImage, FileWarning, MapPin, Paperclip, Send, X } from "lucide-react";
import { Badge, Button, SectionHeader } from "@/components/ui";
import { getErrorMessage, getSessionId } from "@/lib/integrations";
import { trpc } from "@/lib/trpc";

const types = ["Biodegradable", "Recyclable", "E-Waste", "Hazardous", "Mixed Waste"];

export default function Report() {
  const [form, setForm] = useState({ name: "", location: "", wasteType: "", description: "" });
  const [image, setImage] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const imageRef = useRef<HTMLInputElement>(null);
  const mutation = trpc.reports.submit.useMutation({
    onSuccess: () => { setSubmitted(true); setError(""); },
    onError: (requestError) => setError(getErrorMessage(requestError, "The report could not be sent. Check the n8n webhook configuration.")),
  });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); setError(""); mutation.mutate({ ...form, imageName: image?.name, sessionId: getSessionId() }); };
  const reset = () => { setForm({ name: "", location: "", wasteType: "", description: "" }); setImage(null); setSubmitted(false); setError(""); };

  return <div className="page-content report-page">
    <SectionHeader eyebrow="Community action / n8n-ready" title="Report a waste issue." description="Help your campus, neighborhood, or collection team spot problems. Submissions are prepared for your n8n workflow—no report is claimed as delivered until the webhook confirms it." action={<Badge tone="red">Safety reports welcome</Badge>} />
    <div className="report-layout">
      <form className="report-form glass-card" onSubmit={submit}>
        {submitted ? <div className="success-state"><div className="success-icon"><CheckCircle2 size={29} /></div><Badge tone="green">Webhook confirmed</Badge><h2>Report sent to the workflow.</h2><p>Your n8n endpoint acknowledged this report. Keep the reference details handy if your collection team follows up.</p><div className="success-reference"><span>Report type</span><strong>{form.wasteType}</strong><span>Location</span><strong>{form.location}</strong></div><Button type="button" variant="secondary" onClick={reset}>Submit another report</Button></div> : <>
          <div className="form-heading"><div className="form-number">01</div><div><h2>Tell us what happened.</h2><p>Required fields are marked by the form validation.</p></div></div>
          <div className="form-grid"><label><span>Your name</span><input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="e.g. Aisha Khan" required minLength={2} /></label><label><span>Issue location</span><div className="input-with-icon"><MapPin size={16} /><input value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="e.g. North campus gate" required minLength={2} /></div></label></div>
          <label><span>Waste type</span><select value={form.wasteType} onChange={(event) => update("wasteType", event.target.value)} required><option value="">Select a category</option>{types.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label><span>What should the team know?</span><textarea value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Describe the waste, collection problem, or safety concern…" rows={5} required minLength={10} /><small>{form.description.length}/2000 characters</small></label>
          <div className="attachment-field"><div><span>Optional image</span><small>Attach a photo to help the workflow triage the report.</small></div><button type="button" className="attachment-button" onClick={() => imageRef.current?.click()}><Paperclip size={16} /> {image ? image.name : "Attach file"}</button><input ref={imageRef} hidden type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} /></div>
          {error && <div className="integration-error inline-error"><AlertCircle size={17} /><p>{error}</p><button type="button" onClick={() => setError("")}><X size={15} /></button></div>}
          <div className="form-actions"><span><ShieldIcon /> Sent securely through the server proxy</span><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Sending…" : "Send report"} <Send size={16} /></Button></div>
        </>}
      </form>
      <aside className="report-aside"><div className="aside-card report-note"><FileWarning size={25} /><h3>Report with context.</h3><p>Good reports help an agent or human team route the issue faster. Include landmarks, timing, and whether the material presents a hazard.</p></div><div className="aside-card"><div className="eyebrow">Workflow handoff</div><div className="handoff-step"><span>01</span><div><strong>Website</strong><small>Validates and packages the report</small></div></div><div className="handoff-line" /><div className="handoff-step"><span>02</span><div><strong>n8n Webhook</strong><small>Stores, triages, and routes the report</small></div></div><div className="handoff-line" /><div className="handoff-step"><span>03</span><div><strong>Collection team</strong><small>Receives the next action through your workflow</small></div></div></div></aside>
    </div>
  </div>;
}

function ShieldIcon() { return <span className="tiny-shield">●</span>; }
