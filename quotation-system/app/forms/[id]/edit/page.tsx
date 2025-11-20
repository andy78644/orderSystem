import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FormEditor from '../../components/FormEditor'
import Header from '../../components/Header'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditFormPage({ params }: Props) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const { id } = await params

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
      quotations: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!form) {
    redirect('/forms')
  }

  const initialData = {
    id: form.id,
    title: form.title,
    vendorName: form.vendorName,
    vendorPhone: form.vendorPhone,
    vendorEmail: form.vendorEmail,
    allowMultipleSubmissions: form.allowMultipleSubmissions,
    items: form.items.map((item: {
      id: string;
      productName: string;
      specification: string | null;
      quantity: number;
      unit: string;
    }) => ({
      id: item.id,
      productName: item.productName,
      specification: item.specification || '',
      quantity: item.quantity.toString(),
      unit: item.unit,
    })),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={session.user} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">編輯表單</h1>
          <p className="mt-2 text-sm text-gray-700">
            修改表單資訊
          </p>
          {form.quotations && form.quotations.length > 0 && (
            <div className="mt-2 rounded-md bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ 此表單已有 {form.quotations.length} 筆報價記錄，修改可能影響報價數據
              </p>
            </div>
          )}
        </div>

        <FormEditor mode="edit" initialData={initialData} />
      </main>
    </div>
  )
}
