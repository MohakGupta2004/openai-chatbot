import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
const worker = new Worker('file-upload-queue', async (job) => {
    const file = job.data
    console.log(file)
    const loader = new PDFLoader(file.path);
    const document = await loader.load();
    /* const textSplitter = new CharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 0,
    });
    const texts = await textSplitter.splitText(document[0].pageContent);
    console.log(texts) */
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY
    });
    console.log(process.env.QDRANT_URL)
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANT_URL,
        collectionName: "file-upload-vector-store",
    });
    const result = await vectorStore.addDocuments(document);
    console.log(result)
    console.log(`All docs are added to vector store`);
}, {
    concurrency: 100,
    connection: {
        host: 'localhost',
        port: 6379
    }
})