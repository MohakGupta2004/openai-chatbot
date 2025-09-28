import { serve } from 'bun'
import { Hono } from 'hono'
import { Queue } from 'bullmq'
import path = require('path');
import { promises as fs } from 'fs';
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import {cors} from 'hono/cors'
const app = new Hono()
const myQueue = new Queue('file-upload-queue');
app.use('*', cors())
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY
});
console.log(process.env.QDRANT_URL)
let vectorStore: QdrantVectorStore;
(async () => {
  vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: "file-upload-vector-store",
  });
})();


app.post('/upload', async (c) => {
  const body = await c.req.parseBody()
  const file = body['file']
  console.log(file)
  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadDir = path.join(process.cwd(), "uploads")
    await fs.mkdir(uploadDir, { recursive: true })

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

app.post('/query', async (c) => {
  const { question } = await c.req.json()
  if (!vectorStore) {
    return c.json({ message: 'Vector store is not initialized yet' }, 503)
  }
  const ret = await vectorStore.asRetriever({
    k: 3
  });
  const result = await ret.invoke(question);
  return c.json({ result })
}) 


console.log(`Server is running 5000`)
serve({
  fetch: app.fetch,
  port: 5000,
})