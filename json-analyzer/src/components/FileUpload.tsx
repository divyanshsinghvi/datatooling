import { useRef } from 'react'
import { Upload } from 'lucide-react'
import type { JsonFile } from '../App'

interface FileUploadProps {
  onUpload: (files: JsonFile[]) => void
  existingFiles: JsonFile[]
}

export function FileUpload({ onUpload, existingFiles }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Generate SHA-256 hash for content deduplication
  const generateHash = async (text: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return

    const uploadedFiles: JsonFile[] = []
    const skippedFiles: string[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]

      try {
        const text = await file.text()
        const hash = await generateHash(text)

        // Check for duplicate content by hash
        const isDuplicate = existingFiles.some(f => f.hash === hash)
        if (isDuplicate) {
          skippedFiles.push(file.name)
          continue
        }

        const data = JSON.parse(text)
        uploadedFiles.push({
          id: `${Date.now()}-${i}`,
          name: file.name,
          data,
          hash,
        })
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error)
        alert(`Failed to parse ${file.name}. Please ensure it's valid JSON.`)
      }
    }

    if (skippedFiles.length > 0) {
      alert(`Skipped duplicate file(s): ${skippedFiles.join(', ')}`)
    }

    if (uploadedFiles.length > 0) {
      onUpload(uploadedFiles)
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg font-medium"
      >
        <Upload size={18} />
        Upload JSON Files
      </label>
    </div>
  )
}
