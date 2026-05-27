import { NavLink } from 'react-router-dom';
import { Send, Inbox, Network, Info, Lock, X, Menu } from 'lucide-react';
import { useState } from 'react';

const links = [
  { to: '/send',    icon: Send,    label: 'Send'    },
  { to: '/receive', icon: Inbox,   label: 'Receive' },
  { to: '/nodes',   icon: Network, label: 'Nodes'   },
  { to: '/about',   icon: Info,    label: 'About'   },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Lock size={20} color="#00f5ff" />
          <span style={{ fontWeight: 700, fontSize: 16, color: '#00f5ff' }}>STEGOVAULT</span>
        </div>
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <nav className={`sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Lock size={22} color="#00f5ff" />
            <span style={{ fontWeight: 700, fontSize: 18, color: '#00f5ff', letterSpacing: 1 }}>STEGOVAULT</span>
          </div>
          <p style={{ fontSize: 11, color: '#444', marginLeft: 32 }}>Secure & Decentralized</p>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div style={{ fontSize: 10, color: '#333', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 16 }}>
          v1.0 — Decentralized Secure Delivery
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}
    </>
  );
}
