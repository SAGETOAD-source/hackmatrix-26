import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import ScannerPage from './pages/ScannerPage'
import ScanResultsPage from './pages/ScanResultsPage'
import SecurityAnalysisPage from './pages/SecurityAnalysisPage'
import ScanHistoryPage from './pages/ScanHistoryPage'
import StyleguidePage from './pages/StyleguidePage'
import NotFoundPage from './pages/NotFoundPage'
import CommandPalette from './components/ui/CommandPalette'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <CommandPalette />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/results" element={<ScanResultsPage />} />
          <Route path="/security" element={<SecurityAnalysisPage />} />
          <Route path="/security-analysis" element={<SecurityAnalysisPage />} />
          <Route path="/history" element={<ScanHistoryPage />} />
          <Route path="/styleguide" element={<StyleguidePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
