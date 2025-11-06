import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user: session.user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: '獲取用戶資訊失敗' },
      { status: 500 }
    )
  }
}
