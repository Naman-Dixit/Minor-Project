import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ParticleBackground from './components/ParticleBackground';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import SendPage from './pages/Send';
import ReceivePage from './pages/Receive';
import NodesPage from './pages/Nodes';
import AboutPage from './pages/About';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <ParticleBackground />
      <Sidebar />
      <main className="main-content content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/send" element={<SendPage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/nodes" element={<NodesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
