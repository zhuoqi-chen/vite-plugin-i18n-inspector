// @ts-ignore
import { defineConfig } from 'vite';
// @ts-ignore
import vue from '@vitejs/plugin-vue';
// @ts-ignore
import { createI18nInspector } from '../dist';

export default defineConfig({
  plugins: [
    vue(),
    createI18nInspector(),
  ],
}); 