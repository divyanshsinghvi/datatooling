import { useState } from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronRight, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { JsonFile } from '../App'

interface JsonViewerProps {
  file: JsonFile
}

export function JsonViewer({ file }: JsonViewerProps) {
  const [expandedPaths, setExpandedPaths] = useState<string[]>([])
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  const copyToClipboard = (text: string, path: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  const renderValue = (value: any, path: string, key?: string) => {
    if (value === null) {
      return <span className="text-gray-400">null</span>
    }

    if (typeof value === 'boolean') {
      return <span className="text-purple-600">{value.toString()}</span>
    }

    if (typeof value === 'number') {
      return <span className="text-blue-600">{value}</span>
    }

    if (typeof value === 'string') {
      // Check if this is a large text field that might be markdown
      const isLargeText = value.length > 200
      const isLikelyMarkdown = value.includes('#') || value.includes('**') || value.includes('\n\n')

      if (isLargeText) {
        return (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">
                {value.length} characters
              </span>
              <button
                onClick={() => copyToClipboard(value, path)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Copy text"
              >
                {copiedPath === path ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} className="text-gray-400" />
                )}
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-96 overflow-auto">
              {isLikelyMarkdown ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{value}</ReactMarkdown>
                </div>
              ) : (
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {value}
                </pre>
              )}
            </div>
          </div>
        )
      }

      return <span className="text-green-600">"{value}"</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400">[]</span>
      }

      return (
        <div className="ml-4 mt-2 space-y-2">
          {value.map((item, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4">
              <div className="text-gray-500 text-sm mb-1">[{index}]</div>
              {renderValue(item, `${path}[${index}]`)}
            </div>
          ))}
        </div>
      )
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value)

      if (entries.length === 0) {
        return <span className="text-gray-400">{'{}'}</span>
      }

      return (
        <div className="ml-4 mt-2 space-y-2">
          {entries.map(([k, v]) => (
            <div key={k} className="border-l-2 border-gray-200 pl-4">
              <div className="flex items-start gap-2">
                <span className="text-gray-700 font-medium text-sm">{k}:</span>
                <div className="flex-1">{renderValue(v, `${path}.${k}`, k)}</div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return <span>{String(value)}</span>
  }

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              📄
            </div>
            {file.name}
          </h2>
          {file.data.model && (
            <div className="flex flex-wrap gap-4 text-sm bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <span className="flex items-center gap-2">
                <span className="font-semibold">Model:</span> {file.data.model}
              </span>
              {file.data.response?.temperature && (
                <span className="flex items-center gap-2">
                  <span className="font-semibold">Temperature:</span> {file.data.response.temperature}
                </span>
              )}
              {file.data.sample_id && (
                <span className="flex items-center gap-2">
                  <span className="font-semibold">Sample ID:</span> {file.data.sample_id}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {renderValue(file.data, 'root')}
        </div>
      </div>
    </div>
  )
}
