<template>
  <div class="km-page">
    <div class="km-header">
      <h1>📊 综测管理</h1>
      <p>维护社长与部长名单，一行一个姓名，保存后整表覆盖录入（社长最多 2 人、部长最多 10 人）</p>
    </div>

    <p class="km-note">当前为占位名单，待补充：2 位社长与 10 位部长的正式姓名</p>

    <!-- Loading -->
    <div v-if="loading" class="loading">⏳ 加载中...</div>

    <!-- 表单 -->
    <div v-else class="km-card">
      <label class="km-field">
        <span>社长名单 🏛️</span>
        <textarea
          v-model="presidentText"
          rows="4"
          class="km-textarea"
          placeholder="一行一个姓名，例如：&#10;张三&#10;李四"
        ></textarea>
      </label>

      <label class="km-field">
        <span>部长名单 🧩</span>
        <textarea
          v-model="ministerText"
          rows="10"
          class="km-textarea"
          placeholder="一行一个姓名，例如：&#10;王五&#10;赵六"
        ></textarea>
      </label>

      <div class="km-form-actions">
        <span v-if="saved" class="km-tip">已保存</span>
        <span v-else-if="errorMsg" class="km-error">{{ errorMsg }}</span>
        <button type="button" class="km-btn-save" :disabled="saving" @click="saveLeaders">
          {{ saving ? '保存中…' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface AdminLeader {
  id?: number
  role: string
  name: string
  sortOrder?: number
}

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || 'http://192.168.2.120:8080'
const API = `${API_BASE}/api/comprehensive/admin/leaders`

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
// 后端的人数上限/长度校验返回的是纯文本说明（如「社长最多 2 人」），直接展示给录入人
const errorMsg = ref('')

const presidentText = ref('')
const ministerText = ref('')

// ── 按行拆分 → trim → 过滤空行 ──
function parseLines(text: string): string[] {
  return text
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

function toText(names: string[]): string {
  return names.join('\n')
}

// ── 读取 ──
async function loadLeaders(showSpinner = true) {
  if (showSpinner) loading.value = true
  try {
    const res = await fetch(API)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: AdminLeader[] = await res.json()
    const list = Array.isArray(data) ? data : []

    const sortByOrder = (a: AdminLeader, b: AdminLeader) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0)

    presidentText.value = toText(
      list.filter(l => l.role === 'president').sort(sortByOrder).map(l => l.name)
    )
    ministerText.value = toText(
      list.filter(l => l.role === 'minister').sort(sortByOrder).map(l => l.name)
    )
  } catch (e) {
    console.error('加载综测名单失败', e)
  } finally {
    loading.value = false
  }
}

// ── 保存（整体覆盖录入） ──
async function saveLeaders() {
  saving.value = true
  saved.value = false
  errorMsg.value = ''
  try {
    const body = {
      president: parseLines(presidentText.value),
      minister: parseLines(ministerText.value),
    }
    const res = await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const detail = (await res.text()).trim()
      throw new Error(detail || `保存失败（HTTP ${res.status}）`)
    }

    saved.value = true
    await loadLeaders(false)
  } catch (e: any) {
    console.error('保存综测名单失败', e)
    errorMsg.value = e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

onMounted(loadLeaders)
</script>

<style scoped>
.km-page { margin: 1.5rem 0; }

.km-header {
  display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.km-header h1 { margin: 0; font-size: 1.5rem; flex: 1; }
.km-header p { color: var(--vp-c-text-2); margin: 0; flex: 2; font-size: 0.9rem; }

.km-note {
  margin: -0.75rem 0 1rem;
  font-size: 0.85rem;
  font-style: italic;
  color: var(--vp-c-text-3);
}

.loading { text-align: center; padding: 3rem; color: var(--vp-c-text-2); }

/* 表单卡片 */
.km-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.km-field { display: flex; flex-direction: column; gap: 0.4rem; }
.km-field span { font-size: 0.85rem; font-weight: 600; color: var(--vp-c-text-2); }

.km-textarea {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  width: 100%;
  box-sizing: border-box;
}
.km-textarea:focus {
  border-color: var(--vp-c-brand-1);
  outline: none;
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.km-form-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: flex-end;
}

.km-tip {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.km-btn-save {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s, opacity 0.2s;
}
.km-btn-save:hover { background: #e8461f; }
.km-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.km-error { font-size: 0.85rem; color: var(--vp-c-danger-1); }

@media (max-width: 480px) {
  .km-header { flex-direction: column; align-items: flex-start; }
  .km-form-actions { justify-content: stretch; }
  .km-btn-save { width: 100%; }
}
</style>
