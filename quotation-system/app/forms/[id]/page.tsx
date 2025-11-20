import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Header from '../components/Header'
import QuotationHistory from './components/QuotationHistory'

type Props = {
  params: Promise<{ id: string }>
}

export default async function FormDetailPage({ params }: Props) {
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
        orderBy: {
          submittedAt: 'desc',
        },
        include: {
          items: {
            include: {
              formItem: true,
            },
          },
        },
      },
    },
  })

  if (!form) {
    redirect('/forms')
  }

  const getPublicUrl = () => {
    // 在 server component 中無法使用 window.location，因此需要從環境變數或配置中獲取
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    return `${baseUrl}/quote/${form.id}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={session.user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
              <p className="mt-2 text-sm text-gray-700">
                查看報價詳情與歷史記錄
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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* 左側：表單資訊 */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-medium text-gray-900">表單資訊</h2>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">廠商名稱</dt>
                  <dd className="mt-1 text-sm text-gray-900">{form.vendorName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">聯絡電話</dt>
                  <dd className="mt-1 text-sm text-gray-900">{form.vendorPhone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{form.vendorEmail}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">表單狀態</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        form.status === 'open'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {form.status === 'open' ? '開啟' : '關閉'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">填寫模式</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {form.allowMultipleSubmissions ? '可多次提交' : '只能提交一次'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">報價次數</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {form.quotations.length} 次
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">建立時間</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(form.createdAt).toLocaleString('zh-TW')}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900">表單連結</h3>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getPublicUrl()}
                    className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  將此連結分享給廠商以填寫報價
                </p>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900">商品清單</h3>
                <ul className="mt-2 space-y-2">
                  {form.items.map((item: {
                    id: string;
                    productName: string;
                    specification: string | null;
                    quantity: number;
                    unit: string;
                  }, index: number) => (
                    <li key={item.id} className="text-sm text-gray-700">
                      {index + 1}. {item.productName}
                      {item.specification && (
                        <span className="text-gray-500"> ({item.specification})</span>
                      )}
                      <br />
                      <span className="text-xs text-gray-500">
                        數量：{item.quantity} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 右側：報價歷史 */}
          <div className="lg:col-span-2">
            <QuotationHistory form={form} />
          </div>
        </div>
      </main>
    </div>
  )
}
