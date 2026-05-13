import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import RouteGuard from '@/components/RouteGuard'

export const metadata = {
  title: 'CineProd — Film Production Management',
  description: 'Internal film production database management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground font-sans">
        <AuthProvider>
          <RouteGuard>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
