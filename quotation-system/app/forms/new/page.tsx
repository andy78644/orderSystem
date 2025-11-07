import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FormEditor from '../components/FormEditor'
import Header from '../components/Header'

type Props = {
  searchParams: Promise<{ copy?: string }>
}

export default async function NewFormPage({ searchParams }: Props) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const params = await searchParams
  let initialData = undefined

  // 如果有 copy 參數，從數據庫加載該表單的數據作為初始數據
  if (params.copy) {
    const sourceForm = await prisma.form.findUnique({
      where: { id: params.copy },
      include: {
        items: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    if (sourceForm) {
      initialData = {
        title: `${sourceForm.title} - 複製`,
        vendorName: sourceForm.vendorName,
        vendorPhone: sourceForm.vendorPhone,
        vendorEmail: sourceForm.vendorEmail,
        allowMultipleSubmissions: sourceForm.allowMultipleSubmissions,
        items: sourceForm.items.map((item) => ({
          productName: item.productName,
          specification: item.specification || '',
          quantity: item.quantity.toString(),
          unit: item.unit,
        })),
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={session.user} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {params.copy ? '複製表單' : '建立新表單'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {params.copy
              ? '修改表單資訊後儲存以建立新表單'
              : '填寫以下資訊以建立新的報價表單'
            }
          </p>
        </div>

        <FormEditor mode="create" initialData={initialData} />
      </main>
    </div>
  )
}
