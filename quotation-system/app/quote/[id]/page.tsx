'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'

type FormItem = {
  id: string
  productName: string
  specification: string | null
  quantity: number
  unit: string
}

type Form = {
  id: string
  title: string
  vendorName: string
  vendorPhone: string
  vendorEmail: string
  allowMultipleSubmissions: boolean
  items: FormItem[]
  hasSubmitted: boolean
}

type Props = {
  params: Promise<{ id: string }>
}

export default function QuotePage({ params }: Props) {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState<Form | null>(null)
  const [prices, setPrices] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchForm()
  }, [id])

  const fetchForm = async () => {
    try {
      const res = await fetch(`/api/public/forms/${id}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '無法載入表單')
        setLoading(false)
        return
      }

      setForm(data.form)
      setLoading(false)
    } catch (err) {
      console.error('Fetch form error:', err)
      setError('載入表單失敗，請稍後再試')
      setLoading(false)
    }
  }

  const handlePriceChange = (formItemId: string, value: string) => {
    setPrices({ ...prices, [formItemId]: value })
  }

  const calculateSubtotal = (formItemId: string): number => {
    const item = form?.items.find((i) => i.id === formItemId)
    if (!item) return 0

    const price = parseFloat(prices[formItemId] || '0')
    return price * item.quantity
  }

  const calculateTotal = (): number => {
    if (!form) return 0
    return form.items.reduce((sum, item) => sum + calculateSubtotal(item.id), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // 驗證所有項目都有單價
      const allItemsHavePrice = form?.items.every((item) => {
        const price = prices[item.id]
        return price && price.trim() !== '' && parseFloat(price) >= 0
      })

      if (!allItemsHavePrice) {
        setError('請填寫所有商品的單價')
        setSubmitting(false)
        return
      }

      // 準備提交資料
      const quotationItems = form?.items.map((item) => ({
        formItemId: item.id,
        unitPrice: parseFloat(prices[item.id]),
      }))

      const res = await fetch(`/api/public/forms/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: quotationItems }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '提交失敗')
      }

      setSuccess(true)
      setSubmitting(false)
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : '提交失敗，請稍後再試')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-900">無法載入表單</h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-900">報價提交成功！</h2>
            <p className="mt-2 text-gray-600">
              您的報價已成功提交。管理員將會審核您的報價。
            </p>
            <p className="mt-4 text-sm text-gray-500">
              總金額：NT$ {calculateTotal().toLocaleString('zh-TW', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!form) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg bg-white p-6 shadow-md sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
            <p className="mt-2 text-sm text-gray-600">請填寫以下商品的單價</p>
          </div>

          <div className="mb-6 rounded-md bg-gray-50 p-4">
            <h2 className="text-sm font-medium text-gray-700">廠商資訊</h2>
            <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
              <div>
                <span className="font-medium">公司名稱：</span>
                {form.vendorName}
              </div>
              <div>
                <span className="font-medium">聯絡電話：</span>
                {form.vendorPhone}
              </div>
              <div className="sm:col-span-2">
                <span className="font-medium">Email：</span>
                {form.vendorEmail}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {form.items.map((item, index) => (
                <div key={item.id} className="rounded-md border border-gray-200 p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-medium text-gray-900">
                      {index + 1}. {item.productName}
                    </h3>
                    {item.specification && (
                      <p className="mt-1 text-sm text-gray-600">規格：{item.specification}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-600">
                      數量：{item.quantity} {item.unit}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        單價（元/{item.unit}）<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={prices[item.id] || ''}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black placeholder:text-gray-600 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-base"
                        placeholder="請輸入單價"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">小計</label>
                      <div className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700 sm:text-base">
                        NT$ {calculateSubtotal(item.id).toLocaleString('zh-TW', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-md bg-gray-50 p-4">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>總計</span>
                <span>NT$ {calculateTotal().toLocaleString('zh-TW', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? '提交中...' : '提交報價'}
              </button>
            </div>

            {form.allowMultipleSubmissions && form.hasSubmitted && (
              <p className="mt-4 text-sm text-gray-500 text-center">
                ℹ️ 此表單允許多次提交，您的新報價將會覆蓋之前的版本
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
