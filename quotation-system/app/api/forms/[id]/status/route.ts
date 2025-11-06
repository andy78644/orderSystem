import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Context = {
  params: Promise<{ id: string }>
}

// PATCH /api/forms/:id/status - 更新表單狀態
export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requireAuth()
    const { id } = await context.params
    const body = await request.json()
    const { status } = body

    if (!status || (status !== 'open' && status !== 'closed')) {
      return NextResponse.json(
        { error: '無效的狀態值' },
        { status: 400 }
      )
    }

    const form = await prisma.form.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ form })
  } catch (error) {
    console.error('Update status error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }
    return NextResponse.json({ error: '更新狀態失敗' }, { status: 500 })
  }
}
