/**
 * Text Editor - Advanced text editing with formatting support
 */

class TextEditor {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      placeholder: 'Enter text here...',
      toolbar: true,
      formats: ['bold', 'italic', 'underline', 'strikethrough', 'link', 'color'],
      ...options
    };
    this.content = '';
    this.init();
  }

  /**
   * Initialize editor
   */
  init() {
    if (!this.container) {
      console.error(`Container with id "${this.container}" not found`);
      return;
    }

    this.container.innerHTML = '';
    this.container.className = 'text-editor';

    // Create toolbar
    if (this.options.toolbar) {
      this.createToolbar();
    }

    // Create editor area
    this.createEditor();
  }

  /**
   * Create toolbar
   */
  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'text-editor-toolbar';

    const formats = {
      bold: { icon: '<strong>B</strong>', title: 'Bold (Ctrl+B)', action: () => this.toggleFormat('bold') },
      italic: { icon: '<em>I</em>', title: 'Italic (Ctrl+I)', action: () => this.toggleFormat('italic') },
      underline: { icon: '<u>U</u>', title: 'Underline (Ctrl+U)', action: () => this.toggleFormat('underline') },
      strikethrough: { icon: '<s>S</s>', title: 'Strikethrough', action: () => this.toggleFormat('strikethrough') },
      link: { icon: '🔗', title: 'Add Link', action: () => this.insertLink() },
      color: { icon: '🎨', title: 'Text Color', action: () => this.insertColor() }
    };

    this.options.formats.forEach(format => {
      if (formats[format]) {
        const btn = document.createElement('button');
        btn.className = 'text-editor-btn';
        btn.innerHTML = formats[format].icon;
        btn.title = formats[format].title;
        btn.onclick = (e) => {
          e.preventDefault();
          formats[format].action();
        };
        toolbar.appendChild(btn);
      }
    });

    this.container.appendChild(toolbar);
  }

  /**
   * Create editor area
   */
  createEditor() {
    this.editor = document.createElement('div');
    this.editor.className = 'text-editor-content';
    this.editor.contentEditable = true;
    this.editor.placeholder = this.options.placeholder;
    this.editor.innerHTML = this.content;

    // Handle keyboard shortcuts
    this.editor.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            this.toggleFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            this.toggleFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            this.toggleFormat('underline');
            break;
        }
      }
    });

    this.container.appendChild(this.editor);
  }

  /**
   * Toggle text format
   */
  toggleFormat(format) {
    document.execCommand(format, false, null);
    this.editor.focus();
  }

  /**
   * Insert link
   */
  insertLink() {
    const url = prompt('Enter URL:', 'https://');
    if (url) {
      document.execCommand('createLink', false, url);
    }
    this.editor.focus();
  }

  /**
   * Insert color
   */
  insertColor() {
    const color = prompt('Enter color (hex):', '#00a8ff');
    if (color) {
      document.execCommand('foreColor', false, color);
    }
    this.editor.focus();
  }

  /**
   * Get content as HTML
   */
  getHTML() {
    return this.editor.innerHTML;
  }

  /**
   * Get content as text
   */
  getText() {
    return this.editor.innerText;
  }

  /**
   * Set content
   */
  setContent(html) {
    this.content = html;
    if (this.editor) {
      this.editor.innerHTML = html;
    }
  }

  /**
   * Clear content
   */
  clear() {
    this.setContent('');
  }

  /**
   * Focus editor
   */
  focus() {
    this.editor.focus();
  }

  /**
   * Get selection
   */
  getSelection() {
    return window.getSelection();
  }

  /**
   * Insert text at cursor
   */
  insertText(text) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
   * Undo
   */
  undo() {
    document.execCommand('undo', false, null);
  }

  /**
   * Redo
   */
  redo() {
    document.execCommand('redo', false, null);
  }
}

/**
 * Rich Text Formatter - Parse and format text
 */
class RichTextFormatter {
  /**
   * Convert markdown to HTML
   */
  static markdownToHtml(markdown) {
    let html = markdown;

    // Bold: **text** or __text__
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic: *text* or _text_
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Underline: ~~text~~
    html = html.replace(/~~(.*?)~~/g, '<u>$1</u>');

    // Strikethrough: ~~text~~
    html = html.replace(/---(.*?)---/g, '<s>$1</s>');

    // Links: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  /**
   * Convert HTML to markdown
   */
  static htmlToMarkdown(html) {
    let markdown = html;

    // Remove HTML tags and convert back to markdown
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
    markdown = markdown.replace(/<u>(.*?)<\/u>/g, '~~$1~~');
    markdown = markdown.replace(/<s>(.*?)<\/s>/g, '---$1---');
    markdown = markdown.replace(/<a href="(.*?)"[^>]*>(.*?)<\/a>/g, '[$2]($1)');
    markdown = markdown.replace(/<br>/g, '\n');
    markdown = markdown.replace(/<[^>]+>/g, '');

    return markdown;
  }

  /**
   * Sanitize HTML
   */
  static sanitizeHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Remove script tags
    const scripts = div.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // Remove event handlers
    const allElements = div.querySelectorAll('*');
    allElements.forEach(element => {
      Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          element.removeAttribute(attr.name);
        }
      });
    });

    return div.innerHTML;
  }

  /**
   * Extract text from HTML
   */
  static extractText(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.innerText;
  }

  /**
   * Count words
   */
  static countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count characters
   */
  static countCharacters(text) {
    return text.length;
  }

  /**
   * Estimate reading time (words per minute)
   */
  static estimateReadingTime(text, wordsPerMinute = 200) {
    const words = this.countWords(text);
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TextEditor, RichTextFormatter };
}
