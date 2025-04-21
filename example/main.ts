// @ts-ignore
import { createApp } from 'vue'
// @ts-ignore
import { createI18n } from 'vue-i18n'
import App from './App.vue'

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      title: 'I18n Inspector Example',
      description: 'This is an example showing the vite-plugin-i18n-inspector in action.',
      buttons: {
        save: 'Save',
        cancel: 'Cancel'
      }
    },
    zh: {
      title: 'I18n 检查器示例',
      description: '这是一个展示 vite-plugin-i18n-inspector 效果的示例。',
      buttons: {
        save: '保存',
        cancel: '取消'
      }
    }
  }
})

// Create app
const app = createApp(App)

// Use plugins
app.use(i18n)

// Mount app
app.mount('#app') 