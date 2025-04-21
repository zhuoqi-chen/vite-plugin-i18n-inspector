# vite-plugin-i18n-inspector Example

This is an example project demonstrating how to use the vite-plugin-i18n-inspector.

## Running the Example

From the root directory of the project, you can run:

```bash
pnpm example
```

This will:
1. Build the plugin
2. Install the dependencies for the example
3. Start the development server

Or you can run these steps manually:

```bash
# From the root directory
pnpm build

# Change to the example directory
cd example

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

## What to Observe

1. Look at the Vue component in `App.vue` that uses both the `t()` and `$t()` functions
2. Open the browser and inspect the DOM elements - you should see the added attributes:
   - `data-i18n-key`: containing the i18n key
   - `data-file-path`: containing the file path

3. Click on any of the translated text to see the i18n key and file path logged to the console 