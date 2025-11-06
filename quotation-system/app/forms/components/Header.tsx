'use client'

import { useRouter } from 'next/navigation'

type HeaderProps = {
  user: {
    id: string
    email: string
    name: string
  }
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()

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

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">報價系統</h1>
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
