import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/store/AppContext';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Registry } from '@/pages/Registry';
import { ReleaseGraph } from '@/pages/ReleaseGraph';
import { ProofTrace } from '@/pages/ProofTrace';
import { ChangeLens } from '@/pages/ChangeLens';
import { QueuePilot } from '@/pages/QueuePilot';
import { Reports } from '@/pages/Reports';
import { AuditTrail } from '@/pages/AuditTrail';
import { Settings } from '@/pages/Settings';
import { FdrDetail } from '@/pages/FdrDetail';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/registry" element={<Registry />} />
            <Route path="/release-graph" element={<ReleaseGraph />} />
            <Route path="/proof-trace" element={<ProofTrace />} />
            <Route path="/change-lens" element={<ChangeLens />} />
            <Route path="/queue-pilot" element={<QueuePilot />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit" element={<AuditTrail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/fdr/:id" element={<FdrDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
