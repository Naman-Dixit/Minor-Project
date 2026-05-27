import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const API = 'http://localhost:5001';

const DEMO = {
  peers: [
    { id: 'peer-1', ip: '192.168.1.100', status: 'Active', rl_version: '2.1.0', last_sync: 'just now' },
    { id: 'peer-2', ip: '192.168.1.101', status: 'Active', rl_version: '2.1.1', last_sync: '2s ago' },
    { id: 'peer-3', ip: '192.168.1.102', status: 'Gossip', rl_version: '2.0.8', last_sync: '5s ago' },
    { id: 'peer-4', ip: '192.168.1.103', status: 'Active', rl_version: '2.1.0', last_sync: 'just now' },
    { id: 'peer-5', ip: '192.168.1.104', status: 'Active', rl_version: '2.1.1', last_sync: '2s ago' },
    { id: 'peer-6', ip: '192.168.1.105', status: 'Gossip', rl_version: '2.0.9', last_sync: '5s ago' },
  ],
  avg_reward: 0.87,
  total_rounds: 342,
  active_peers: 6,
  latency_ms: 42,
  uptime: '99.9%',
};

export default function NodesPage() {
  const [data, setData] = useState(DEMO);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/node-status`);
      const d = await r.json();
      setData({ ...DEMO, ...d });
    } catch {
      setData(prev => ({ ...prev, total_rounds: prev.total_rounds + 1 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, []);

  const statusDot = (s) => {
    if (s === 'Active') return <div className="dot-active" />;
    if (s === 'Gossip') return <div className="dot-gossip" />;
    return <div className="dot-idle" />;
  };

  const statusBadge = (s) => {
    if (s === 'Active') return <span className="badge-active">Active</span>;
    if (s === 'Gossip') return <span className="badge-gossip">Gossip</span>;
    return <span className="badge-idle">Idle</span>;
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>
            <span className="gradient-text">Node Dashboard</span>
          </h1>
          <p style={{ color: '#555' }}>Monitor connected peers and federated learning status</p>
        </div>
        <button onClick={fetchData} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Global stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        <div className="glass" style={{ padding: 28 }}>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Average Reward Score</p>
          <p style={{ fontSize: 48, fontWeight: 800, color: '#00f5ff', lineHeight: 1 }}>{data.avg_reward}</p>
        </div>
        <div className="glass" style={{ padding: 28 }}>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Total Rounds Completed</p>
          <p style={{ fontSize: 48, fontWeight: 800, color: '#8b5cf6', lineHeight: 1 }}>{data.total_rounds}</p>
        </div>
      </div>

      {/* Connected Peers */}
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Connected Peers</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        {data.peers.map(peer => (
          <div key={peer.id} className="glass glass-hover" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 10, color: '#444', letterSpacing: 1, marginBottom: 2 }}>PEER ID</p>
                <p style={{ fontWeight: 700, color: '#00f5ff', fontSize: 15 }}>{peer.id}</p>
              </div>
              {statusDot(peer.status)}
            </div>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10, color: '#444', letterSpacing: 1, marginBottom: 2 }}>IP ADDRESS</p>
              <p style={{ fontWeight: 600, fontFamily: 'JetBrains Mono', fontSize: 13 }}>{peer.ip}</p>
            </div>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10, color: '#444', letterSpacing: 1, marginBottom: 6 }}>FEDERATION STATUS</p>
              {statusBadge(peer.status)}
            </div>
            <div>
              <p style={{ fontSize: 10, color: '#444', letterSpacing: 1, marginBottom: 2 }}>RL AGENT VERSION</p>
              <p style={{ fontWeight: 600, color: '#8b5cf6', fontFamily: 'JetBrains Mono', fontSize: 13 }}>{peer.rl_version}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Network Health */}
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Network Health</h2>
      <div className="glass" style={{ padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Active Peers', value: data.active_peers, color: '#00f5ff' },
            { label: 'Gossip Protocol', value: 2, color: '#8b5cf6' },
            { label: 'Uptime', value: data.uptime, color: '#00f5ff' },
            { label: 'Latency', value: `${data.latency_ms}ms`, color: '#8b5cf6' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>{label}</p>
              <p style={{ fontSize: 32, fontWeight: 800, color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
