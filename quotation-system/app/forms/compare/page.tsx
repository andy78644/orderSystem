import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Header from '../components/Header'
import CompareTable from './components/CompareTable'

type Props = {
  searchParams: Promise<{ ids?: string }>
}

export default async function ComparePage({ searchParams }: Props) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const params = await searchParams
  const ids = params.ids?.split(',') || []

  if (ids.length < 2) {
    redirect('/forms')
  }

  // 載入所有選中的表單及其報價
  const forms = await prisma.form.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      items: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
      quotations: {
        orderBy: {
          submittedAt: 'desc',
        },
        take: 1, // 只取最新的報價
        include: {
          items: {
            include: {
              formItem: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc', // 按時間順序排列
    },
  })

  if (forms.length === 0) {
    redirect('/forms')
  }

  // 檢查是否為同一廠商
  const vendors = new Set(forms.map(f => f.vendorName))
  if (vendors.size > 1) {
    redirect('/forms')
  }

  const vendorName = forms[0].vendorName

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={session.user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">報價比較</h1>
              <p className="mt-2 text-sm text-gray-700">
                廠商：{vendorName}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                比較 {forms.length} 張表單的報價
              </p>
            </div>
            <a
              href="/forms"
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              返回列表
            </a>
          </div>
        </div>

        <CompareTable forms={forms} />
      </main>
    </div>
  )
}
