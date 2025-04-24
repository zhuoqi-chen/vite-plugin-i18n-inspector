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
    
    // Get highlight state from localStorage or default to true if not set
    var highlightEnabled = localStorage.getItem('i18n-highlight-enabled') === null ? 
                            true : localStorage.getItem('i18n-highlight-enabled') !== 'false';
    var highlightStylesheet;
    
    // Basic style injection
    function insertStyle() {
        // Regular styles
        var baseCSS = ".i18n-toggle{position:fixed;right:0;bottom:20px;background:#fff;border:1px solid #ccc;border-radius:100px 0 0 100px;padding:4px;font-size:12px;cursor:pointer;z-index:10000;display:flex;align-items:center;box-shadow:0 2px 5px rgba(0,0,0,0.1);transition:transform 0.3s ease;transform:translateX(75%)}.i18n-toggle:hover{transform:translateX(0)}.i18n-toggle__switch{position:relative;display:inline-block;width:30px;height:16px;margin-left:8px}.i18n-toggle__switch input{opacity:0;width:0;height:0}.i18n-toggle__slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;transition:.4s;border-radius:16px}.i18n-toggle__slider:before{position:absolute;content:'';height:12px;width:12px;left:2px;bottom:2px;background-color:white;transition:.4s;border-radius:50%}.i18n-toggle__switch input:checked + .i18n-toggle__slider{background-color:#2196F3}.i18n-toggle__switch input:checked + .i18n-toggle__slider:before{transform:translateX(14px)}.i18n-toggle__icon{display:flex;align-items:center;justify-content:center;width:24px;height:100%;margin-right:4px;font-weight:bold;font-size:14px;color:#2196F3}";
        
        var baseStyle = document.createElement('style');
        baseStyle.textContent = baseCSS;
        document.head.appendChild(baseStyle);
        
        // Highlight styles in a separate stylesheet
        var highlightCSS = "*[data-i18n-key]{position:relative!important;border:1px solid goldenrod!important}*[data-i18n-key]:hover::before{display:block;position:absolute;top:-20px;right:0;color:red;background:white;padding:2px 4px;border:1px solid #ccc;font-size:12px;content:attr(data-i18n-key);z-index:9999}";
        
        highlightStylesheet = document.createElement('style');
        highlightStylesheet.id = 'i18n-highlight-styles';
        highlightStylesheet.textContent = highlightCSS;
        document.head.appendChild(highlightStylesheet);
        
        // If first time user (no setting in localStorage), set to enabled
        if (localStorage.getItem('i18n-highlight-enabled') === null) {
            localStorage.setItem('i18n-highlight-enabled', 'true');
        }
        
        // Initial state
        updateHighlightState();
    }
    
    // Create toggle button
    function createToggle() {
        var toggle = document.createElement('div');
        toggle.className = 'i18n-toggle';
        toggle.innerHTML = '<div class="i18n-toggle__icon"><svg style="width: 1rem;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" viewBox="0 0 24 24" class="vt-locales-btn-icon" data-v-817baab4=""><path d="M0 0h24v24H0z" fill="none"></path><path d=" M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z " class="css-c4d79v"></path></svg></div>Highlight<label class="i18n-toggle__switch"><input type="checkbox" ' + (highlightEnabled ? 'checked' : '') + '><span class="i18n-toggle__slider"></span></label>';
        document.body.appendChild(toggle);
        
        // Add event listener to checkbox
        var checkbox = toggle.querySelector('input');
        checkbox.addEventListener('change', function() {
            highlightEnabled = checkbox.checked;
            localStorage.setItem('i18n-highlight-enabled', highlightEnabled ? 'true' : 'false');
            updateHighlightState();
        });
    }
    
    // Update highlight state by enabling/disabling the stylesheet
    function updateHighlightState() {
        if (highlightStylesheet) {
            highlightStylesheet.disabled = !highlightEnabled;
        }
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
    
    // Initialize
    insertStyle();
    createToggle();
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
