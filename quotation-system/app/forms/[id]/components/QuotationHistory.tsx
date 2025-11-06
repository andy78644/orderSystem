'use client'

import { useState } from 'react'

type FormItem = {
  id: string
  productName: string
  specification: string | null
  quantity: number
  unit: string
}

type QuotationItem = {
  id: string
  unitPrice: number
  quantity: number
  subtotal: number
  formItem: FormItem
}

type Quotation = {
  id: string
  version: number
  totalAmount: number | null
  submittedAt: Date
  items: QuotationItem[]
}

type Form = {
  id: string
  title: string
  items: FormItem[]
  quotations: Quotation[]
}

type QuotationHistoryProps = {
  form: Form
}

export default function QuotationHistory({ form }: QuotationHistoryProps) {
  const [groupBy, setGroupBy] = useState<'time' | 'product'>('time')

  if (form.quotations.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 shadow text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">尚無報價記錄</h3>
        <p className="mt-2 text-sm text-gray-500">
          此表單還沒有廠商提交報價
        </p>
      </div>
    )
  }

  // 依時間排列（預設）
  const renderByTime = () => {
    return (
      <div className="space-y-6">
        {form.quotations.map((quotation) => (
          <div key={quotation.id} className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  報價版本 #{quotation.version}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  提交時間：{new Date(quotation.submittedAt).toLocaleString('zh-TW')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">總金額</p>
                <p className="text-xl font-bold text-gray-900">
                  NT$ {quotation.totalAmount?.toLocaleString('zh-TW', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="py-2 text-left text-sm font-medium text-gray-700">商品</th>
                    <th className="py-2 text-right text-sm font-medium text-gray-700">單價</th>
                    <th className="py-2 text-right text-sm font-medium text-gray-700">數量</th>
                    <th className="py-2 text-right text-sm font-medium text-gray-700">小計</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quotation.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 text-sm text-gray-900">
                        {item.formItem.productName}
                        {item.formItem.specification && (
                          <span className="text-gray-500"> ({item.formItem.specification})</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-sm text-gray-900">
                        NT$ {item.unitPrice.toLocaleString('zh-TW', { minimumFractionDigits: 2 })}
                        <span className="text-gray-500 text-xs">/{item.formItem.unit}</span>
                      </td>
                      <td className="py-3 text-right text-sm text-gray-900">
                        {item.quantity} {item.formItem.unit}
                      </td>
                      <td className="py-3 text-right text-sm font-medium text-gray-900">
                        NT$ {item.subtotal.toLocaleString('zh-TW', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 依商品分組
  const renderByProduct = () => {
    return (
      <div className="space-y-6">
        {form.items.map((formItem) => {
          // 取得該商品的所有報價歷史
          const productQuotations = form.quotations.map((quotation) => {
            const item = quotation.items.find((i) => i.formItem.id === formItem.id)
            return {
              quotationId: quotation.id,
              version: quotation.version,
              submittedAt: quotation.submittedAt,
              unitPrice: item?.unitPrice || 0,
              subtotal: item?.subtotal || 0,
            }
          })

          return (
            <div key={formItem.id} className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">
                {formItem.productName}
                {formItem.specification && (
                  <span className="text-gray-500"> ({formItem.specification})</span>
                )}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                數量：{formItem.quantity} {formItem.unit}
              </p>

              <div className="mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 text-left text-sm font-medium text-gray-700">版本</th>
                      <th className="py-2 text-left text-sm font-medium text-gray-700">提交時間</th>
                      <th className="py-2 text-right text-sm font-medium text-gray-700">單價</th>
                      <th className="py-2 text-right text-sm font-medium text-gray-700">小計</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {productQuotations.map((pq, index) => (
                      <tr
                        key={pq.quotationId}
                        className={index === 0 ? 'bg-blue-50' : ''}
                      >
                        <td className="py-3 text-sm text-gray-900">
                          #{pq.version}
                          {index === 0 && (
                            <span className="ml-2 inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold text-blue-800">
                              最新
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-sm text-gray-900">
                          {new Date(pq.submittedAt).toLocaleString('zh-TW')}
                        </td>
                        <td className="py-3 text-right text-sm text-gray-900">
                          NT$ {pq.unitPrice.toLocaleString('zh-TW', { minimumFractionDigits: 2 })}
                          <span className="text-gray-500 text-xs">/{formItem.unit}</span>
                        </td>
                        <td className="py-3 text-right text-sm font-medium text-gray-900">
                          NT$ {pq.subtotal.toLocaleString('zh-TW', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">報價歷史</h2>
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => setGroupBy('time')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
              groupBy === 'time'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            依時間
          </button>
          <button
            onClick={() => setGroupBy('product')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
              groupBy === 'product'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            依商品
          </button>
        </div>
      </div>

      {groupBy === 'time' ? renderByTime() : renderByProduct()}
    </div>
  )
}
