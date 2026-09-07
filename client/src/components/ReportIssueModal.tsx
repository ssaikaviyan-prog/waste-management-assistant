import { ChangeEvent, FormEvent, useState } from "react";
import { Camera, CheckCircle2, Crosshair, FileImage, MapPin, Send, ShieldCheck, Upload, X } from "lucide-react";
import { Badge, Button } from "@/components/ui";

const categories = ["Uncollected Waste", "Illegal Dumping", "Overflowing Bin", "Area Not Cleaned", "Construction Waste", "Other"] as const;
type Category = (typeof categories)[number];

type ReportPayload = {
  report_id: string;
  category: Category;
  description: string;
  location: { address: string; latitude: string; longitude: string };
  photo: string;
  name: string;
  contact: string;
  status: "Pending Review";
  created_at: string;
};

export default function ReportIssueModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [category, setCategory] = useState<Category | "">("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ latitude: "", longitude: "" });
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<ReportPayload | null>(null);

  if (!open) return null;

  const reset = () => {
    setCategory(""); setAddress(""); setCoordinates({ latitude: "", longitude: "" }); setDescription(""); setName(""); setContact(""); setPhoto(""); setPhotoName(""); setLocationMessage(""); setError(""); setSubmitted(null);
  };
  const close = () => { reset(); onClose(); };
  const useLocation = () => {
    setLocationMessage("Requesting your location…");
    if (!navigator.geolocation) { setLocationMessage("Geolocation is not available in this browser. Enter the address manually."); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setCoordinates({ latitude: coords.latitude.toFixed(6), longitude: coords.longitude.toFixed(6) }); setLocationMessage("Location coordinates added. Add a landmark or address above if helpful."); },
      () => setLocationMessage("We could not access your location. You can still enter it manually."),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };
  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 8 * 1024 * 1024) { setError("Keep the photo below 8 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setPhoto(String(reader.result)); setPhotoName(file.name); setError(""); };
    reader.readAsDataURL(file);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!category || !address.trim() || !description.trim()) { setError("Choose a category, add a location, and describe the issue before submitting."); return; }
    const sequence = Number(window.localStorage.getItem("ecosort-report-sequence") || "0") + 1;
    window.localStorage.setItem("ecosort-report-sequence", String(sequence));
    const payload: ReportPayload = {
      report_id: `WM-${new Date().getFullYear()}-${String(sequence).padStart(3, "0")}`,
      category,
      description: description.trim(),
      location: { address: address.trim(), latitude: coordinates.latitude, longitude: coordinates.longitude },
      photo,
      name: name.trim(),
      contact: contact.trim(),
      status: "Pending Review",
      created_at: new Date().toISOString(),
    };
    // This payload is ready for a future n8n/API submission without claiming delivery today.
    setSubmitted(payload);
  };

  return <div className="report-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-issue-title">
      <button className="report-modal-close" onClick={close} aria-label="Close report form"><X size={19} /></button>
      {submitted ? <div className="report-confirmation"><div className="confirmation-icon"><CheckCircle2 size={32} /></div><Badge tone="green">Pending Review</Badge><h2 id="report-issue-title">Report Submitted Successfully</h2><p>Your issue has been prepared for review. Keep this reference ID for follow-up.</p><div className="report-reference"><span>Report ID</span><strong>{submitted.report_id}</strong><span>Status</span><strong>{submitted.status}</strong><span>Category</span><strong>{submitted.category}</strong></div><Button onClick={close}>Done</Button></div> : <>
        <div className="report-modal-heading"><div className="report-modal-icon"><FileImage size={22} /></div><div><Badge tone="red">Community action</Badge><h2 id="report-issue-title">Report Waste Issue</h2><p>See an uncleared or illegally dumped waste area? Report it to help keep your community clean.</p></div></div>
        <form className="report-issue-form" onSubmit={submit}>
          <label><span>Waste issue category</span><select value={category} onChange={(event) => setCategory(event.target.value as Category)} required><option value="">Select an issue</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Location</span><div className="report-location-row"><div className="input-with-icon"><MapPin size={16} /><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Street, landmark, or area" required /></div><button type="button" className="location-button" onClick={useLocation}><Crosshair size={15} /> Use My Location</button></div><small>{coordinates.latitude ? `Coordinates: ${coordinates.latitude}, ${coordinates.longitude}` : locationMessage || "Add a landmark or use your device location."}</small></label>
          <div className="report-photo-field"><span>Photo of the area <small>Optional</small></span><label className={`report-photo-drop ${photo ? "has-photo" : ""}`}>{photo ? <><img src={photo} alt="Waste issue preview" /><span className="photo-overlay"><FileImage size={14} /> {photoName}</span></> : <><Camera size={22} /><strong>Upload or take a photo</strong><small>JPG, PNG, or WEBP up to 8 MB</small></>}<input type="file" accept="image/*" capture="environment" onChange={handlePhoto} hidden /></label></div>
          <label><span>Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tell us what happened, how long it has been there, and any safety concern…" rows={4} required minLength={10} /></label>
          <div className="report-form-grid"><label><span>Name <small>Optional</small></span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label><label><span>Contact <small>Optional</small></span><input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Email or phone" /></label></div>
          {error && <p className="report-form-error">{error}</p>}
          <div className="report-submit-row"><span><ShieldCheck size={14} /> Prepared securely for review</span><Button type="submit"><Send size={16} /> Submit Report</Button></div>
        </form>
      </>}
    </section>
  </div>;
}
