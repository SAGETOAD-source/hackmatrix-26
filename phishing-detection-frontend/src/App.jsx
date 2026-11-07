import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import ScannerPage from './pages/ScannerPage'
import ScanResultsPage from './pages/ScanResultsPage'
import SecurityAnalysisPage from './pages/SecurityAnalysisPage'
import ScanHistoryPage from './pages/ScanHistoryPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/results" element={<ScanResultsPage />} />
          <Route path="/security" element={<SecurityAnalysisPage />} />
          <Route path="/security-analysis" element={<SecurityAnalysisPage />} />
          <Route path="/history" element={<ScanHistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
