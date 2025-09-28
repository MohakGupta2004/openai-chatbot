'use client'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { PaperclipIcon, SendIcon } from 'lucide-react'
import { Upload } from './Upload'

export default function ChatInput({ clickHandler }: {
    clickHandler: (input: string, file?: File) => void
}) {
    const [input, setInput] = useState<string>("")
    const [file, setFile] = useState<File | undefined>()
    const sendMessage = () => {
        if (!input) return;
        clickHandler(input, file)
        setInput("")
    }

    return (
        <div>
            <div>
                <div className="border-t bg-gray-100 px-4 py-3 dark:bg-gray-800">
                    <div className="flex items-center rounded-full bg-white shadow-sm dark:bg-gray-950">
                        <div className="flex items-center rounded-full bg-white px-4 text-gray-400 dark:bg-gray-950 dark:text-gray-400">
                            <Upload isFileTrue={(file)=>{
                                console.log("File received in ChatInput:", file)
                                setFile(file)
                            }}/>
                        </div>
                        <Input
                            type="text"
                            placeholder="Type your message..."
                            className="h-10 flex-1 rounded-full border-none bg-transparent px-4 text-sm focus:outline-none dark:text-gray-50"
                            value={input}
                            onKeyDown={(e) => {
                                if(e.key == 'Enter'){
                                    sendMessage()
                                }
                            }}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={sendMessage}>
                            <SendIcon className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
