import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 驗證輸入
    if (!email || !password) {
      return NextResponse.json(
        { error: '請提供 email 和密碼' },
        { status: 400 }
      )
    }

    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: '帳號或密碼錯誤' },
        { status: 401 }
      )
    }

    // 驗證密碼
    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: '帳號或密碼錯誤' },
        { status: 401 }
      )
    }

    // 建立 session
    await createSession(user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '登入失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
