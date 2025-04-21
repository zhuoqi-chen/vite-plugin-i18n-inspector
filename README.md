# vite-plugin-i18n-inspector

A Vite plugin to enhance the internationalization (i18n) development experience in Vue applications. This plugin automatically identifies `{{t()}}` or `{{$t()}}` expressions in Vue templates and adds two key attributes to the corresponding DOM nodes:
- `data-i18n-key`: Stores the internationalization key
- `data-file-path`: Records the current file path

In development environments, developers can click on translated text on the page to quickly locate the corresponding Vue source file and its exact position, significantly improving the efficiency of internationalization development and debugging.

## Features

- Automatically adds marker attributes to i18n text
- Highlights all internationalized text elements in the development environment
- Supports opening the corresponding source file directly in your preferred editor by pressing Shift+Option(Alt) and clicking on the text
- Customizable editor protocol (VS Code, Atom, Sublime, Cursor, etc.)

## Installation
```bash
npm install vite-plugin-i18n-inspector --save-dev
# or using pnpm
pnpm add -D vite-plugin-i18n-inspector
```

## Configuration
```ts
import { defineConfig } from 'vite';
import { createI18nInspector } from 'vite-plugin-i18n-inspector';

const config = defineConfig({
  plugins: [
    vue(),
  ],
}); 
if (process.env.NODE_ENV === 'development') {
  config.plugins.push(createI18nInspector({
    editor: 'cursor'
  }));
}
export default config;
```

### Configuration Options

You can customize the plugin by passing options to the `createI18nInspector` function:

```ts
createI18nInspector({
  // The editor to use for opening files
  // Default: 'vscode'
  // Other common values: 'vscode', 'atom', 'cursor', etc.
  editor: 'cursor'
})
```

## Demo
Using an internationalization function in a Vue file:
```vue
<template>
  <div>{{ t('test') }}</div>
</template>
```

Rendered HTML (debug attributes added automatically):
```html
<div data-i18n-key="test" data-file-path="test.vue">
  Translated text content
</div>
```

## Usage

1. In development mode, all text nodes using `t()` or `$t()` will be highlighted (with a gold border)
2. Hovering the mouse over translated text will display its corresponding internationalization key
3. Pressing Shift+Option key and clicking on the text will open the corresponding source file location in your configured editor

## Example Project

We provide a complete example project in the `/example` directory of the repository.

### Running the Example

Use the following command to quickly run the example:

```bash
pnpm example
```

This command will:
1. Build the plugin
2. Install example project dependencies
3. Start the development server

For more details about the example, please refer to [example/README.md](./example/README.md).

