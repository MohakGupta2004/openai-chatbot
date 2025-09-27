"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HelpCircle, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

export default function FileUpload01({onClose}: {
  onClose: (file: File[])=>void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileProgresses, setFileProgresses] = useState<Record<string, number>>(
    {}
  );

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload progress for each file
    newFiles.forEach((file) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setFileProgresses((prev) => ({
          ...prev,
          [file.name]: Math.min(progress, 100),
        }));
      }, 300);
    });
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (filename: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== filename));
    setFileProgresses((prev) => {
      const newProgresses = { ...prev };
      delete newProgresses[filename];
      return newProgresses;
    });
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full mx-auto max-w-lg">
        <CardContent className="p-0">
          <div className="px-6">
            <div
              className="border-2 border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer"
              onClick={handleBoxClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="mb-2 bg-muted rounded-full p-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Upload a project image
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or,{" "}
                <label
                  htmlFor="fileUpload"
                  className="text-primary hover:text-primary/90 font-medium cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  click to browse
                </label>{" "}
                (4MB max)
              </p>
              <input
                type="file"
                id="fileUpload"
                ref={fileInputRef}
                className="hidden"
                accept="file/*"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          </div>

          <div
            className={cn(
              "px-6 pb-5 space-y-3",
              uploadedFiles.length > 0 ? "mt-4" : ""
            )}
          >
            {uploadedFiles.map((file, index) => {
              const imageUrl = URL.createObjectURL(file);

              return (
                <div
                  className="border border-border rounded-lg p-2 flex flex-col"
                  key={file.name + index}
                  onLoad={() => {
                    return () => URL.revokeObjectURL(imageUrl);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 pr-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground truncate max-w-[250px]">
                            {file.name}
                          </span>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {Math.round(file.size / 1024)} KB
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 bg-transparent! hover:text-red-500"
                          onClick={() => removeFile(file.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden flex-1">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${fileProgresses[file.name] || 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {Math.round(fileProgresses[file.name] || 0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-3 border-t border-border bg-muted rounded-b-lg flex justify-between items-center">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Need help?
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="py-3 bg-background text-foreground border">
                  <div className="space-y-1">
                    <p className="text-[13px] font-medium">Need assistance?</p>
                    <p className="text-muted-foreground dark:text-muted-background text-xs max-w-[200px]">
                      Upload project images by dragging and dropping files or
                      using the file browser. Supported formats: PDF
                      Maximum file size: 4MB.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex gap-2">
              <Button className="h-9 px-4 text-sm font-medium" onClick={()=>{
                onClose(uploadedFiles)
              }}>Continue</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
