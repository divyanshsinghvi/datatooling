import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { JsonFile } from '../App'
import { DiffMatchPatch } from 'diff-match-patch'

interface ComparisonViewProps {
  files: JsonFile[]
}

type ComparisonField = {
  label: string
  path: string
}

const COMMON_FIELDS: ComparisonField[] = [
  { label: 'Response Content', path: 'response.responses[0].content' },
  { label: 'Response Reasoning', path: 'response.responses[0].reasoning' },
  { label: 'Full Response', path: 'response.responses[0].full' },
  { label: 'Prompt', path: 'prompt' },
  { label: 'System Prompt', path: 'system_prompt' },
]

export function ComparisonView({ files }: ComparisonViewProps) {
  const [selectedField, setSelectedField] = useState<ComparisonField>(COMMON_FIELDS[0])
  const [viewMode, setViewMode] = useState<'side-by-side' | 'diff'>('side-by-side')

  const getValueAtPath = (obj: any, path: string): string => {
    const parts = path.split('.')
    let current = obj

    for (const part of parts) {
      const arrayMatch = part.match(/^(.+?)\[(\d+)\]$/)
      if (arrayMatch) {
        const [, key, index] = arrayMatch
        current = current?.[key]?.[parseInt(index)]
      } else {
        current = current?.[part]
      }

      if (current === undefined) break
    }

    if (typeof current === 'string') return current
    if (current === null || current === undefined) return ''
    return JSON.stringify(current, null, 2)
  }

  const values = files.map((file) => ({
    file,
    value: getValueAtPath(file.data, selectedField.path),
  }))

  const renderDiff = () => {
    if (values.length !== 2) {
      return (
        <div className="text-gray-500 text-center py-8">
          Diff view is only available for exactly 2 files
        </div>
      )
    }

    const dmp = new DiffMatchPatch()
    const diffs = dmp.diff_main(values[0].value, values[1].value)
    dmp.diff_cleanupSemantic(diffs)

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4 text-sm text-gray-600">
          Comparing: <span className="font-medium">{values[0].file.name}</span> vs{' '}
          <span className="font-medium">{values[1].file.name}</span>
        </div>
        <div className="prose prose-sm max-w-none">
          {diffs.map((diff, index) => {
            const [op, text] = diff
            if (op === 0) {
              return (
                <span key={index} className="text-gray-700">
                  {text}
                </span>
              )
            } else if (op === -1) {
              return (
                <span key={index} className="bg-red-100 text-red-800 line-through">
                  {text}
                </span>
              )
            } else {
              return (
                <span key={index} className="bg-green-100 text-green-800">
                  {text}
                </span>
              )
            }
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white">
              ⚖️
            </div>
            Compare Files
          </h2>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Compare Field
              </label>
              <div className="relative">
                <select
                  value={selectedField.path}
                  onChange={(e) => {
                    const field = COMMON_FIELDS.find((f) => f.path === e.target.value)
                    if (field) setSelectedField(field)
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg appearance-none bg-white pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  {COMMON_FIELDS.map((field) => (
                    <option key={field.path} value={field.path}>
                      {field.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                View Mode
              </label>
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'side-by-side'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Side by Side
                </button>
                <button
                  onClick={() => setViewMode('diff')}
                  className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'diff'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Diff
                </button>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'diff' ? (
          renderDiff()
        ) : (
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${files.length}, 1fr)` }}>
            {values.map(({ file, value }) => (
              <div key={file.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {file.name}
                  </h3>
                  {file.data.model && (
                    <p className="text-sm text-gray-600 font-mono mb-2">{file.data.model}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {value.length.toLocaleString()} chars
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                      {value.split(/\s+/).length.toLocaleString()} words
                    </span>
                  </div>
                </div>
                <div className="p-6 max-h-[600px] overflow-auto bg-gray-50/50">
                  {value.includes('#') || value.includes('**') ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{value}</ReactMarkdown>
                    </div>
                  ) : (
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                      {value}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
