import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Context = {
  params: Promise<{ id: string }>
}

// POST /api/public/forms/:id/submit - 提交報價
export async function POST(request: NextRequest, context: Context) {
  try {
    const { id: formId } = await context.params
    const body = await request.json()
    const { items: quotationItems } = body

    // 驗證輸入
    if (!quotationItems || !Array.isArray(quotationItems) || quotationItems.length === 0) {
      return NextResponse.json(
        { error: '請提供報價項目' },
        { status: 400 }
      )
    }

    // 獲取表單資訊
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        items: true,
        quotations: true,
      },
    })

    if (!form) {
      return NextResponse.json({ error: '表單不存在' }, { status: 404 })
    }

    // 檢查表單狀態
    if (form.status === 'closed') {
      return NextResponse.json(
        { error: '此表單已關閉，無法填寫' },
        { status: 403 }
      )
    }

    // 檢查是否已提交（如果不允許多次提交）
    const hasSubmitted = form.quotations.length > 0
    if (!form.allowMultipleSubmissions && hasSubmitted) {
      return NextResponse.json(
        { error: '此表單只能提交一次' },
        { status: 403 }
      )
    }

    // 驗證所有項目都有單價
    for (const item of quotationItems) {
      if (!item.formItemId || item.unitPrice === undefined || item.unitPrice === null) {
        return NextResponse.json(
          { error: '請填寫所有商品的單價' },
          { status: 400 }
        )
      }
    }

    // 計算版本號
    const version = hasSubmitted ? form.quotations.length + 1 : 1

    // 計算總金額和準備報價項目
    let totalAmount = 0
    const itemsToCreate = []

    for (const item of quotationItems) {
      const formItem = form.items.find((fi: { id: string }) => fi.id === item.formItemId)
      if (!formItem) {
        return NextResponse.json(
          { error: '無效的商品項目' },
          { status: 400 }
        )
      }

      const unitPrice = parseFloat(item.unitPrice)
      const quantity = formItem.quantity
      const subtotal = unitPrice * quantity

      totalAmount += subtotal

      itemsToCreate.push({
        formItemId: item.formItemId,
        unitPrice,
        quantity,
        subtotal,
      })
    }

    // 獲取 IP 地址（選用）
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // 建立報價記錄
    const quotation = await prisma.quotation.create({
      data: {
        formId,
        version,
        totalAmount,
        ipAddress,
        items: {
          create: itemsToCreate,
        },
      },
      include: {
        items: {
          include: {
            formItem: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      quotation: {
        id: quotation.id,
        version: quotation.version,
        totalAmount: quotation.totalAmount,
        submittedAt: quotation.submittedAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Submit quotation error:', error)
    return NextResponse.json(
      { error: '提交報價失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
