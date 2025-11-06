'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type FormItem = {
  id?: string
  productName: string
  specification: string
  quantity: string
  unit: string
}

type FormEditorProps = {
  initialData?: {
    id?: string
    title: string
    vendorName: string
    vendorPhone: string
    vendorEmail: string
    allowMultipleSubmissions: boolean
    items: FormItem[]
  }
  mode: 'create' | 'edit'
}

export default function FormEditor({ initialData, mode }: FormEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    vendorName: initialData?.vendorName || '',
    vendorPhone: initialData?.vendorPhone || '',
    vendorEmail: initialData?.vendorEmail || '',
    allowMultipleSubmissions: initialData?.allowMultipleSubmissions || false,
  })

  const [items, setItems] = useState<FormItem[]>(
    initialData?.items || [
      { productName: '', specification: '', quantity: '', unit: '' },
    ]
  )

  const addItem = () => {
    setItems([...items, { productName: '', specification: '', quantity: '', unit: '' }])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) {
      alert('至少需要一個商品項目')
      return
    }
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof FormItem, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 驗證
      if (!formData.title || !formData.vendorName || !formData.vendorPhone || !formData.vendorEmail) {
        setError('請填寫所有必填欄位')
        setLoading(false)
        return
      }

      const hasEmptyItem = items.some(
        (item) => !item.productName || !item.quantity || !item.unit
      )
      if (hasEmptyItem) {
        setError('請填寫所有商品項目的必填欄位')
        setLoading(false)
        return
      }

      const url = mode === 'create' ? '/api/forms' : `/api/forms/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '操作失敗')
      }

      router.push('/forms')
      router.refresh()
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : '操作失敗，請稍後再試')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900">基本資訊</h3>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              表單標題 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="例如：2024-Q1 辦公用品採購"
            />
          </div>

          <div>
            <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700">
              廠商名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="vendorName"
              value={formData.vendorName}
              onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="例如：ABC 文具公司"
            />
          </div>

          <div>
            <label htmlFor="vendorPhone" className="block text-sm font-medium text-gray-700">
              聯絡電話 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="vendorPhone"
              value={formData.vendorPhone}
              onChange={(e) => setFormData({ ...formData, vendorPhone: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="例如：02-1234-5678"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="vendorEmail" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="vendorEmail"
              value={formData.vendorEmail}
              onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="例如：contact@example.com"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allowMultipleSubmissions}
                onChange={(e) =>
                  setFormData({ ...formData, allowMultipleSubmissions: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">允許廠商修改報價（可多次提交）</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              若不勾選，廠商只能提交一次報價，提交後無法修改
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">商品清單</h3>
          <button
            type="button"
            onClick={addItem}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            新增商品
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {items.map((item, index) => (
            <div key={index} className="rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700">商品 {index + 1}</h4>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    刪除
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    商品名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.productName}
                    onChange={(e) => updateItem(index, 'productName', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="例如：手套"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">規格描述</label>
                  <input
                    type="text"
                    value={item.specification}
                    onChange={(e) => updateItem(index, 'specification', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="例如：醫療用"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    數量 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="例如：10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    單位 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="例如：打、個、盒"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '處理中...' : mode === 'create' ? '建立表單' : '儲存變更'}
        </button>
      </div>
    </form>
  )
}
