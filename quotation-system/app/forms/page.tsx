import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FormsList from './components/FormsList'
import Header from './components/Header'

export default async function FormsPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // 獲取所有表單
  const forms = await prisma.form.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      quotations: {
        select: {
          id: true,
        },
      },
    },
  })

  // 獲取所有有報價記錄的廠商（去重）
  const formsWithQuotations = await prisma.form.findMany({
    where: {
      quotations: {
        some: {},
      },
    },
    select: {
      vendorName: true,
    },
    distinct: ['vendorName'],
  })

  const vendorsWithQuotations = formsWithQuotations.map(f => f.vendorName)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={session.user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">報價表單管理</h1>
            <p className="mt-2 text-sm text-gray-700">
              建立和管理報價表單，查看廠商報價
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <a
              href="/forms/new"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              建立新表單
            </a>
          </div>
        </div>

        <div className="mt-8">
          <FormsList forms={forms} vendorsWithQuotations={vendorsWithQuotations} />
        </div>
      </main>
    </div>
  )
}
