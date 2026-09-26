import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { InvestigatePage } from './pages/InvestigatePage';
import { CasesPage } from './pages/CasesPage';
import { HistoryPage } from './pages/HistoryPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-soc-bg text-soc-text font-sans antialiased flex flex-col selection:bg-soc-cyan selection:text-white transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="no-print bg-soc-secondary border-t border-soc-border py-4 px-6 text-center text-xs font-mono text-soc-muted transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MailTrace AI — AI-Powered Email Threat Detection & Forensic Intelligence Platform</span>
          <span className="text-[11px] text-emerald-600 font-semibold">Certified SOC Evidentiary Integrity Standard</span>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
            <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
            <Route path="/investigate" element={<AppLayout><InvestigatePage /></AppLayout>} />
            <Route path="/investigate/:id" element={<AppLayout><InvestigatePage /></AppLayout>} />
            <Route path="/cases" element={<AppLayout><CasesPage /></AppLayout>} />
            <Route path="/history" element={<AppLayout><HistoryPage /></AppLayout>} />
            <Route path="/intelligence" element={<AppLayout><IntelligencePage /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
