import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Fragment, useState } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentTextIcon,
  TagIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Events', href: '/admin/events', icon: CalendarDaysIcon },
  { name: 'Influencers', href: '/admin/influencers', icon: UserGroupIcon },
  { name: 'Applications', href: '/admin/applications', icon: DocumentTextIcon },
  { name: 'Categories', href: '/admin/categories', icon: TagIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xl font-display font-bold gradient-text">
                        Admin
                      </span>
                    </div>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul className="flex flex-1 flex-col gap-y-2">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-colors ${
                              isActive(item.href)
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-100 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold gradient-text">
                Admin
              </span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-100 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
              </button>

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-900/5">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-50' : ''
                          } flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700`}
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
