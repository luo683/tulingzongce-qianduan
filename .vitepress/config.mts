import { defineConfig } from 'vitepress'
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { parseFrontmatter } from './theme/utils'

const __dir = import.meta.dirname
const blogDir = resolve(__dir, '../blog')
const dataDir = resolve(__dir, '../data')

interface BlogMeta {
  title: string
  date: string
  tags: string[]
  slug: string
}

const blogMetas: BlogMeta[] = readdirSync(blogDir)
  .filter(f => f.endsWith('.md') && f !== 'index.md')
  .map(filename => {
    const raw = readFileSync(resolve(blogDir, filename), 'utf-8')
    const fm = parseFrontmatter(raw)
    const slug = filename.replace(/\.md$/, '')
    return {
      title: fm.title || slug,
      date: fm.date || '',
      tags: fm.tags || [],
      slug,
    }
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

// Build tag index with counts
const tagCounts: Record<string, number> = {}
for (const post of blogMetas) {
  for (const tag of post.tags) {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1
  }
}
const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])
const recentPosts = blogMetas.slice(0, 6)

/**
 * Build-time: 生成搜索索引页面
 * VitePress 的 local search 只索引 .md 文件内容，
 * 但博客列表、活动、FAQ、资源等数据是 Vue 组件动态渲染的，不会被索引。
 * 这里生成一个隐藏的 search-data.md 页面，把全站动态数据写成纯文本，
 * 让搜索引擎能够匹配到。
 */
function generateSearchIndexPage() {
  // 收集博客文章
  const blogText = blogMetas.map(p =>
    `## ${p.title} | ${p.date} | ${p.tags.join(' ')}`
  ).join('\n\n')

  // 收集活动
  let eventsText = ''
  const eventsPath = join(dataDir, 'events.json')
  if (existsSync(eventsPath)) {
    const events = JSON.parse(readFileSync(eventsPath, 'utf-8'))
    eventsText = events.map((e: any) =>
      `## ${e.title} | ${e.date} | ${e.location || ''} | ${e.description || ''}`
    ).join('\n\n')
  }

  // 收集 FAQ
  let faqText = ''
  const faqPath = join(dataDir, 'faqs.json')
  if (existsSync(faqPath)) {
    const faqs = JSON.parse(readFileSync(faqPath, 'utf-8'))
    faqText = faqs.map((f: any) =>
      `## ${f.q} | ${f.a?.replace(/<[^>]+>/g, '') || ''}`
    ).join('\n\n')
  }

  // 收集资源
  let resText = ''
  const resPath = join(dataDir, 'resources.json')
  if (existsSync(resPath)) {
    const resources = JSON.parse(readFileSync(resPath, 'utf-8'))
    resText = resources.map((r: any) =>
      `## ${r.title} | 分类:${r.category || ''} | 格式:${r.fileType || ''} | ${r.description || ''}`
    ).join('\n\n')
  }

  // 社团成员
  let memberText = ''
  const membersPath = join(dataDir, 'members.json')
  if (existsSync(membersPath)) {
    const members = JSON.parse(readFileSync(membersPath, 'utf-8'))
    memberText = members.map((m: any) =>
      `## ${m.name} | ${m.role || ''} | ${m.department || ''} | ${m.bio || ''} | ${(m.tags || []).join(' ')}`
    ).join('\n\n')
  }

  // 教师
  let teacherText = ''
  const teachersPath = join(dataDir, 'teachers.json')
  if (existsSync(teachersPath)) {
    const teachers = JSON.parse(readFileSync(teachersPath, 'utf-8'))
    teacherText = teachers.map((t: any) =>
      `## ${t.name} | ${t.title || ''} | ${t.dept || ''} | ${t.quote || ''} | ${(t.tags || []).join(' ')}`
    ).join('\n\n')
  }

  const searchPage = `---
title: 搜索索引
description: 全站搜索数据索引
---

<!-- 此页面由构建脚本自动生成，仅供搜索引擎索引使用 -->
<!-- 内容不会被用户直接看到，但会被 VitePress local search 索引 -->

# 全站搜索索引 {#search-index}

## 📝 博客文章

${blogText}

## 📅 活动

${eventsText}

## 💬 常见问答

${faqText}

## 📦 资源

${resText}

## 👥 社团成员

${memberText}

## 🎓 指导老师

${teacherText}
`

  writeFileSync(join(searchOutDir, 'index.md'), searchPage, 'utf-8')
}

// 构建时生成搜索索引目录和文件
const searchOutDir = resolve(__dir, '../search')
if (!existsSync(searchOutDir)) {
  mkdirSync(searchOutDir, { recursive: true })
}
generateSearchIndexPage()

export default defineConfig({
  lang: 'zh-CN',
  title: '图灵学社',
  description: '图灵学社 — 计算机技术学习与交流平台。技术博客、竞赛战队、项目实战、问答社区，为每一个热爱编程的人。',

  appearance: 'dark',

  vite: {
    server: {
      allowedHosts: true,
    },
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: '图灵学社' }],
    ['meta', { property: 'og:description', content: '图灵学社 — 计算机技术学习与交流平台。技术博客、竞赛战队、项目实战、问答社区。' }],
    ['meta', { property: 'og:image', content: '/favicon.svg' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: '图灵学社' }],
    ['meta', { name: 'twitter:description', content: '图灵学社 — 计算机技术学习与交流平台。' }],
    ['meta', { name: 'keywords', content: '图灵学社,计算机,编程,算法,AI,前端,后端,技术博客,问答,竞赛,项目实战,大学生社团' }],
  ],

  sitemap: {
    // ⚠️ 部署前请替换为你的真实域名
    hostname: 'https://your-domain.com',
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '关于我们', link: '/about' },
      { text: '指导老师', link: '/teachers/' },
      { text: '博客', link: '/blog/' },
      { text: '问答', link: '/qa/' },
      { text: '活动', link: '/events/' },
      { text: '资源', link: '/resources/' },
      { text: '社团成员', link: '/members/' },
      { text: '项目展示', link: '/projects/' },
      { text: '综测', link: '/comprehensive/' },
    ],

    sidebar: {
      '/blog/': [
        {
          text: '📂 分类',
          items: [
            { text: '全部文章', link: '/blog/' },
            ...sortedTags.map(([tag, count]) => ({
              text: `${tag} (${count})`,
              link: `/blog/?tag=${encodeURIComponent(tag)}`,
            })),
          ],
        },
        {
          text: '📝 最近文章',
          collapsed: false,
          items: recentPosts.map(post => ({
            text: post.title,
            link: `/blog/${post.slug}`,
          })),
        },
        {
          text: '📅 归档',
          collapsed: true,
          items: blogMetas.map(post => ({
            text: `${post.date}  ${post.title}`,
            link: `/blog/${post.slug}`,
          })),
        },
      ],
    },

    socialLinks: [],

    footer: {
      message: '探索计算机科学的无限可能',
      copyright: `Copyright © ${new Date().getFullYear()} 图灵学社`,
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档…',
            buttonAriaLabel: '搜索全站内容'
          },
          modal: {
            displayDetails: '查看详情',
            resetButtonTitle: '清除',
            backButtonTitle: '返回',
            noResultsText: '未找到相关结果，试试其他关键词',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        },
        miniSearch: {
          options: {
            tokenize: (text: string, fieldName: string) => {
              // 支持中文：按空格、标点、换行分词
              // 同时保留英文和数字的完整匹配
              if (fieldName === 'title') {
                // 标题字段：分词更细，提高匹配度
                return text.split(/[\s,，。！？；：、\n]+/).filter(t => t.length > 0)
              }
              // 正文：正常分词
              return text.split(/[\s,，。！？；：、\n]+/).filter(t => t.length > 0)
            },
            processTerm: (term: string) => {
              // 中文不做小写转换
              if (/[一-鿿]/.test(term)) return term
              return term.toLowerCase()
            },
            // 搜索选项
            searchOptions: {
              boost: { title: 4, headers: 3, text: 1 },
              fuzzy: 0.15,
              prefix: true,
            },
          },
        },
      },
    },

    lastUpdated: {
      text: '最后更新',
    },
  },
})
