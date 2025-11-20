import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Context = {
  params: Promise<{ id: string }>
}

// GET /api/public/forms/:id - 獲取公開表單（廠商填寫頁面用）
export async function GET(request: NextRequest, context: Context) {
  try {
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
          select: {
            id: true,
          },
        },
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

    // 檢查是否已經提交過（如果不允許多次提交）
    const hasSubmitted = form.quotations.length > 0
    if (!form.allowMultipleSubmissions && hasSubmitted) {
      return NextResponse.json(
        {
          error: '此表單只能提交一次，已經提交過了',
          hasSubmitted: true,
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      form: {
        id: form.id,
        title: form.title,
        vendorName: form.vendorName,
        vendorPhone: form.vendorPhone,
        vendorEmail: form.vendorEmail,
        allowMultipleSubmissions: form.allowMultipleSubmissions,
        items: form.items,
        hasSubmitted,
      },
    })
  } catch (error) {
    console.error('Get public form error:', error)
    return NextResponse.json({ error: '獲取表單失敗' }, { status: 500 })
  }
}
