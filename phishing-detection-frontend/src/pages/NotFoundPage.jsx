import { Link } from 'react-router-dom'
import { ShieldAlert, Terminal, LayoutDashboard, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#101C22] light:bg-[#E0F2ED] text-[#F5F7F6] light:text-[#101C22] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Ambient Radar Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#167D83]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#167D83] to-[#18343A] p-0.5 shadow-lg shadow-[#167D83]/30 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#101C22] flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-[#EF6464]" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-[#55B9AD] font-bold">
                ERR_TELEMETRY_TARGET_UNMAPPED
              </span>
              <h1 className="font-heading text-5xl font-extrabold tracking-tight text-[#F5F7F6] light:text-[#101C22]">
                404
              </h1>
              <h2 className="font-heading text-lg font-bold text-[#F5F7F6] light:text-[#101C22]">
                Requested Sentinel Route Not Found
              </h2>
            </div>

            <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] leading-relaxed">
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
