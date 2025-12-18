import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL

export async function POST(request: NextRequest) {
	if (!FASTAPI_URL) {
		return NextResponse.json(
			{ detail: 'FASTAPI_URL is not configured on the server' },
			{ status: 500 },
		)
	}

	const body = await request.json().catch(() => null)

	if (!body || !body.username || !body.password || !body.invite_code) {
		return NextResponse.json(
			{ detail: 'username, password and invite_code are required' },
			{ status: 400 },
		)
	}

	try {
		const backendResponse = await fetch(`${FASTAPI_URL}/api/auth/signup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})

		const data = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return NextResponse.json(data ?? null, { status: backendResponse.status });
    }

    const res = NextResponse.json(data, { status: backendResponse.status });

		if (data && 'access_token' in data) {
			res.cookies.set('access_token', data.access_token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				path: '/',
				maxAge: 60 * 60 * 24 * 8,
			});
		}

    return res;
	} catch (error) {
		console.error('Signup proxy error:', error)
		return NextResponse.json(
			{ detail: 'Failed to connect to authentication service' },
			{ status: 502 },
		)
	}
}

