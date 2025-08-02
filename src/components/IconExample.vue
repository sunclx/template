<template>
  <div class="icon-example">
    <h2>图标组件示例</h2>
    
    <div class="section">
      <h3>离线图标 (推荐)</h3>
      <div class="icon-grid">
        <!-- Material Design Icons -->
        <div class="icon-item">
          <Icon icon="mdi:home" size="24" />
          <span>mdi:home</span>
        </div>

        <div class="icon-item">
          <Icon icon="mdi:content-save" size="24" color="#388e3c" />
          <span>mdi:content-save</span>
        </div>
        <div class="icon-item">
          <Icon icon="mdi:magnify" size="24" />
          <span>mdi:magnify</span>
        </div>
        
        <!-- Carbon Icons -->
        <div class="icon-item">
          <Icon icon="carbon:add" size="24" />
          <span>carbon:add</span>
        </div>
        <div class="icon-item">
          <Icon icon="carbon:edit" size="24" color="#f57c00" />
          <span>carbon:edit</span>
        </div>
        
        <!-- Tabler Icons -->
        <div class="icon-item">
          <Icon icon="tabler:heart" size="24" color="#e91e63" />
          <span>tabler:heart</span>
        </div>
        <div class="icon-item">
          <Icon icon="tabler:star" size="24" color="#ffc107" />
          <span>tabler:star</span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h3>在线图标 (需要网络)</h3>
      <div class="icon-grid">
        <div class="icon-item">
          <Icon icon="mdi-home" :offline="false" size="24" />
          <span>在线模式</span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h3>不同尺寸</h3>
      <div class="size-demo">
        <Icon icon="mdi:star" size="16" />
        <Icon icon="mdi:star" size="24" />
        <Icon icon="mdi:star" size="32" />
        <Icon icon="mdi:star" size="48" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from './common/Icon.vue'
</script>

<style scoped>
.icon-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin-bottom: 30px;
}

h2 {
  color: #333;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 10px;
}

h3 {
  color: #666;
  margin-bottom: 15px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.2s ease;
}

.icon-item:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.icon-item span {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.size-demo {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}
</style>