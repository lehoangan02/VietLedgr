import { NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL!;

function extractBase64(img: any): string | null {
	if (!img) return null
	if (typeof img === 'string') {
		return img.replace(/^data:image\/\w+;base64,/, '')
	}
	if (typeof img === 'object') {
		if (img.base64) return img.base64
		if (img.b64) return img.b64
		if (img.data) return String(img.data)
	}
	return null
}

export async function POST(request: Request) {
	const body = await request.json().catch(() => ({}))

	const resp = await fetch(
        `${FASTAPI_URL}/api/ai/generate-report`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	})

	if (!resp.ok) {
		const text = await resp.text().catch(() => 'Unable to fetch backend')
		return NextResponse.json({ error: text }, { status: resp.status })
	}

	const data = await resp.json().catch(() => ({}))

	const rawImages = Array.isArray(data.images) ? data.images : []

	const processed = rawImages.map((img: any, idx: number) => {
		const b64 = extractBase64(img)
		if (!b64) return null
		const dataUrl = `data:image/png;base64,${b64}`
		// decode to bytes (Node runtime Buffer is available in Next API routes)
		const buffer = Buffer.from(b64, 'base64')
		const bytes = Array.from(buffer)
		return {
			fileName: `image-${idx}.png`,
			dataUrl,
			bytes,
		}
	}).filter(Boolean)

	return NextResponse.json({
		code: data.code ?? null,
		report: data.report ?? null,
		images: processed,
	})
}

