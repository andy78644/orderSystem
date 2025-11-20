'use client'

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
  vendorName: string
  createdAt: Date
  items: FormItem[]
  quotations: Quotation[]
}

type CompareTableProps = {
  forms: Form[]
}

// 產生商品的唯一識別鍵
function getProductKey(item: FormItem): string {
  return `${item.productName}|${item.specification || ''}`
}

// 整理商品資料
function organizeProducts(forms: Form[]) {
  const productMap = new Map<string, {
    productName: string
    specification: string | null
    unit: string
    quantity: number
    prices: (number | null)[]
  }>()

  // 收集所有唯一的商品
  forms.forEach((form, formIndex) => {
    form.items.forEach(item => {
      const key = getProductKey(item)
      if (!productMap.has(key)) {
        productMap.set(key, {
          productName: item.productName,
          specification: item.specification,
          unit: item.unit,
          quantity: item.quantity,
          prices: new Array(forms.length).fill(null),
        })
      }
    })
  })

  // 填入價格資料
  forms.forEach((form, formIndex) => {
    if (form.quotations.length > 0) {
      const latestQuotation = form.quotations[0]
      latestQuotation.items.forEach(quotationItem => {
        const key = getProductKey(quotationItem.formItem)
        const product = productMap.get(key)
        if (product) {
          product.prices[formIndex] = quotationItem.unitPrice
        }
      })
    }
  })

  return Array.from(productMap.values())
}

export default function CompareTable({ forms }: CompareTableProps) {
  const products = organizeProducts(forms)

  // 計算每個商品的最低價格索引
  const getLowestPriceIndex = (prices: (number | null)[]): number | null => {
    let minPrice = Infinity
    let minIndex: number | null = null

    prices.forEach((price, index) => {
      if (price !== null && price < minPrice) {
        minPrice = price
        minIndex = index
      }
    })

    return minIndex
  }

  // 計算價格變化
  const getPriceChange = (prices: (number | null)[], index: number): { change: number; percent: number } | null => {
    if (index === 0 || prices[index] === null) return null

    // 找到前一個有效價格
    for (let i = index - 1; i >= 0; i--) {
      if (prices[i] !== null && prices[index] !== null) {
        const change = prices[index]! - prices[i]!
        const percent = (change / prices[i]!) * 100
        return { change, percent }
      }
    }

    return null
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              商品名稱
            </th>
            {forms.map((form, index) => (
              <th key={form.id} scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900">#{index + 1}</span>
                  <span className="mt-1 text-xs font-normal text-gray-600">
                    {new Date(form.createdAt).toLocaleDateString('zh-TW')}
                  </span>
                  <span className="mt-1 text-xs font-normal text-gray-500 truncate max-w-[150px]" title={form.title}>
                    {form.title}
                  </span>
                </div>
              </th>
            ))}
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              最低價
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {products.map((product, productIndex) => {
            const lowestPriceIndex = getLowestPriceIndex(product.prices)
            const allPricesNull = product.prices.every(p => p === null)

            return (
              <tr key={productIndex} className={productIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                    {product.specification && (
                      <div className="text-sm text-gray-500">({product.specification})</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {product.quantity} {product.unit}
                    </div>
                  </div>
                </td>
                {product.prices.map((price, priceIndex) => {
                  const isLowest = !allPricesNull && lowestPriceIndex === priceIndex && price !== null
                  const priceChange = getPriceChange(product.prices, priceIndex)
                  const hasQuotation = forms[priceIndex].quotations.length > 0

                  return (
                    <td
                      key={priceIndex}
                      className={`whitespace-nowrap px-6 py-4 text-center ${
                        isLowest ? 'bg-green-50' : ''
                      }`}
                    >
                      {!hasQuotation ? (
                        <div className="text-sm text-gray-400">未報價</div>
                      ) : price === null ? (
                        <div className="text-sm text-gray-400">-</div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className={`text-sm font-medium ${isLowest ? 'text-green-700' : 'text-gray-900'}`}>
                            NT$ {price.toLocaleString('zh-TW', { minimumFractionDigits: 2 })}
                            {isLowest && <span className="ml-1">⭐</span>}
                          </div>
                          <div className="text-xs text-gray-500">/ {product.unit}</div>
                          {priceChange && (
                            <div className={`mt-1 text-xs font-medium ${
                              priceChange.change < 0 ? 'text-green-600' : priceChange.change > 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {priceChange.change > 0 ? '+' : ''}
                              NT$ {priceChange.change.toFixed(2)}
                              {' '}
                              ({priceChange.change > 0 ? '+' : ''}{priceChange.percent.toFixed(1)}%)
                              {priceChange.change < 0 ? ' ↓' : priceChange.change > 0 ? ' ↑' : ''}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  )
                })}
                <td className="whitespace-nowrap px-6 py-4 text-center">
                  {!allPricesNull && lowestPriceIndex !== null && product.prices[lowestPriceIndex] !== null ? (
                    <div className="text-sm font-medium text-green-700">
                      NT$ {product.prices[lowestPriceIndex]!.toLocaleString('zh-TW', { minimumFractionDigits: 2 })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">-</div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
        {/* 總計行 */}
        <tfoot className="bg-gray-100">
          <tr>
            <td className="px-6 py-4 text-sm font-bold text-gray-900">
              總計
            </td>
            {forms.map((form) => {
              const quotation = form.quotations[0]
              const hasQuotation = quotation && quotation.totalAmount !== null

              return (
                <td key={form.id} className="whitespace-nowrap px-6 py-4 text-center">
                  {hasQuotation ? (
                    <div className="text-sm font-bold text-gray-900">
                      NT$ {quotation.totalAmount!.toLocaleString('zh-TW', { minimumFractionDigits: 2 })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">-</div>
                  )}
                </td>
              )
            })}
            <td className="px-6 py-4"></td>
          </tr>
        </tfoot>
      </table>

      {/* 說明 */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded bg-green-50 border border-green-200"></span>
            <span>最低價</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⭐</span>
            <span>= 此商品的最低價格</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">↓</span>
            <span>= 價格下降</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-600">↑</span>
            <span>= 價格上漲</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">-</span>
            <span>= 該表單無此商品</span>
          </div>
        </div>
      </div>
    </div>
  )
}
