import { FormEvent, useState } from "react";
import { AlertCircle, ArrowUp, Bot, CheckCircle2, Copy, Leaf, Loader2, RotateCcw, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { getErrorMessage, getSessionId } from "@/lib/integrations";
import { trpc } from "@/lib/trpc";

type ChatMessage = { id: string; role: "user" | "assistant" | "system"; content: string };

const suggestions = [
  "Where should I dispose of a plastic bottle?",
  "How do I dispose of electronic waste?",
  "Can food waste be composted?",
  "What should I do with used batteries?",
];

export default function Assistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const sessionId = getSessionId();
  const { data: health } = trpc.integrations.health.useQuery(undefined, { staleTime: 30_000 });
  const webhookReady = Boolean(health?.n8nConfigured);
  const mutation = trpc.assistant.send.useMutation({
    onSuccess: ({ response }, variables) => {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: response }]);
      setInput("");
      setError("");
      void variables;
    },
    onError: (requestError) => setError(getErrorMessage(requestError, "The assistant could not be reached. Check the n8n webhook configuration.")),
  });

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const message = input.trim();
    if (!message || mutation.isPending || !webhookReady) return;
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", content: message }]);
    setError("");
    mutation.mutate({ message, sessionId });
  };

  const clearChat = () => { setMessages([]); setError(""); setInput(""); };

  return <div className="page-content assistant-page">
    <div className="assistant-heading"><div><Badge tone="cyan">Agent interface / live contract</Badge><h1>Ask EcoSort anything.</h1><p>Get practical, context-aware guidance for segregation, recycling, composting, e-waste, and responsible disposal.</p></div><button className="button button-ghost" onClick={clearChat}><RotateCcw size={15} /> Clear chat</button></div>

    <div className="assistant-layout">
      <section className="chat-panel glass-card">
        <div className="chat-toolbar"><div className="chat-agent"><span className="deck-icon"><Bot size={19} /></span><div><strong>Waste management assistant</strong><small><i className="pulse-dot" /> n8n bridge / session {sessionId.slice(0, 8)}</small></div></div><div className="chat-toolbar-status"><ShieldCheck size={15} /> Real responses only</div></div>
        {!webhookReady && <div className="integration-notice"><AlertCircle size={16} /><div><strong>Connect your n8n Webhook to send questions</strong><p>The chat is ready, but it will not call an unavailable endpoint or invent an answer. Add <code>N8N_WEBHOOK_URL</code> server-side to enable sending.</p></div></div>}
        <div className="chat-history" aria-live="polite">
          {messages.length === 0 && <div className="chat-welcome"><div className="welcome-orb"><Leaf size={29} /></div><h2>What are you trying to sort?</h2><p>Ask a question and this interface will send it to your configured n8n Webhook. Until a webhook is connected, no response is invented here.</p><div className="suggestion-grid">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => setInput(suggestion)}>{suggestion}<ArrowUp size={14} /></button>)}</div></div>}
          {messages.map((message) => <div key={message.id} className={`message-row ${message.role}`}><div className="message-avatar">{message.role === "user" ? <UserRound size={15} /> : <Bot size={15} />}</div><div className="message-bubble"><span className="message-role">{message.role === "user" ? "You" : "EcoSort AI"}</span><p>{message.content}</p>{message.role === "assistant" && <button className="copy-button" aria-label="Copy response" onClick={() => void navigator.clipboard?.writeText(message.content)}><Copy size={13} /></button>}</div></div>)}
          {mutation.isPending && <div className="message-row assistant"><div className="message-avatar"><Bot size={15} /></div><div className="message-bubble loading-bubble"><span className="message-role">EcoSort AI</span><div className="loading-dots"><i /><i /><i /></div><small>Waiting for the n8n agent response…</small></div></div>}
          {error && <div className="integration-error"><AlertCircle size={17} /><div><strong>Couldn’t complete the request</strong><p>{error}</p></div><button aria-label="Dismiss error" onClick={() => setError("")}>×</button></div>}
        </div>
        <form className="chat-composer" onSubmit={submit}><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder={webhookReady ? "Ask about an item, material, or disposal decision…" : "Connect n8n to enable sending…"} rows={1} disabled={mutation.isPending || !webhookReady} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} /><button className="send-button" type="submit" aria-label="Send question" disabled={!input.trim() || mutation.isPending || !webhookReady}>{mutation.isPending ? <Loader2 size={18} className="spin" /> : <ArrowUp size={19} />}</button></form>
        <div className="composer-note"><span><CheckCircle2 size={13} /> Your session ID is kept locally</span><span>Shift + Enter for a new line</span></div>
      </section>

      <aside className="assistant-aside"><div className="aside-card"><div className="aside-label"><Sparkles size={15} /> Good questions to ask</div><h3>Make the answer more useful.</h3><ul><li>Tell us what the item is made of.</li><li>Include your city or collection context.</li><li>Mention if it is dirty, broken, or wet.</li></ul></div><div className="aside-card aside-blue"><div className="aside-label"><ShieldCheck size={15} /> Integration contract</div><p className="code-label">POST payload</p><pre>{`{
  "message": "your question",
  "sessionId": "${sessionId.slice(0, 12)}…"
}`}</pre><small>Response fields accepted: response, output, message, text, or answer.</small></div></aside>
    </div>
  </div>;
}
