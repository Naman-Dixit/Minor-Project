import { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle, AlertCircle, Download } from 'lucide-react';

const API = 'http://localhost:5001';
const STATUS_ORDER = ['IDLE', 'LISTENING', 'RECEIVING', 'DECODING', 'COMPLETE'];

export default function ReceivePage() {
  const [status, setStatus] = useState('IDLE');
  const [logs, setLogs] = useState(['Ready to listen']);
  const [result, setResult] = useState(null);
  const [password, setPassword] = useState('');
  const [started, setStarted] = useState(false);
  const termRef = useRef();

  // Poll status every 2s when started
  useEffect(() => {
    if (!started) return;
    const id = setInterval(async () => {
      try {
        const r = await fetch(`${API}/api/receiver-status`);
        const d = await r.json();
        setStatus(d.status);
        if (d.logs && d.logs.length > 0) setLogs(d.logs);
        if (d.result) { setResult(d.result); clearInterval(id); }
        if (d.status === 'COMPLETE' || d.status === 'IDLE') clearInterval(id);
      } catch (e) { /* api not running */ }
    }, 2000);
    return () => clearInterval(id);
  }, [started]);

  // Auto-scroll terminal
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [logs]);

  const handleStart = async () => {
    setStarted(true);
    setStatus('LISTENING');
    setLogs(['Receiver started — waiting for connection on port 5000']);
    setResult(null);
    try {
      await fetch(`${API}/api/start-receiver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password || 'fedrl2024' }),
      });
    } catch (e) {
      setLogs(prev => [...prev, 'Could not connect to API — is main_api.py running?']);
    }
  };

  const stepIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>
        <span className="gradient-text">Receiver & Live Terminal</span>
      </h1>
      <p style={{ color: '#555', marginBottom: 32 }}>Listen for incoming steganographic data</p>

      {/* Status bar */}
      <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>Current Status</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
          {STATUS_ORDER.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  border: `2px solid ${i <= stepIdx ? '#00f5ff' : 'rgba(255,255,255,0.1)'}`,
                  background: i < stepIdx ? '#00f5ff' : i === stepIdx ? 'rgba(0,245,255,0.15)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i < stepIdx ? '#0a0a0f' : i === stepIdx ? '#00f5ff' : '#444',
                  fontWeight: 700, fontSize: 13,
                  transition: 'all 0.3s',
                }}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 10, color: i === stepIdx ? '#00f5ff' : '#444', letterSpacing: 1, fontWeight: i === stepIdx ? 700 : 400 }}>{s}</span>
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div style={{ width: 60, height: 2, background: i < stepIdx ? '#00f5ff' : 'rgba(255,255,255,0.08)', margin: '0 8px', marginBottom: 20, transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Password input */}
      {!started && (
        <div style={{ marginBottom: 16 }}>
          <input className="input-dark" type="password" placeholder="Password (leave blank for default)" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
      )}

      {/* Terminal */}
      <div className="glass" style={{ padding: 4, marginBottom: 20 }}>
        <div ref={termRef} className="terminal" style={{ minHeight: 280, padding: 20 }}>
          {logs.map((line, i) => (
            <div key={i} style={{ marginBottom: 4, opacity: i === logs.length - 1 ? 1 : 0.7 }}>
              <span style={{ color: '#444', marginRight: 8 }}>{'>'}</span>
              {line}
            </div>
          ))}
          {status === 'LISTENING' && (
            <div style={{ display: 'inline-block', width: 8, height: 14, background: '#00f5ff', animation: 'blink 1s step-end infinite', verticalAlign: 'middle' }} />
          )}
        </div>
      </div>

      {/* Result card */}
      {result && (
        <div className="glass" style={{ padding: 24, marginBottom: 20, border: '1px solid rgba(0,245,255,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <CheckCircle size={24} color="#00f5ff" />
            <h3 style={{ fontWeight: 700, fontSize: 18 }}>Received Successfully</h3>
          </div>
          {result.type === 'file' ? (
            <div>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>File reconstructed and integrity verified</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 600, color: '#00f5ff' }}>{result.filename}</p>
                  <p style={{ fontSize: 12, color: '#555' }}>{(result.size / 1024).toFixed(1)} KB</p>
                </div>
                <a href={`${API}/api/download/${result.filename}`} download style={{ textDecoration: 'none' }}>
                  <button className="btn-cyan" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}>
                    <Download size={16} /> Download
                  </button>
                </a>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>Decoded message:</p>
              <div style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 8, padding: 16, fontFamily: 'JetBrains Mono', fontSize: 14, color: '#00f5ff', marginBottom: 12 }}>
                {result.message}
              </div>
              <button onClick={() => navigator.clipboard.writeText(result.message)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                Copy
              </button>
            </div>
          )}
        </div>
      )}

      {/* Start listening button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          className="btn-purple purple-glow"
          onClick={handleStart}
          disabled={started && status !== 'IDLE' && status !== 'COMPLETE'}
          style={{ fontSize: 16, padding: '16px 48px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 8, minWidth: 280, justifyContent: 'center' }}
        >
          <Play size={20} />
          {started && status !== 'IDLE' && status !== 'COMPLETE' ? 'Listening...' : 'START LISTENING'}
        </button>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}
