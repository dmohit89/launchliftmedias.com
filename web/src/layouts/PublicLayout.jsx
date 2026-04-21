import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  CalendarDaysIcon, 
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'Influencers', href: '/influencers' },
]

export default function PublicLayout() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold gradient-text">
                InfluenceHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/admin/login" className="btn-secondary text-sm">
                Admin Login
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 border-t border-gray-100"
            >
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block py-2 font-medium ${
                    location.pathname === item.href
                      ? 'text-primary-600'
                      : 'text-gray-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100 mt-4">
                <Link
                  to="/admin/login"
                  className="btn-secondary text-sm w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Login
                </Link>
              </div>
            </motion.div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-display font-bold text-white">
                  InfluenceHub
                </span>
              </div>
              <p className="text-sm max-w-md">
                Connecting brands with influencers for impactful events and collaborations. 
                Join our platform to discover opportunities and grow your influence.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/events" className="hover:text-white transition-colors">Browse Events</Link></li>
                <li><Link to="/influencers" className="hover:text-white transition-colors">Top Influencers</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>hello@influencehub.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            © {new Date().getFullYear()} InfluenceHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
