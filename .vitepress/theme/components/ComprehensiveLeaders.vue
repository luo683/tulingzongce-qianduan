<template>
  <div class="cl-page">

    <!-- Loading -->
    <div v-if="loading" class="loading">⏳ 加载中...</div>

    <!-- Error -->
    <div v-else-if="error" class="error">
      ❌ 加载失败 <button @click="loadData">重试</button>
    </div>

    <!-- Content -->
    <template v-else>
      <div class="cl-blocks">
        <div
          v-for="block in blocks"
          :key="block.role"
          class="cl-block"
          :ref="el => setBlockRef(block.role, el)"
        >
          <h2 class="dept-title">
            <span class="dept-icon">{{ block.icon }}</span>
            {{ block.label }}
          </h2>

          <div v-if="block.names.length" class="cl-grid">
            <div
              v-for="(name, idx) in block.names"
              :key="name + '-' + idx"
              class="dept-member-card"
              :title="name"
            >
              <div class="dm-avatar">{{ initialOf(name) }}</div>
              <div class="dm-info">
                <h4 class="dm-name">{{ name }}</h4>
              </div>
            </div>
          </div>

          <div v-else class="cl-empty">暂未设置</div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * 综测 — 社长 / 部长名单展示
 * 数据来源：GET /api/comprehensive/leaders → { president: string[], minister: string[] }
 *
 * 数据约定（占位数据，TODO 待补充正式名单）：
 *   president 固定 2 条、minister 固定 10 条，均由后端 ComprehensiveService 的
 *   PLACEHOLDER_PRESIDENT / PLACEHOLDER_MINISTER 提供，正式名单在 /admin/comprehensive 覆盖录入。
 *
 * 布局约定：两个分组共用同一套 CSS Grid 变量（--cl-cols / --cl-gap / --cl-row），
 * 因此社长与部长的列宽、左边缘、gap、行高完全一致；列数随 1280 / 1024 / 768 / 480 断点递减。
 */

interface LeadersResponse {
  president?: string[]
  minister?: string[]
}

interface Block {
  role: 'president' | 'minister'
  icon: string
  label: string
  names: string[]
}

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || 'http://192.168.2.120:8080'

const loading = ref(true)
const error = ref(false)
const president = ref<string[]>([])
const minister = ref<string[]>([])
const blocks = ref<Block[]>([])
const blockRefs = ref<Record<string, HTMLElement>>({})

// ── 头像首字：空名兜底为「·」，避免网格内卡片高度参差 ──
function initialOf(name: string): string {
  return name && name.length ? name[0] : '·'
}

// ── 两个区块始终存在，即使某一组为空 ──
function setBlockRef(role: string, el: any) {
  if (el) blockRefs.value[role] = el as HTMLElement
}

function buildBlocks() {
  blocks.value = [
    { role: 'president', icon: '🏛️', label: '社长', names: president.value },
    { role: 'minister', icon: '🧩', label: '部长', names: minister.value },
  ]
}

// ── 动画（SSR 安全：onMounted 之后、元素判空） ──
function runAnimations() {
  nextTick(() => {
    Object.values(blockRefs.value).forEach(el => {
      if (!el) return

      const title = el.querySelector('.dept-title')
      if (title) {
        gsap.from(title, {
          x: -15,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
          // 动画结束后清掉 transform/opacity，避免残留位移破坏网格对齐
          onComplete: () => gsap.set(title, { clearProps: 'transform,opacity' }),
          scrollTrigger: {
            trigger: title,
            start: 'top 88%',
            once: true,
          },
        })
      }

      const cards = el.querySelectorAll('.dept-member-card')
      if (cards.length) {
        gsap.from(cards, {
          y: 25,
          opacity: 0,
          duration: 0.45,
          stagger: 0.05,
          ease: 'power2.out',
          // 动画结束后清掉 transform/opacity：否则回滚页面时卡片会停在 y=25 的
          // 起始位移上，同一行卡片高低不齐 —— 这正是「错位」的直接成因
          onComplete: () => gsap.set(cards, { clearProps: 'transform,opacity' }),
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        })
      }

      const empty = el.querySelector('.cl-empty')
      if (empty) {
        gsap.from(empty, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => gsap.set(empty, { clearProps: 'transform,opacity' }),
          scrollTrigger: {
            trigger: empty,
            start: 'top 88%',
            once: true,
          },
        })
      }
    })
    ScrollTrigger.refresh()
  })
}

// ── 数据加载 ──
async function loadData() {
  loading.value = true
  error.value = false
  try {
    const res = await fetch(`${API_BASE}/api/comprehensive/leaders`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: LeadersResponse = await res.json()

    president.value = Array.isArray(data?.president) ? data.president : []
    minister.value = Array.isArray(data?.minister) ? data.minister : []

    buildBlocks()
    loading.value = false
    runAnimations()
  } catch (e) {
    president.value = []
    minister.value = []
    buildBlocks()
    loading.value = false
    error.value = true
    console.error('Failed to fetch comprehensive leaders:', e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.cl-page {
  /* 显式纵向排列：确保「社长」在上、「部长」在下 */
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin: 1.5rem 0;
}

/* ── 分组容器 ──
   两个分组共用同一套网格变量，社长与部长的
   列宽 / 左边缘 / gap / 行高因此完全一致。 */
.cl-blocks {
  --cl-cols: 4;         /* 每行等宽列数（文档内容宽 688px 下 4 列刚好容纳头像 + 四字姓名） */
  --cl-gap: 0.85rem;    /* 统一列间距与行间距 */
  --cl-row: 5.25rem;    /* 统一行高（84px） */
  --cl-pad-x: 1rem;     /* 卡片左右内边距 */
  --cl-avatar: 44px;    /* 头像直径，决定卡片内基线 */
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 0;
}

/* ── 等宽网格 ──
   1) 列宽 = (容器宽 - gap × (n-1)) / n，天然等宽、左边缘严格对齐；
   2) minmax(0, 1fr) 防止长姓名把某一列撑宽 → 不会挤压或换行错乱；
   3) grid-auto-rows 固定行高 → 纵向排列整齐，10 人两行仍等距。 */
.cl-grid {
  display: grid;
  grid-template-columns: repeat(var(--cl-cols), minmax(0, 1fr));
  grid-auto-rows: var(--cl-row);
  gap: var(--cl-gap);
  align-items: stretch;
  justify-items: stretch;
  width: 100%;
  box-sizing: border-box;
}

/* ── 加载 / 错误状态 ── */
.loading,
.error {
  text-align: center;
  padding: 3rem 1rem;
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
}

.error button {
  margin-left: 0.75rem;
  padding: 0.35rem 1rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.error button:hover {
  background: var(--vp-c-brand-1);
  color: #fff;
}

/* ── 区块 ── */
.cl-block {
  display: block;
  margin-bottom: 0;
}

.dept-title {
  display: block;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--vp-c-brand-1);
}

.dept-icon {
  margin-right: 0.4rem;
}

/* ── 卡片：高度由网格行高统一，内部不再用纵向 padding 撑高 ── */
.dept-member-card {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 var(--cl-pad-x);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.dark .dept-member-card {
  background: rgba(30, 30, 48, 0.55);
}

.dept-member-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--vp-c-brand-1);
}

.dm-avatar {
  width: var(--cl-avatar);
  height: var(--cl-avatar);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: calc(var(--cl-avatar) / 2.6);
  font-weight: 700;
  flex-shrink: 0;
  background: linear-gradient(135deg, #FC5531, #ff8f6b);
}

.dm-info {
  display: block;
  flex: 1 1 auto;
  min-width: 0;
}

.dm-name {
  display: block;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
  /* 单行省略：姓名再长也不换行，列宽与行高不会被打乱 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── 空状态 ── */
.cl-empty {
  display: block;
  font-size: 0.85rem;
  font-style: italic;
  color: var(--vp-c-text-3);
  padding: 0.75rem 0.25rem;
}

/* ── 响应式：列数递减，列宽始终等宽对齐 ── */
@media (max-width: 1279px) {
  .cl-blocks {
    --cl-cols: 3;
  }
}

@media (max-width: 768px) {
  .cl-blocks {
    --cl-cols: 2;
    --cl-gap: 0.7rem;
    --cl-row: 4.75rem;
    --cl-pad-x: 0.9rem;
    --cl-avatar: 44px;
  }

  .dept-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .cl-blocks {
    --cl-cols: 1;
    --cl-gap: 0.6rem;
    --cl-row: 4.5rem;
    --cl-pad-x: 0.8rem;
    --cl-avatar: 40px;
  }

  .dept-title {
    font-size: 1.15rem;
  }

  .dm-name {
    font-size: 0.92rem;
  }
}
</style>
