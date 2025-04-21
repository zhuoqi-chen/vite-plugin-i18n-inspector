// @ts-ignore
import { defineConfig } from 'vite';
// @ts-ignore
import vue from '@vitejs/plugin-vue';
// @ts-ignore
import { createI18nInspector } from 'vite-plugin-i18n-inspector';

const config = defineConfig({
  plugins: [
    vue(),
  ],
}); 
if (process.env.NODE_ENV === 'development') {
  config.plugins.push(createI18nInspector());
}
export default config;