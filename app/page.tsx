'use client'
import ChatInput from '@/components/ChatInput';
import MarkdownRenderer from '@/components/MarkDownRenderer';
import { Navbar01 } from '@/components/ui/shadcn-io/navbar-01';
import { useState, useRef } from 'react';
export enum MessageType {
  Sender = "sender",
  Receiver = "Receiver"
}
type Message = {
  type: MessageType
  content: string
}


export default function Home() {
  const [messages, setMessage] = useState<Array<Message>>([])
  const [file, setFile] = useState<File>()
  const fileRef = useRef<File | undefined>(undefined)
  async function apiCall(input: string) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: input
      })
    });

    const reader = response.body?.getReader()
    const decoder = new TextDecoder("utf-8")
    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read()
      if (done) break;
      const chunk = decoder.decode(value, { stream: true })

      setMessage((prev) => {
        const lastRole = prev[prev.length - 1];
        if (lastRole.type == MessageType.Receiver) {
          return [...prev.slice(0, -1), {
            type: MessageType.Receiver,
            content: lastRole.content + chunk
          }]
        }
        return [...prev, {
          type: MessageType.Receiver,
          content: chunk
        }]
      })
    }
  }
  return (
    <div className='h-screen overflow-y-auto no-scrollbar'>
      {/* NavBar section */}
      <div>
        <Navbar01 />
      </div>
      {/* Messages section */}
      <div className='h-[calc(100vh-64px)] overflow-y-auto no-scrollbar mb-20'>
        {messages.map((message, index) => (
          message.type == MessageType.Sender ?
            <div key={index} className='relative top-0 left-0 flex justify-end'>
              <p className='p-4 bg-[#303030] rounded-lg m-4 text-white'>
                {message.content}
              </p>
            </div>
            :
            <div className='relative top-0 left-0 flex justify-start max-w-[50vw] p-4 bg-gray-500 rounded-lg m-4 text-white'>
              <MarkdownRenderer>
                {message.content}
              </MarkdownRenderer>
            </div>
        ))}
      </div>
      {/* Chat input box */}
      <div className='fixed bottom-0 w-full'>
        <ChatInput clickHandler={async (input: string, file?: File) => {
          fileRef.current = file // Store in ref for immediate access
          setMessage((prev) => [...prev, {
            type: MessageType.Sender,
            content: input
          }])
          // Use fileRef.current to get the latest file value
          // Route based on whether file is uploaded or not
          if (file) {
            // File is uploaded, use /query endpoint
            console.log("File uploaded, using /query endpoint:", file.name)
            const response = await fetch('http://localhost:5000/query', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                question: input
              })
            });

            const result = await response.json()
            apiCall(JSON.stringify(result))
          } else {
            apiCall(input)
          }
        }} />
      </div>
    </div>
  );
}
