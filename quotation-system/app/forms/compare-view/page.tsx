import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Header from '../components/Header'
import CompareSelector from './components/CompareSelector'

export default async function CompareViewPage() {
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">比較報價</h1>
          <p className="mt-2 text-sm text-gray-700">
            選擇廠商查看其歷史報價比較
          </p>
        </div>

        <CompareSelector
          forms={forms}
          vendorsWithQuotations={vendorsWithQuotations}
        />
      </main>
    </div>
  )
}
