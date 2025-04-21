/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
import { parse } from '@vue/compiler-sfc';
import type { Plugin, ViteDevServer } from 'vite';
import type { Connect } from 'vite';

/**
 * Configuration options for the i18n inspector
 */
export interface I18nInspectorOptions {
  /**
   * The editor to use for opening files
   * @default 'cursor'
   * @example 'vscode', 'atom', 'sublime', etc.
   */
  editor?: string;
}

// This function generates the client script with the specified editor
function generateClientScript(options: I18nInspectorOptions) {
  const editorPrefix = options.editor ? `${options.editor}://file/` : 'vscode://file/';
  
  return `
(function() {
    'use strict';
    
    // Basic style injection
    function insertStyle() {
        var css = "*[data-i18n-key]{position:relative!important;border:1px solid goldenrod!important}*[data-i18n-key]:hover::before{display:block;position:absolute;top:-20px;right:0;color:red;background:white;padding:2px 4px;border:1px solid #ccc;font-size:12px;content:attr(data-i18n-key);z-index:9999}";
        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    // Handle click events
    function handleClick(e) {
        if (e.altKey && e.shiftKey) {
            var el = e.target.closest('[data-file-path]');
            if (el) {
                var path = el.getAttribute('data-file-path');
                if (path) {
                    e.preventDefault();
                    e.stopPropagation();
                    var link = document.createElement('a');
                    link.href = '${editorPrefix}' + path;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        }
    }
    
    insertStyle();
    document.addEventListener('click', handleClick, {capture: true});
})(); 
`;
}

/**
 * Vite plugin that adds data-i18n attributes to elements using i18n translation functions
 * in Vue templates.
 *
 * This plugin transforms Vue templates to add data-i18n attributes to elements
 * that use t() or $t() functions for internationalization.
 * 
 * @param options - Configuration options for the plugin
 */
export function createI18nInspector(options: I18nInspectorOptions = {}): Plugin {
    // Set default options
    const resolvedOptions: I18nInspectorOptions = {
        editor: 'cursor',
        ...options
    };
    
    // Generate client script based on options
    const clientScript = generateClientScript(resolvedOptions);
    
    return {
        name: 'vite-plugin-i18n-attribute',
        enforce: 'pre',
        transform(code: string, id: string) {
            // Only process Vue files
            if (!id.endsWith('.vue')) {
                return null;
            }

            try {
                // Parse the Vue file
                const { descriptor } = parse(code);

                // Skip if no template
                if (!descriptor.template) {
                    return null;
                }

                // Get the template content
                let templateContent = descriptor.template.content;

                // Instead of using regex, we'll use a more robust approach
                // We'll look for expressions that contain t() or $t() and wrap them

                // First, find all expressions in the template
                const expressionRegex = /{{([^}]+)}}/g;
                let hasTranslations = false;

                // Get the relative file path for the data-file-path attribute
                // Use the id directly as it's already a relative path from the project root
                const relativeFilePath = id;

                // Calculate the template's starting line in the original file
                const templateStartLine = descriptor.template.loc.start.line;

                // Process each expression
                templateContent = templateContent.replace(expressionRegex, (match, expression) => {
                    // Check if the expression contains t() or $t()
                    if (expression.includes('t(') || expression.includes('$t(')) {
                        hasTranslations = true;

                        // Extract the translation key if possible
                        let key = '';

                        // Try to extract a simple key like t('key') or $t('key')
                        const simpleKeyMatch = expression.match(/(?:t|$t)\(['"]([^'"]+)['"]\)/);
                        if (simpleKeyMatch) {
                            key = simpleKeyMatch[1];
                        } else {
                            // For more complex expressions, use a placeholder
                            key = 'complex-expression';
                        }

                        // Find the line and column of the translation function in the template
                        const templateLines = templateContent.split('\n');
                        let templateLine = 1;
                        let templateColumn = 1;
                        let found = false;

                        // Search for the expression in the template
                        for (let i = 0; i < templateLines.length; i++) {
                            const lineContent = templateLines[i];
                            const expressionIndex = lineContent.indexOf(match);

                            if (expressionIndex !== -1) {
                                templateLine = i + 1;
                                templateColumn = expressionIndex + 1;
                                found = true;
                                break;
                            }
                        }

                        // If we couldn't find the exact position, use a default
                        if (!found) {
                            templateLine = 1;
                            templateColumn = 1;
                        }

                        // Calculate the absolute line and column in the original file
                        // We need to add the template's starting line to get the absolute line
                        const absoluteLine = templateStartLine + templateLine - 1;
                        const absoluteColumn = templateColumn;

                        // Wrap the expression with a span containing the data-i18n attribute
                        // and the data-file-path attribute with relative path and position information
                        return `<span data-i18n-key="${key}" data-file-path="${relativeFilePath}:${absoluteLine}:${absoluteColumn}">${match}</span>`;
                    }

                    return match;
                });

                // If no translations found, return original code
                if (!hasTranslations) {
                    return null;
                }

                // Replace the template content in the original code
                const newCode = code.replace(descriptor.template.content, templateContent);

                return {
                    code: newCode,
                    map: null,
                };
            } catch (error) {
                console.error(`Error processing file ${id}:`, error);
                return null;
            }
        },
        configureServer(server: ViteDevServer) {
            return () => {
                server.middlewares.use((_req: Connect.IncomingMessage, res: any, next: Connect.NextFunction) => {
                    // Intercept HTML responses
                    const originalEnd = res.end;
                    
                    res.end = function(chunk: any, ...args: any[]) {
                        if (res.getHeader('Content-Type') && String(res.getHeader('Content-Type')).includes('text/html')) {
                            // Only inject in development mode
                            let html = chunk.toString();
                            
                            // Inject the debug script before </body>
                            const scriptToInject = `<script>${clientScript}</script>`;
                            
                            html = html.replace('</body>', `${scriptToInject}</body>`);
                            return originalEnd.call(res, html, ...args);
                        }
                        
                        return originalEnd.call(res, chunk, ...args);
                    };
                    
                    next();
                });
            };
        }
    };
}
