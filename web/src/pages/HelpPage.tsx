import { useState } from 'react'

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    name: '🚀 入门指南',
    icon: '🚀',
    color: '#6C5CE7',
    articles: [
      { title: '如何创建第一个错题本？', content: '点击左侧导航栏的「错题集」进入主页，点击左上角「➕ 新建错题本」按钮，输入名称并选择颜色标识即可创建。注册后系统会自动为您创建数学、英语等默认错题本。' },
      { title: '如何录入错题？', content: '点击导航栏「录入」进入录入页面，可选择三种方式：\n1. 识图录入：上传错题图片，系统自动OCR识别\n2. 文本录入：直接输入题目内容\n3. 对话录入：通过AI对话方式录入\n录入后选择目标错题本，填写正确答案和解析即可保存。' },
      { title: '支持哪些图片格式？', content: '支持JPG、PNG、WEBP格式，单张图片不超过10MB。建议使用清晰的照片或截图以获得更好的OCR识别效果。' },
    ],
  },
  {
    id: 'question-management',
    name: '📝 错题管理',
    icon: '📝',
    color: '#00B894',
    articles: [
      { title: '如何编辑或删除错题？', content: '在错题集主页，点击右侧错题卡片底部的「移出」按钮即可删除错题。删除操作不可恢复，请谨慎操作。' },
      { title: '如何给错题添加知识点标签？', content: '在录入错题时，可以在「知识点标签」字段中输入，用逗号分隔多个标签。如：函数,导数,极值。标签会用于薄弱知识点分析和复习推荐。' },
      { title: '错题本可以重命名吗？', content: '可以。在错题集主页选中错题本后，点击右上角「编辑」按钮即可修改名称和颜色。' },
    ],
  },
  {
    id: 'ai-qa',
    name: '🤖 AI答疑',
    icon: '🤖',
    color: '#FD79A8',
    articles: [
      { title: 'AI答疑如何使用？', content: '点击导航栏「AI答疑」进入对话页面。输入问题后按Enter发送，AI会以逐字流式方式输出回答。也可以从错题卡片点击「AI答疑」按钮，自动带入题目上下文。' },
      { title: 'AI能理解我的错题内容吗？', content: '当您从错题卡片点击「AI答疑」进入时，系统会自动将题目内容作为上下文传给AI，AI可以针对该题进行解答和分析。' },
      { title: '对话历史会保存吗？', content: '会的。所有对话历史会保存在左侧列表中，您可以随时点击查看历史对话。' },
    ],
  },
  {
    id: 'review',
    name: '🔄 复习系统',
    icon: '🔄',
    color: '#FDCB6E',
    articles: [
      { title: '如何开始复习？', content: '点击导航栏「复习」进入复习页面。选择要复习的错题本范围和题目数量，点击「开始复习」即可。复习分为三个阶段：选择范围→逐题作答→查看批改结果。' },
      { title: '复习结果怎么看？', content: '完成所有题目后，系统会自动批改并展示结果总览（正确率、用时），以及逐题详情。答对题目显示绿色边框，答错题目显示红色边框。' },
      { title: '可以重做错题吗？', content: '可以。在复习结果页面点击「错题重练」按钮即可重新开始复习，系统会重新随机抽取题目。' },
    ],
  },
  {
    id: 'account',
    name: '👤 账户设置',
    icon: '👤',
    color: '#FF7675',
    articles: [
      { title: '如何修改个人信息？', content: '目前支持修改用户名和邮箱。点击右上角头像进入个人设置页面进行修改。' },
      { title: '如何注销账号？', content: '在个人设置页面点击「注销账号」按钮，确认后所有数据将被物理删除，不可恢复。请谨慎操作。' },
      { title: '登录状态会保持多久？', content: '登录后7天内无需重新登录。超过7天后需要重新登录。' },
    ],
  },
]

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState(HELP_CATEGORIES[0])
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)

  return (
    <div className="flex" style={{ height: 'calc(100vh - 88px)' }}>
      <aside className="hidden md:block w-[320px] flex-shrink-0 border-r-2 border-cream bg-white">
        <div className="p-md">
          <h3 className="text-body font-bold text-text-primary px-sm mb-md flex items-center gap-xs">
            <span style={{ fontSize: '16px' }}>💡</span> 帮助中心
          </h3>
          <nav className="space-y-xs">
            {HELP_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat)}
                className={`block w-full text-left px-sm py-sm rounded-btn transition-all font-bold flex items-center gap-sm ${
                  activeCategory.id === cat.id
                    ? 'text-white'
                    : 'text-text-secondary hover:bg-gray-50'
                }`}
                style={activeCategory.id === cat.id ? {
                  background: `linear-gradient(135deg, ${cat.color} 0%, ${cat.color}DD 100%)`,
                  boxShadow: `0 4px 0 ${cat.color}88`,
                } : {}}
              >
                <span style={{ fontSize: '14px' }}>{cat.icon}</span>
                <span className="text-body">{cat.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="md:hidden p-md border-b-2 border-cream">
          <select
            value={activeCategory.id}
            onChange={(e) => setActiveCategory(HELP_CATEGORIES.find((c) => c.id === e.target.value)!)}
            className="input-base"
          >
            {HELP_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="p-xl max-w-[800px]">
          <h1 className="text-h1 font-bold mb-xl gradient-text">{activeCategory.name}</h1>
          <div className="space-y-sm">
            {activeCategory.articles.map((article) => {
              const isExpanded = expandedArticle === article.title
              return (
                <div key={article.title} className="card overflow-hidden">
                  <button
                    onClick={() => setExpandedArticle(isExpanded ? null : article.title)}
                    className="w-full text-left p-lg flex items-center justify-between hover:bg-purple-50 transition-colors"
                  >
                    <span className="text-body font-bold text-text-primary">{article.title}</span>
                    <span
                      className="flex items-center justify-center text-white font-bold"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: isExpanded ? '#FF6B6B' : 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                        fontSize: '12px',
                        boxShadow: '0 3px 0 rgba(0,0,0,0.1)',
                      }}
                    >
                      {isExpanded ? '−' : '+'}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="px-lg pb-lg pt-xs">
                      <p className="text-body text-text-secondary whitespace-pre-wrap">{article.content}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
