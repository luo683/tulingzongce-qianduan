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
            >
              <div class="dm-avatar">{{ name[0] }}</div>
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
          scrollTrigger: {
            trigger: title,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        })
      }

      const cards = el.querySelectorAll('.dept-member-card')
      if (cards.length) {
        gsap.from(cards, {
          y: 25,
          opacity: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        })
      }

      const empty = el.querySelector('.cl-empty')
      if (empty) {
        gsap.from(empty, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: empty,
            start: 'top 88%',
            toggleActions: 'play none none none',
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
  margin: 1.5rem 0;
  /* 显式纵向排列：确保「部长」永远在「社长」下面 */
  display: flex;
  flex-direction: column;
}

/* 两个分组放在同一个区块里，部长紧接社长下方 */
.cl-blocks {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.cl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.85rem;
}

/* ── 卡片 ── */
.dept-member-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
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
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
  background: linear-gradient(135deg, #FC5531, #ff8f6b);
}

.dm-info {
  display: block;
  flex: 1;
  min-width: 0;
}

.dm-name {
  display: block;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

/* ── 空状态 ── */
.cl-empty {
  display: block;
  font-size: 0.85rem;
  font-style: italic;
  color: var(--vp-c-text-3);
  padding: 0.75rem 0.25rem;
}

/* ── 响应式 ── */
@media (max-width: 768px) {
  .cl-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .dept-title {
    font-size: 1.15rem;
  }

  .dept-member-card {
    padding: 0.85rem 1rem;
  }

  .dm-name {
    font-size: 0.92rem;
  }
}
</style>
