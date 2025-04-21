# vite-plugin-i18n-inspector

一个Vite插件，用于增强Vue应用中的国际化（i18n）开发体验。此插件会自动识别Vue模板中的`{{t()}}`或`{{$t()}}`表达式，并在对应的DOM节点上添加两个关键属性：
- `data-i18n-key`：存储国际化键值
- `data-file-path`：记录当前文件路径

在开发环境中，开发者可以通过点击页面上的翻译文本，快速定位到对应的Vue源文件及其精确位置，大幅提高国际化开发和调试效率。

## 安装
```bash
npm install vite-plugin-i18n-inspector --save-dev
# 或者使用 pnpm
pnpm add -D vite-plugin-i18n-inspector
```

## 配置
```ts
import { defineConfig } from 'vite';
import { createI18nInspector } from 'vite-plugin-i18n-inspector';

export default defineConfig({
  plugins: [
    createI18nInspector(),
  ],
});
```

## 效果展示
在Vue文件中使用国际化函数：
```vue
<template>
  <div>{{ t('test') }}</div>
</template>
```

渲染后的HTML（自动添加了调试属性）：
```html
<div data-i18n-key="test" data-file-path="test.vue">
  翻译后的文本内容
</div>
```

## 示例项目

我们提供了一个完整的示例项目，位于仓库的 `/example` 目录中。

### 运行示例

使用以下命令快速运行示例：

```bash
pnpm example
```

这个命令会：
1. 构建插件
2. 安装示例项目依赖
3. 启动开发服务器

有关示例的更多详细信息，请参阅 [example/README.md](./example/README.md)。

