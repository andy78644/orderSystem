import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/forms - 獲取所有表單
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const forms = await prisma.form.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        quotations: {
          select: {
            id: true,
          },
        },
      },
    })

    return NextResponse.json({ forms })
  } catch (error) {
    console.error('Get forms error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }
    return NextResponse.json({ error: '獲取表單失敗' }, { status: 500 })
  }
}

// POST /api/forms - 建立新表單
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const {
      title,
      vendorName,
      vendorPhone,
      vendorEmail,
      allowMultipleSubmissions,
      items,
    } = body

    // 驗證必填欄位
    if (!title || !vendorName || !vendorPhone || !vendorEmail || !items || items.length === 0) {
      return NextResponse.json(
        { error: '請填寫所有必填欄位並至少新增一個商品' },
        { status: 400 }
      )
    }

    // 建立表單和商品項目
    const form = await prisma.form.create({
      data: {
        title,
        vendorName,
        vendorPhone,
        vendorEmail,
        allowMultipleSubmissions: allowMultipleSubmissions || false,
        createdById: session.user.id,
        items: {
          create: items.map((item: any, index: number) => ({
            productName: item.productName,
            specification: item.specification || null,
            quantity: parseFloat(item.quantity),
            unit: item.unit,
            sortOrder: index,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({ form }, { status: 201 })
  } catch (error) {
    console.error('Create form error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }
    return NextResponse.json({ error: '建立表單失敗' }, { status: 500 })
  }
}
