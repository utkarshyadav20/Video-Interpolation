import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const videoPath = path.join(process.cwd(), 'public', 'output1.mp4')

    if (!fs.existsSync(videoPath)) {
      console.error('Video file not found:', videoPath)
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const file = await fs.promises.readFile(videoPath)

    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error serving video:', error)
    return NextResponse.json({ error: 'Failed to serve video' }, { status: 500 })
  }
}
