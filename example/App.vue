<template>
  <div class="app">
    <h1>{{ t('title') }}</h1>
    <p>{{ t('description') }}</p>
    <div class="buttons">
      <button>{{ $t('buttons.save') }}</button>
      <button>{{ $t('buttons.cancel') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.app {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.buttons {
  margin-top: 20px;
}

button {
  margin-right: 10px;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style> 