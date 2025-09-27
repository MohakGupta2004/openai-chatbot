import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PaperclipIcon } from "lucide-react"
import FileUpload01 from "./file-upload-01"
import { useState } from "react"
export function Upload() {
  const [file, setFile] = useState<Array<File>>()
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <PaperclipIcon/>
        </DialogTrigger>
        <DialogContent className="p-0">
          <FileUpload01 onClose={async(file: File[])=> {
            setFile(file)
            setOpen(false)
            const formData = new FormData()
            formData.append("file", file[0])
            const result = await fetch('http://localhost:5000/upload', {
              method: 'POST',
              body: formData
            })

         }}/> 
        </DialogContent>
      </form>
    </Dialog>
  )
}
