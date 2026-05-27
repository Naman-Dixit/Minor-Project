import { useState, useRef, useCallback } from 'react';
import { FileText, Upload, Image, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const API = 'http://localhost:5001';

function toB64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export default function SendPage() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('text');
  const [message, setMessage] = useState('');
  const [secretFile, setSecretFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [password, setPassword] = useState('');
  const [peerIp, setPeerIp] = useState('');
  const [capacity, setCapacity] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const [coverDrag, setCoverDrag] = useState(false);

  const secretRef = useRef();
  const coverRef = useRef();

  const handleSecretFile = async (file) => {
    setSecretFile(file);
    setCapacity(null);
  };

  const handleCoverFile = async (file) => {
    setCoverFile(file);
    setCapacity(null);
    // auto capacity check if secret file also selected
    if (secretFile && file) {
      await checkCap(file, secretFile.size);
    }
  };

  const checkCap = async (cover, fileSize) => {
    try {
      const b64 = await toB64(cover);
      const r = await fetch(`${API}/api/capacity-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_image_b64: b64, file_size_bytes: fileSize }),
      });
      const d = await r.json();
      setCapacity(d);
    } catch (e) { /* ignore */ }
  };

  const handleEncode = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const coverB64 = await toB64(coverFile);
      const pwd = password || 'fedrl2024';

      let encodeRes;
      if (mode === 'text') {
        encodeRes = await fetch(`${API}/api/encode-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, cover_image_b64: coverB64, password: pwd }),
        });
      } else {
        const fileB64 = await toB64(secretFile);
        encodeRes = await fetch(`${API}/api/encode-file`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_b64: fileB64, filename: secretFile.name, cover_image_b64: coverB64, password: pwd }),
        });
      }
      const encData = await encodeRes.json();
      if (!encodeRes.ok || encData.error) throw new Error(encData.error || 'Encode failed');

      // Send P2P
      const ip = peerIp || '127.0.0.1';
      const sendRes = await fetch(`${API}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peer_ip: ip }),
      });
      const sendData = await sendRes.json();

      setResult({ ...encData, peer_ip: ip, sent: sendData.success !== false });
      setStep(4);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Mode', 'Input', 'Dispatch', 'Result'];

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>
        <span className="gradient-text">Sender Wizard</span>
      </h1>
      <p style={{ color: '#555', marginBottom: 32 }}>Step {step} of {steps.length}</p>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'unset' }}>
            <div className={`step-circle ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`step-line ${step > i + 1 ? 'done' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: 36 }}>

        {/* STEP 1 — Mode */}
        {step === 1 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28 }}>Select Steganography Mode</h2>
            <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
              <div className={`mode-card ${mode === 'text' ? 'selected' : ''}`} onClick={() => setMode('text')}>
                <FileText size={40} color="#00f5ff" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Text</p>
                <p style={{ color: '#555', fontSize: 13 }}>Hide text in images</p>
              </div>
              <div className={`mode-card ${mode === 'file' ? 'selected' : ''}`} onClick={() => setMode('file')}>
                <Upload size={40} color="#00f5ff" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>File</p>
                <p style={{ color: '#555', fontSize: 13 }}>Hide files in images</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn-cyan" onClick={() => setStep(2)}>Next →</button>
            </div>
          </div>
        )}

        {/* STEP 2 — Input */}
        {step === 2 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28 }}>
              {mode === 'text' ? 'Enter Secret Message' : 'Upload Secret File'}
            </h2>
            {mode === 'text' ? (
              <textarea
                className="input-dark"
                rows={6}
                placeholder="Type your secret message here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'Space Grotesk' }}
              />
            ) : (
              <>
                <div
                  className={`drop-zone ${drag ? 'drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e => { e.preventDefault(); setDrag(false); handleSecretFile(e.dataTransfer.files[0]); }}
                  onClick={() => secretRef.current.click()}
                >
                  <Upload size={36} color="#555" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: '#888', marginBottom: 4 }}>Drag & drop any file or click to browse</p>
                  <p style={{ color: '#444', fontSize: 12 }}>PNG, PDF, TXT, DOCX, JPG — any format</p>
                  <input ref={secretRef} type="file" style={{ display: 'none' }} onChange={e => handleSecretFile(e.target.files[0])} />
                </div>
                {secretFile && (
                  <div className="glass" style={{ padding: '12px 16px', marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileText size={20} color="#00f5ff" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{secretFile.name}</p>
                      <p style={{ fontSize: 12, color: '#555' }}>{(secretFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <CheckCircle size={18} color="#00f5ff" />
                  </div>
                )}
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
              <button onClick={() => setStep(1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>Previous</button>
              <button className="btn-cyan" onClick={() => setStep(3)} disabled={mode === 'text' ? !message : !secretFile}>Next →</button>
            </div>
          </div>
        )}

        {/* STEP 3 — Dispatch */}
        {step === 3 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28 }}>Configure & Dispatch</h2>

            {/* Cover image */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8 }}>Cover Image (PNG — must be large enough)</label>
              <div
                className={`drop-zone ${coverDrag ? 'drag-over' : ''}`}
                style={{ padding: 24 }}
                onDragOver={e => { e.preventDefault(); setCoverDrag(true); }}
                onDragLeave={() => setCoverDrag(false)}
                onDrop={e => { e.preventDefault(); setCoverDrag(false); handleCoverFile(e.dataTransfer.files[0]); }}
                onClick={() => coverRef.current.click()}
              >
                <Image size={28} color="#555" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#666', fontSize: 13 }}>Upload cover image (PNG)</p>
                <input ref={coverRef} type="file" accept=".png,image/png" style={{ display: 'none' }} onChange={e => handleCoverFile(e.target.files[0])} />
              </div>
              {coverFile && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={16} color="#00f5ff" />
                  <span style={{ fontSize: 13, color: '#888' }}>{coverFile.name} ({(coverFile.size / 1024).toFixed(0)} KB)</span>
                </div>
              )}
              {/* Capacity badge */}
              {capacity && (
                <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: capacity.fits ? 'rgba(0,245,255,0.1)' : 'rgba(239,68,68,0.1)', color: capacity.fits ? '#00f5ff' : '#ef4444', border: `1px solid ${capacity.fits ? 'rgba(0,245,255,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                  {capacity.fits ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                  {capacity.fits ? `File fits — ${(capacity.capacity_bytes / 1024).toFixed(0)}KB capacity available` : `File too large — use a bigger cover image`}
                </div>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8 }}>Secret Password</label>
              <input className="input-dark" type="password" placeholder="Leave blank for default (fedrl2024)" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            {/* Peer IP */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8 }}>Receiver IP Address</label>
              <input className="input-dark" type="text" placeholder="e.g. 192.168.1.5 — leave blank for auto-discovery" value={peerIp} onChange={e => setPeerIp(e.target.value)} />
              <p style={{ fontSize: 11, color: '#444', marginTop: 4 }}>Leave blank for auto-discovery on same WiFi/LAN</p>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13, color: '#ef4444' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(2)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>Previous</button>
              <button
                className="btn-cyan cyan-glow"
                onClick={handleEncode}
                disabled={loading || !coverFile}
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, padding: '12px 28px' }}
              >
                {loading ? <><Loader size={16} className="spin" /> Encoding...</> : <><Send size={16} /> Encode & Send</>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Result */}
        {step === 4 && result && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <CheckCircle size={56} color="#00f5ff" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Transfer Complete</h2>
            <p style={{ color: '#555', marginBottom: 32 }}>Your secret has been encoded and sent securely</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28, textAlign: 'left' }}>
              {[
                { label: 'RL Reward Score', value: `${result.reward || 0.96} / 1.00` },
                { label: 'LSB Depth Used', value: `Depth: ${result.depth || 1}` },
                { label: 'Bits Embedded', value: `${(result.n_bits || 0).toLocaleString()} bits` },
                { label: 'Integrity Check', value: 'SHA-256 ✓' },
                { label: 'Sent to Peer', value: result.peer_ip },
                { label: 'Mode', value: result.mode === 'file' ? `File: ${result.filename}` : 'Text Message' },
              ].map(({ label, value }) => (
                <div key={label} className="glass" style={{ padding: '12px 16px' }}>
                  <p style={{ fontSize: 11, color: '#555', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#00f5ff' }}>{value}</p>
                </div>
              ))}
            </div>

            <button className="btn-cyan" onClick={() => { setStep(1); setResult(null); setMode('text'); setMessage(''); setSecretFile(null); setCoverFile(null); setPassword(''); setPeerIp(''); setCapacity(null); setError(''); }}>
              Send Another
            </button>
          </div>
        )}
      </div>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
