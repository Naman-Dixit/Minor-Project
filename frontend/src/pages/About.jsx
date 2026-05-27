import { Shield, Zap, GitBranch } from 'lucide-react';

const tech = [
  { label: 'Frontend Framework', value: 'React 18 + TypeScript', color: '#00f5ff' },
  { label: 'Styling', value: 'Tailwind CSS + Glassmorphism', color: '#00f5ff' },
  { label: 'Encryption Standard', value: 'AES-256 + SHA-256', color: '#00f5ff' },
  { label: 'Network Protocol', value: 'P2P + Federated Learning', color: '#00f5ff' },
  { label: 'Steganography Method', value: 'LSB + RL Optimization', color: '#00f5ff' },
  { label: 'API Interface', value: 'RESTful + WebSocket Ready', color: '#00f5ff' },
];

const coreTech = [
  { icon: Shield, title: 'Military-Grade Security', desc: 'AES-256 encryption ensures your data remains secure from unauthorized access.' },
  { icon: Zap, title: 'AI-Powered Optimization', desc: 'Reinforcement learning optimizes pixel encoding for minimal detectability.' },
  { icon: GitBranch, title: 'Federated Learning', desc: 'Decentralized intelligence network without central authority or single point of failure.' },
];

const features = [
  'Multi-step wizard for intuitive data encoding',
  'Real-time capacity validation for file uploads',
  'Live terminal for monitoring receiver status',
  'Federated peer network dashboard',
  'RL agent reward scoring system',
  'SHA-256 integrity verification',
  'Fully responsive dark-mode interface',
  'Production-ready error handling',
];

export default function AboutPage() {
  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>
        <span className="gradient-text">About StegoVault</span>
      </h1>
      <p style={{ color: '#555', marginBottom: 36 }}>Research-grade secure P2P document delivery system</p>

      {/* Mission */}
      <div className="glass" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Mission</h2>
        <p style={{ color: '#888', lineHeight: 1.8, marginBottom: 12 }}>
          StegoVault is a production-ready, research-grade system for decentralized document delivery.
          It combines cutting-edge steganography with advanced cryptography to provide the highest level
          of security and privacy for sensitive communications.
        </p>
        <p style={{ color: '#888', lineHeight: 1.8 }}>
          Our system leverages Artificial Intelligence and Federated Reinforcement Learning to create an
          intelligent, adaptive network that continuously improves data hiding capabilities while
          maintaining strict security standards.
        </p>
      </div>

      {/* Core Technology */}
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }} className="cyan-text">Core Technology</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
        {coreTech.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass glass-hover" style={{ padding: 28 }}>
            <Icon size={36} color="#00f5ff" style={{ marginBottom: 16 }} />
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</h3>
            <p style={{ color: '#666', fontSize: 13, lineHeight: 1.7 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Technical Architecture */}
      <div className="glass" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Technical Architecture</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {tech.map(({ label, value, color }) => (
            <div key={label}>
              <p style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>{label}</p>
              <p style={{ fontWeight: 700, color, fontSize: 15 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="glass" style={{ padding: 32, marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Key Features</h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {features.map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#888', fontSize: 14 }}>
              <span style={{ color: '#00f5ff', fontSize: 16 }}>•</span> {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Project Title */}
      <div style={{ textAlign: 'center', padding: '32px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: 12, color: '#333', lineHeight: 1.7 }}>
          Steganography-Based Secure Document Delivery System<br />
          Using Federated Reinforcement Learning
        </p>
        <p style={{ fontSize: 11, color: '#222', marginTop: 8 }}>
          StegoVault v1.0.0 • Production-Ready Frontend
        </p>
        <p style={{ fontSize: 11, color: '#222' }}>Built with React, Tailwind CSS, Python, and PyTorch</p>
      </div>
    </div>
  );
}
