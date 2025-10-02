import { useState, useEffect } from 'react'
import { FileUpload } from './components/FileUpload'
import { FileList } from './components/FileList'
import { JsonViewer } from './components/JsonViewer'
import { ComparisonView } from './components/ComparisonView'
import { FileText, GitCompare } from 'lucide-react'

export interface JsonFile {
  id: string
  name: string
  data: any
  hash: string
}

const STORAGE_KEY = 'json-analyzer-files'

function App() {
  // Load files from localStorage on mount
  const [files, setFiles] = useState<JsonFile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])

  // Save files to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
    } catch (error) {
      console.error('Failed to save files to localStorage:', error)
    }
  }, [files])

  const handleFilesUpload = (uploadedFiles: JsonFile[]) => {
    setFiles(prev => [...prev, ...uploadedFiles])
  }

  const handleFileSelect = (id: string) => {
    if (compareMode) {
      setSelectedForComparison(prev =>
        prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
      )
    } else {
      setSelectedFileId(id)
    }
  }

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    if (selectedFileId === id) setSelectedFileId(null)
    setSelectedForComparison(prev => prev.filter(fid => fid !== id))
  }

  const handleClearAll = () => {
    if (files.length > 0 && confirm('Are you sure you want to remove all files?')) {
      setFiles([])
      setSelectedFileId(null)
      setSelectedForComparison([])
    }
  }

  const selectedFile = files.find(f => f.id === selectedFileId)

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col shadow-lg">
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <FileText size={28} />
            JSON Analyzer
          </h1>
          <p className="text-blue-100 text-sm">Analyze and compare LLM responses</p>
        </div>

        <div className="p-4">
          <FileUpload onUpload={handleFilesUpload} existingFiles={files} />

          <div className="mt-4 flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setCompareMode(false)
                setSelectedForComparison([])
              }}
              className={`flex-1 px-3 py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                !compareMode
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={16} />
              View
            </button>
            <button
              onClick={() => {
                setCompareMode(true)
                setSelectedFileId(null)
              }}
              className={`flex-1 px-3 py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                compareMode
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GitCompare size={16} />
              Compare
            </button>
          </div>
        </div>

        <FileList
          files={files}
          selectedFileId={compareMode ? null : selectedFileId}
          selectedForComparison={compareMode ? selectedForComparison : []}
          onSelect={handleFileSelect}
          onRemove={handleRemoveFile}
          onClearAll={handleClearAll}
          compareMode={compareMode}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {compareMode && selectedForComparison.length >= 2 ? (
          <ComparisonView
            files={files.filter(f => selectedForComparison.includes(f.id))}
          />
        ) : compareMode ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <GitCompare size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Select 2 or more files to compare</p>
            </div>
          </div>
        ) : selectedFile ? (
          <JsonViewer file={selectedFile} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Upload or select a JSON file to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
