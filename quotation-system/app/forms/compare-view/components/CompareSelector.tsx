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

type CompareSelectorProps = {
  forms: Form[]
  vendorsWithQuotations: string[]
}

export default function CompareSelector({ forms, vendorsWithQuotations }: CompareSelectorProps) {
  const router = useRouter()
  const [selectedVendor, setSelectedVendor] = useState<string>('')

  const handleVendorCompare = () => {
    if (!selectedVendor) {
      alert('請選擇要比較的廠商')
      return
    }

    // 找出該廠商所有有報價的表單
    const vendorForms = forms.filter(
      f => f.vendorName === selectedVendor && f.quotations.length > 0
    )

    if (vendorForms.length === 0) {
      alert('此廠商目前沒有任何報價記錄')
      return
    }

    // 導向比較頁面
    const formIds = vendorForms.map(f => f.id).join(',')
    router.push(`/forms/compare?ids=${formIds}`)
  }

  // 統計每個廠商的報價次數
  const vendorQuotationCounts = vendorsWithQuotations.map(vendor => {
    const count = forms.filter(
      f => f.vendorName === vendor && f.quotations.length > 0
    ).length
    return { vendor, count }
  })

  return (
    <div className="space-y-6">
      {/* 廠商選擇器 */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="space-y-4">
          <div>
            <label htmlFor="vendor-select" className="block text-sm font-medium text-gray-700 mb-2">
              選擇廠商
            </label>
            <select
              id="vendor-select"
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-base text-black"
              disabled={vendorsWithQuotations.length === 0}
            >
              <option value="">
                {vendorsWithQuotations.length === 0
                  ? '暫無可比較的廠商報價'
                  : '請選擇廠商...'}
              </option>
              {vendorQuotationCounts.map(({ vendor, count }) => (
                <option key={vendor} value={vendor}>
                  {vendor} ({count} 張報價表單)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleVendorCompare}
            disabled={!selectedVendor}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            查看比較
          </button>
        </div>

        {vendorsWithQuotations.length === 0 && (
          <div className="mt-4 rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              💡 <strong>提示：</strong>當廠商提交報價後，您就可以在這裡選擇廠商查看其歷史報價比較
            </p>
          </div>
        )}
      </div>

      {/* 廠商報價統計列表 */}
      {vendorsWithQuotations.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">廠商報價統計</h2>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    廠商名稱
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    報價表單數
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendorQuotationCounts.map(({ vendor, count }) => {
                  const vendorForms = forms.filter(
                    f => f.vendorName === vendor && f.quotations.length > 0
                  )
                  return (
                    <tr key={vendor} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {vendor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {count} 張表單
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            const formIds = vendorForms.map(f => f.id).join(',')
                            router.push(`/forms/compare?ids=${formIds}`)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          查看比較 →
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
