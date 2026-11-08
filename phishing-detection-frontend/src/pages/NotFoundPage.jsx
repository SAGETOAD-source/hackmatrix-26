import { Link } from 'react-router-dom'
import { ShieldAlert, Terminal, LayoutDashboard, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0A14] light:bg-[#F7F5FF] text-[#F2F0FF] light:text-[#1E1B4B] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Ambient Radar Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#7C5CFF]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#14122A] p-0.5 shadow-lg shadow-[#7C5CFF]/30 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#0B0A14] flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-[#FF4D6D]" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-[#A78BFF] font-bold">
                ERR_TELEMETRY_TARGET_UNMAPPED
              </span>
              <h1 className="font-heading text-5xl font-extrabold tracking-tight text-[#F2F0FF] light:text-[#1E1B4B]">
                404
              </h1>
              <h2 className="font-heading text-lg font-bold text-[#F2F0FF] light:text-[#1E1B4B]">
                Requested Sentinel Route Not Found
              </h2>
            </div>

            <p className="text-xs text-[#A29FC9] light:text-[#6E6893] leading-relaxed">
              The route or telemetry resource you requested does not exist on this Sentinel node or has been quarantined.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                as={Link}
                to="/dashboard"
                variant="primary"
                size="md"
                icon={LayoutDashboard}
                className="w-full sm:w-auto"
              >
                SOC Overview
              </Button>
              <Button
                as={Link}
                to="/scanner"
                variant="outline"
                size="md"
                icon={Terminal}
                className="w-full sm:w-auto"
              >
                URL Scanner
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
