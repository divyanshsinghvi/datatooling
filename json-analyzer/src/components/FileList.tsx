import { Trash2, Check, X } from 'lucide-react'
import type { JsonFile } from '../App'

interface FileListProps {
  files: JsonFile[]
  selectedFileId: string | null
  selectedForComparison: string[]
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onClearAll: () => void
  compareMode: boolean
}

export function FileList({
  files,
  selectedFileId,
  selectedForComparison,
  onSelect,
  onRemove,
  onClearAll,
  compareMode,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-gray-400 text-sm">
        No files uploaded
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Files ({files.length})
          </span>
          <button
            onClick={onClearAll}
            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md flex items-center gap-1 transition-colors"
          >
            <X size={12} />
            Clear
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {files.map((file) => {
          const isSelected = compareMode
            ? selectedForComparison.includes(file.id)
            : selectedFileId === file.id

          return (
            <div
              key={file.id}
              className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-sm'
                  : 'bg-white hover:bg-gray-50 border-2 border-transparent hover:border-gray-200 hover:shadow-sm'
              }`}
              onClick={() => onSelect(file.id)}
            >
              {compareMode && isSelected && (
                <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                  {file.name}
                </p>
                {file.data.model && (
                  <p className="text-xs text-gray-500 truncate font-mono">
                    {file.data.model}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(file.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded-md transition-all"
                title="Remove file"
              >
                <Trash2 size={14} className="text-red-600" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
