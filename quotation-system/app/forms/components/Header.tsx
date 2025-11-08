'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

type HeaderProps = {
  user: {
    id: string
    email: string
    name: string
  }
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
  }

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-gray-900">報價系統</h1>
            <nav className="flex gap-4">
              <Link
                href="/forms"
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  isActive('/forms') && !pathname?.includes('/compare')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                表單列表
              </Link>
              <Link
                href="/forms/compare-view"
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  pathname?.includes('/compare')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                比較報價
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {user.name} ({user.email})
            </span>
            <button
              onClick={handleLogout}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
