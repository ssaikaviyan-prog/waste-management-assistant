import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Camera, CheckCircle2, CloudUpload, FileImage, Loader2, ScanLine, Sparkles, Upload, X } from "lucide-react";
import { Badge, Button, SectionHeader } from "@/components/ui";
import { getErrorMessage, getSessionId } from "@/lib/integrations";
import { trpc } from "@/lib/trpc";

type ClassificationResult = { category?: string; disposalMethod?: string; recyclingRecommendation?: string; confidence?: string };
const sampleItems = [
  ["Plastic bottle", "Recyclable", "blue"], ["Banana peel", "Biodegradable", "green"], ["Lithium battery", "Hazardous", "red"], ["Old charger", "E-Waste", "cyan"],
];

export default function Classifier() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const mutation = trpc.classifier.submit.useMutation({
    onSuccess: (payload) => {
      if (payload && typeof payload === "object") setResult(payload as ClassificationResult);
      setError("");
    },
    onError: (requestError) => setError(getErrorMessage(requestError, "The classification workflow could not be reached.")),
  });

  const chooseFile = (selected: File | undefined) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) { setError("Choose a JPG, PNG, or WEBP image."); return; }
    if (selected.size > 8 * 1024 * 1024) { setError("Keep images below 8 MB for the classification workflow."); return; }
    setFile(selected); setResult(null); setError(""); setPreview(URL.createObjectURL(selected));
  };
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => chooseFile(event.target.files?.[0]);
  const handleDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); chooseFile(event.dataTransfer.files?.[0]); };
  const clear = () => { setFile(null); setPreview(""); setResult(null); setError(""); if (inputRef.current) inputRef.current.value = ""; };
  const classify = async () => {
    if (!file) return;
    const imageData = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
    mutation.mutate({ sessionId: getSessionId(), fileName: file.name, mimeType: file.type, imageData });
  };

  return <div className="page-content">
    <SectionHeader eyebrow="Computer vision / prepared workflow" title="What is this waste?" description="Upload an image to prepare a classification request. The result panel stays honest until a connected n8n model returns category and disposal guidance." action={<div className="accuracy-callout"><ScanLine size={21} /><div><strong>Model status</strong><span>Not connected</span></div></div>} />
    <div className="classifier-layout">
      <div>
        <div className={`upload-card glass-card ${file ? "has-file" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          {preview ? <div className="preview-state"><img src={preview} alt="Selected waste preview" /><div className="preview-overlay"><span><FileImage size={15} /> {file?.name}</span><button onClick={clear} aria-label="Remove image"><X size={17} /></button></div></div> : <div className="upload-state"><div className="upload-icon"><CloudUpload size={33} /></div><h2>Drag & drop your waste image here</h2><p>Supports JPG, PNG, WEBP up to 8 MB</p><div className="upload-actions"><Button onClick={() => inputRef.current?.click()}><Upload size={17} /> Browse files</Button><Button variant="secondary" onClick={() => inputRef.current?.click()}><Camera size={17} /> Use camera</Button></div><span className="drop-note">or drop an image anywhere in this panel</span></div>}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleInput} hidden />
        </div>
        {file && <button className="classify-button button button-primary" onClick={() => void classify()} disabled={mutation.isPending}>{mutation.isPending ? <><Loader2 size={17} className="spin" /> Sending to n8n…</> : <><Sparkles size={17} /> Send for AI classification <ArrowRight size={16} /></>}</button>}
        {error && <div className="integration-error inline-error"><AlertCircle size={17} /><p>{error}</p><button onClick={() => setError("")}><X size={15} /></button></div>}
        <div className="sample-panel"><div className="panel-heading"><div><div className="eyebrow">Quick test references</div><h3>Common items to classify</h3></div><span>UI examples only</span></div><div className="sample-grid">{sampleItems.map(([name, category, tone]) => <button key={name} className="sample-item" onClick={() => setError(`Sample “${name}” is a visual reference only. Upload an image to send a real request.`)}><span className={`sample-thumb sample-${tone}`}><ScanLine size={21} /></span><span><strong>{name}</strong><small>{category}</small></span><ArrowRight size={14} /></button>)}</div></div>
      </div>
      <aside className="result-panel glass-card"><div className="panel-heading"><div><div className="eyebrow">Classification output</div><h3>AI result</h3></div><Badge tone={result ? "green" : "gray"}>{result ? "Received" : "Awaiting model"}</Badge></div>{result ? <div className="result-content"><div className="result-category"><span>Detected category</span><strong>{result.category || "Not provided"}</strong>{result.confidence && <Badge tone="green">{result.confidence} confidence</Badge>}</div><div className="result-detail"><CheckCircle2 size={18} /><div><strong>Recommended disposal</strong><p>{result.disposalMethod || "No disposal method was returned."}</p></div></div><div className="result-detail"><Sparkles size={18} /><div><strong>Recycling recommendation</strong><p>{result.recyclingRecommendation || "No recycling recommendation was returned."}</p></div></div></div> : <div className="result-empty"><div className="result-orb"><ScanLine size={25} /></div><h3>Your result will appear here.</h3><p>Upload an image and send it to your configured n8n classification flow. This frontend does not guess what an image contains.</p><div className="result-schema"><span>Expected response</span><code>category</code><code>disposalMethod</code><code>recyclingRecommendation</code></div></div>}</aside>
    </div>
  </div>;
}
