'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Form = {
  id: string
  title: string
  vendorName: string
  vendorPhone: string
  vendorEmail: string
  status: string
  createdAt: Date
  quotations: { id: string }[]
}

type FormsListProps = {
  forms: Form[]
}

export default function FormsList({ forms }: FormsListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedForms, setSelectedForms] = useState<string[]>([])
  const [compareMode, setCompareMode] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此表單？此操作無法復原，所有相關報價記錄也會被刪除。')) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('刪除失敗')
      }

      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert('刪除失敗，請稍後再試')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open'
    const action = newStatus === 'closed' ? '關閉' : '開啟'

    if (!confirm(`確定要${action}此表單？`)) {
      return
    }

    try {
      const res = await fetch(`/api/forms/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error('更新失敗')
      }

      router.refresh()
    } catch (error) {
      console.error('Toggle status error:', error)
      alert('更新失敗，請稍後再試')
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/forms/${id}/duplicate`, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('複製失敗')
      }

      const data = await res.json()
      router.push(`/forms/${data.form.id}/edit`)
    } catch (error) {
      console.error('Duplicate error:', error)
      alert('複製失敗，請稍後再試')
    }
  }

  const getPublicUrl = (formId: string) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/quote/${formId}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('連結已複製到剪貼簿')
  }

  const handleSelectForm = (formId: string) => {
    setSelectedForms(prev =>
      prev.includes(formId)
        ? prev.filter(id => id !== formId)
        : [...prev, formId]
    )
  }

  const handleCompare = () => {
    if (selectedForms.length < 2) {
      alert('請至少選擇 2 張表單進行比較')
      return
    }

    // 檢查是否為同一廠商
    const selectedFormsData = forms.filter(f => selectedForms.includes(f.id))
    const vendors = new Set(selectedFormsData.map(f => f.vendorName))

    if (vendors.size > 1) {
      alert('目前只支援比較同一廠商的報價。請選擇同一廠商的表單。')
      return
    }

    // 導向比較頁面
    const formIds = selectedForms.join(',')
    router.push(`/forms/compare?ids=${formIds}`)
  }

  const toggleCompareMode = () => {
    setCompareMode(!compareMode)
    setSelectedForms([])
  }

  if (forms.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">尚無表單</h3>
        <p className="mt-1 text-sm text-gray-500">開始建立您的第一個報價表單</p>
        <div className="mt-6">
          <a
            href="/forms/new"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            建立新表單
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 比較模式工具列 */}
      <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleCompareMode}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              compareMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {compareMode ? '取消比較' : '比較報價'}
          </button>
          {compareMode && (
            <span className="text-sm text-gray-600">
              已選擇 {selectedForms.length} 張表單
            </span>
          )}
        </div>
        {compareMode && selectedForms.length >= 2 && (
          <button
            onClick={handleCompare}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            開始比較 ({selectedForms.length} 張表單)
          </button>
        )}
      </div>

      {/* 表單列表 */}
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {forms.map((form) => (
            <li key={form.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-start gap-4">
                  {/* 多選框 */}
                  {compareMode && (
                    <div className="flex items-center pt-1">
                      <input
                        type="checkbox"
                        checked={selectedForms.includes(form.id)}
                        onChange={() => handleSelectForm(form.id)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{form.title}</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">廠商：</span>
                      {form.vendorName}
                    </div>
                    <div>
                      <span className="font-medium">電話：</span>
                      {form.vendorPhone}
                    </div>
                    <div>
                      <span className="font-medium">Email：</span>
                      {form.vendorEmail}
                    </div>
                    <div>
                      <span className="font-medium">狀態：</span>
                      <span
                        className={`ml-2 inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          form.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {form.status === 'open' ? '開啟' : '關閉'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">報價次數：</span>
                      {form.quotations.length} 次
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">建立時間：</span>
                      {new Date(form.createdAt).toLocaleString('zh-TW')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`/forms/${form.id}`}
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  查看報價
                </a>
                <a
                  href={`/forms/${form.id}/edit`}
                  className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  編輯
                </a>
                <button
                  onClick={() => handleToggleStatus(form.id, form.status)}
                  className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  {form.status === 'open' ? '關閉表單' : '開啟表單'}
                </button>
                <button
                  onClick={() => handleDuplicate(form.id)}
                  className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  複製
                </button>
                <button
                  onClick={() => copyToClipboard(getPublicUrl(form.id))}
                  className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  複製連結
                </button>
                <button
                  onClick={() => handleDelete(form.id)}
                  disabled={deletingId === form.id}
                  className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === form.id ? '刪除中...' : '刪除'}
                </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
    </div>
  )
}
