"use client"

import type React from "react"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileUpload(file)
    }
  }

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="model">Upload 3MF File</Label>
      <div className="flex items-center gap-2">
        <Input id="model" type="file" accept=".3mf" className="hidden" onChange={handleFileChange} />
        <Button asChild variant="outline">
          <Label htmlFor="model" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Choose File
          </Label>
        </Button>
        <span className="text-sm text-gray-500">{fileName || "No file chosen"}</span>
      </div>
    </div>
  )
}

