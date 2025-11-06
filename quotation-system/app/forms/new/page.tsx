import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import FormEditor from '../components/FormEditor'
import Header from '../components/Header'

export default async function NewFormPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={session.user} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">建立新表單</h1>
          <p className="mt-2 text-sm text-gray-700">
            填寫以下資訊以建立新的報價表單
          </p>
        </div>

        <FormEditor mode="create" />
      </main>
    </div>
  )
}
