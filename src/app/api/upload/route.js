import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { PythonShell } from 'python-shell'

export const config = {
  api: {
    bodyParser: false, // Ensure body parser is disabled
  },
}

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file1 = formData.get('image1')
    const file2 = formData.get('image2')

    if (!file1 || !file2) {
      return NextResponse.json({ error: 'Both images are required' }, { status: 400 })
    }

    // Save files to "uploads" folder
    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir)
    }

    const filePath1 = path.join(uploadDir, file1.name)
    const filePath2 = path.join(uploadDir, file2.name)

    await fs.promises.writeFile(filePath1, Buffer.from(await file1.arrayBuffer()))
    await fs.promises.writeFile(filePath2, Buffer.from(await file2.arrayBuffer()))

    // Run Python script
    const options = {
      mode: 'text',
      pythonOptions: ['-u'],
      scriptPath: process.cwd(),
      args: ['-i1', filePath1, '-i2', filePath2, '-o', './public/output.mp4'],
    }

   const message= await PythonShell.run('film_interpolate.py', options)
   .catch(error => {
    console.error('Python execution failed:', error);
    throw new Error('Video generation failed');
  });
  const outputPath = path.join(process.cwd(), 'public', 'output.mp4');
if (!fs.existsSync(outputPath)) {
  throw new Error('Python script did not generate output file');
}

    return NextResponse.json({ success: true, videoUrl: '/output.mp4' }, { status: 200 })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
