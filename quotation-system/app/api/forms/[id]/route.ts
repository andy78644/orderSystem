import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Context = {
  params: Promise<{ id: string }>
}

// GET /api/forms/:id - 獲取單一表單
export async function GET(request: NextRequest, context: Context) {
  try {
    await requireAuth()
    const { id } = await context.params

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
      return NextResponse.json({ error: '表單不存在' }, { status: 404 })
    }

    return NextResponse.json({ form })
  } catch (error) {
    console.error('Get form error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }
    return NextResponse.json({ error: '獲取表單失敗' }, { status: 500 })
  }
}

// PUT /api/forms/:id - 更新表單
export async function PUT(request: NextRequest, context: Context) {
  try {
    const session = await requireAuth()
    const { id } = await context.params
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

    // 檢查表單是否存在
    const existingForm = await prisma.form.findUnique({
      where: { id },
      include: {
        quotations: true,
      },
    })

    if (!existingForm) {
      return NextResponse.json({ error: '表單不存在' }, { status: 404 })
    }

    // 刪除舊的商品項目，建立新的
    await prisma.formItem.deleteMany({
      where: { formId: id },
    })

    // 更新表單
    const form = await prisma.form.update({
      where: { id },
      data: {
        title,
        vendorName,
        vendorPhone,
        vendorEmail,
        allowMultipleSubmissions: allowMultipleSubmissions || false,
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

    return NextResponse.json({ form })
  } catch (error) {
    console.error('Update form error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }
    return NextResponse.json({ error: '更新表單失敗' }, { status: 500 })
  }
}

// DELETE /api/forms/:id - 刪除表單
export async function DELETE(request: NextRequest, context: Context) {
  try {
    await requireAuth()
    const { id } = await context.params

    const form = await prisma.form.findUnique({
      where: { id },
    })

    if (!form) {
      return NextResponse.json({ error: '表單不存在' }, { status: 404 })
    }

    await prisma.form.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete form error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }
    return NextResponse.json({ error: '刪除表單失敗' }, { status: 500 })
  }
}
