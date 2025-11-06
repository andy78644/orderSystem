import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Context = {
  params: Promise<{ id: string }>
}

// POST /api/forms/:id/duplicate - 複製表單
export async function POST(request: NextRequest, context: Context) {
  try {
    const session = await requireAuth()
    const { id } = await context.params

    // 獲取原表單
    const originalForm = await prisma.form.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    if (!originalForm) {
      return NextResponse.json({ error: '表單不存在' }, { status: 404 })
    }

    // 建立新表單（複製商品項目，但不複製廠商資訊和報價）
    const newForm = await prisma.form.create({
      data: {
        title: `${originalForm.title} - 複製`,
        vendorName: '',
        vendorPhone: '',
        vendorEmail: '',
        allowMultipleSubmissions: originalForm.allowMultipleSubmissions,
        createdById: session.user.id,
        items: {
          create: originalForm.items.map((item) => ({
            productName: item.productName,
            specification: item.specification,
            quantity: item.quantity,
            unit: item.unit,
            sortOrder: item.sortOrder,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({ form: newForm }, { status: 201 })
  } catch (error) {
    console.error('Duplicate form error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }
    return NextResponse.json({ error: '複製表單失敗' }, { status: 500 })
  }
}
