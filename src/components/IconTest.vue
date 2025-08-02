<template>
  <div class="icon-test">
    <h2>图标测试页面</h2>
    
    <div class="test-section">
      <h3>直接导入测试</h3>
      <div class="icon-row">
        <MdiHome class="test-icon" />
        <span>直接导入 MdiHome</span>
      </div>
      <div class="icon-row">
        <CarbonAdd class="test-icon" />
        <span>直接导入 CarbonAdd</span>
      </div>
    </div>
    
    <div class="test-section">
      <h3>Icon组件测试</h3>
      <div class="icon-row">
        <Icon icon="mdi:home" class="test-icon" />
        <span>Icon组件 mdi:home</span>
      </div>
      <div class="icon-row">
        <Icon icon="carbon:add" class="test-icon" />
        <span>Icon组件 carbon:add</span>
      </div>
      <div class="icon-row">
        <Icon icon="mdi:content-save" class="test-icon" />
        <span>Icon组件 mdi:content-save</span>
      </div>
    </div>
    
    <div class="test-section">
      <h3>在线模式测试</h3>
      <div class="icon-row">
        <Icon icon="mdi:home" :offline="false" class="test-icon" />
        <span>在线模式 mdi:home</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MdiHome from '~icons/mdi/home'
import CarbonAdd from '~icons/carbon/add'
import Icon from './common/Icon.vue'
</script>

<style scoped>
.icon-test {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.icon-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.test-icon {
  width: 24px;
  height: 24px;
  color: #1976d2;
}

h2 {
  color: #333;
  text-align: center;
}

h3 {
  color: #666;
  margin-bottom: 15px;
}
</style>