import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Network, Lock, GitBranch, Globe } from 'lucide-react';

const features = [
  {
    icon: Zap,
    color: '#00f5ff',
    title: 'AI-Powered Steganography',
    desc: 'Reinforcement learning agents select optimal pixels for imperceptible data embedding. Invisible to the human eye.',
  },
  {
    icon: Shield,
    color: '#8b5cf6',
    title: 'AES-256 Encrypted',
    desc: 'Military-grade encryption with SHA-256 integrity verification. Your secrets stay secret, mathematically guaranteed.',
  },
  {
    icon: Network,
    color: '#00f5ff',
    title: 'Federated Learning',
    desc: 'Nodes learn together via gossip-based federation. No central server, no surveillance, pure decentralization.',
  },
];

const techStack = [
  { label: 'Python Backend', icon: '🐍' },
  { label: 'PyTorch ML', icon: '🔥' },
  { label: 'AES-256', icon: '🔒' },
  { label: 'P2P Network', icon: '🌐' },
  { label: 'React Frontend', icon: '⚛️' },
  { label: 'OpenCV', icon: '👁️' },
  { label: 'NumPy', icon: '📊' },
  { label: 'SHA-256', icon: '✓' },
];

const howItWorks = [
  { n: 1, title: 'Upload Secret', desc: 'Select file or text to encrypt' },
  { n: 2, title: 'Select Cover Image', desc: 'Choose image for steganography' },
  { n: 3, title: 'AI Optimization', desc: 'RL agent finds optimal pixels' },
  { n: 4, title: 'Encrypt & Embed', desc: 'AES-256 + LSB steganography' },
  { n: 5, title: 'P2P Delivery', desc: 'Send directly to receiver' },
  { n: 6, title: 'Verify & Decode', desc: 'SHA-256 integrity check' },
  { n: 7, title: 'Share Knowledge', desc: 'Nodes sync via federated learning' },
];

export default function Landing() {
  const nav = useNavigate();
  return (
    <div className="fade-in">
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 0 60px', position: 'relative' }}>
        <h1 style={{ fontSize: 'clamp(48px,8vw,96px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
          <span className="gradient-text">StegoVault</span>
        </h1>
        <p style={{ fontSize: 18, color: '#888', marginBottom: 12, letterSpacing: 1 }}>
          Hide. Encrypt. Deliver. Decentralized.
        </p>
        <p style={{ fontSize: 14, color: '#555', maxWidth: 540, margin: '0 auto 16px', lineHeight: 1.7 }}>
          A peer-to-peer secure document delivery system using AI-based steganography and
          federated reinforcement learning. Hide your secrets in plain sight.
        </p>
        <p style={{ fontSize: 12, color: '#00f5ff88', marginBottom: 36, letterSpacing: 2 }}>
          Military-grade AES-256 encryption • Federated Learning • Zero-Knowledge P2P
        </p>
        <button className="btn-cyan cyan-glow" onClick={() => nav('/send')} style={{ fontSize: 16, padding: '14px 36px', borderRadius: 999 }}>
          Get Started →
        </button>
      </div>

      {/* Advanced Security Features */}
      <div style={{ marginBottom: 60 }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Advanced Security Features</h2>
        <p style={{ textAlign: 'center', color: '#555', fontSize: 14, marginBottom: 40 }}>
          Built with cutting-edge cryptography and distributed learning
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="glass glass-hover" style={{ padding: 28 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${color}22`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: 16
              }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: '#666', fontSize: 13, lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise-Grade Technology */}
      <div style={{ marginBottom: 60 }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 36 }}>Enterprise-Grade Technology</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {techStack.map(({ label, icon }) => (
            <div key={label} className="glass glass-hover" style={{ padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <p style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div style={{ marginBottom: 60 }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 40 }}>How It Works</h2>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {howItWorks.map(({ n, title, desc }, i) => (
            <div key={n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', paddingBottom: 24, position: 'relative' }}>
              {/* vertical line */}
              {i < howItWorks.length - 1 && (
                <div style={{ position: 'absolute', left: 19, top: 40, bottom: 0, width: 2, background: 'rgba(0,245,255,0.15)' }} />
              )}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(0,245,255,0.1)', border: '2px solid rgba(0,245,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, color: '#00f5ff'
              }}>{n}</div>
              <div style={{ paddingTop: 8 }}>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{title}</p>
                <p style={{ color: '#555', fontSize: 13 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', color: '#333', fontSize: 12, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        StegoVault © 2024 | Decentralized Secure Document Delivery System
      </div>
    </div>
  );
}
