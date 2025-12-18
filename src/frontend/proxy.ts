import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    const accessToken = request.cookies.get('access_token')?.value

    const isRootRoute = pathname === '/' || pathname === ''
    if (isRootRoute) {
        const redirectTarget = accessToken ? '/dashboard' : '/login'
        return NextResponse.redirect(new URL(redirectTarget, request.url))
    }

    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
    if (accessToken && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
