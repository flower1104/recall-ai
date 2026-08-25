import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

type Props = {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: Props) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <p className="mb-md leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-lg mb-md space-y-xs">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-lg mb-md space-y-xs">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => <h1 className="text-h1 font-bold mt-lg mb-md">{children}</h1>,
          h2: ({ children }) => <h2 className="text-h2 font-bold mt-md mb-sm">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-semibold mt-md mb-sm">{children}</h3>,
          strong: ({ children }) => <strong className="font-bold text-text-primary">{children}</strong>,
          code: ({ children }) => (
            <code className="bg-gray-100 px-xs py-px rounded text-caption font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-gray-50 p-md rounded-card overflow-x-auto mb-md border border-cream">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <table className="w-full border-collapse mb-md text-body">
              {children}
            </table>
          ),
          thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
          th: ({ children }) => (
            <th className="border border-cream px-md py-sm font-bold text-left">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-cream px-md py-sm">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
