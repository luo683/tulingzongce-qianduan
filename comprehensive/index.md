---
title: 综测
---

<script setup>
import ComprehensiveLeaders from '../.vitepress/theme/components/ComprehensiveLeaders.vue'
</script>

<div class="comprehensive-section-header">
  <h1 class="comprehensive-section-title">📊 综测</h1>
  <p class="comprehensive-section-sub">社长 · 部长 名单</p>
</div>

<ComprehensiveLeaders />

<style scoped>
.comprehensive-section-header {
  display: block;
  text-align: center;
  margin: 2rem 0 2.5rem;
}

.comprehensive-section-title {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

.comprehensive-section-sub {
  display: block;
  font-size: 1rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

@media (max-width: 480px) {
  .comprehensive-section-title {
    font-size: 1.5rem;
  }
}
</style>
