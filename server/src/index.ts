import { serve } from 'bun'
import { Hono } from 'hono'
import { Queue } from 'bullmq'
import path = require('path');
import { promises as fs } from 'fs';
const app = new Hono()
const myQueue = new Queue('file-upload-queue');

app.post('/upload', async (c) => {
  const body = await c.req.parseBody()
  const file = body['file']
  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadDir = path.join(process.cwd(), "uploads")
    await fs.mkdir(uploadDir, {recursive: true})

    const filePath = path.join(uploadDir, file.name)
    await fs.writeFile(filePath, buffer)
    await myQueue.add('file-upload', {
      filename: file.name,
      type: file.type,
      path: filePath,
      size: file.size,
    })
  }

  return c.json({ message: 'File uploaded successfully' })
})


console.log(`Server is running 5000`)
serve({
  fetch: app.fetch,
  port: 5000,
})