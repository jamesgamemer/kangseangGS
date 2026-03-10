/**
 * Advanced Editor Features
 * Extends the basic guide editor with additional functionality
 */

class AdvancedBlockEditor {
  constructor() {
    this.blocks = [];
    this.selectedBlockId = null;
    this.clipboard = null;
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * Copy block
   */
  copyBlock(blockId) {
    const block = this.blocks.find(b => b.id === blockId);
    if (block) {
      this.clipboard = JSON.parse(JSON.stringify(block));
      this.clipboard.id = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      return true;
    }
    return false;
  }

  /**
   * Paste block
   */
  pasteBlock(position = null) {
    if (!this.clipboard) return null;

    const newBlock = JSON.parse(JSON.stringify(this.clipboard));
    newBlock.id = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    if (position !== null && position < this.blocks.length) {
      this.blocks.splice(position, 0, newBlock);
    } else {
      this.blocks.push(newBlock);
    }

    this.updateBlockOrder();
    this.saveToHistory();
    return newBlock;
  }

  /**
   * Cut block
   */
  cutBlock(blockId) {
    if (this.copyBlock(blockId)) {
      const index = this.blocks.findIndex(b => b.id === blockId);
      if (index !== -1) {
        this.blocks.splice(index, 1);
        this.updateBlockOrder();
        this.saveToHistory();
        return true;
      }
    }
    return false;
  }

  /**
   * Duplicate block
   */
  duplicateBlock(blockId) {
    const block = this.blocks.find(b => b.id === blockId);
    if (block) {
      const newBlock = JSON.parse(JSON.stringify(block));
      newBlock.id = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      const index = this.blocks.findIndex(b => b.id === blockId);
      this.blocks.splice(index + 1, 0, newBlock);
      this.updateBlockOrder();
      this.saveToHistory();
      return newBlock;
    }
    return null;
  }

  /**
   * Select block
   */
  selectBlock(blockId) {
    this.selectedBlockId = blockId;
    return this.blocks.find(b => b.id === blockId);
  }

  /**
   * Deselect block
   */
  deselectBlock() {
    this.selectedBlockId = null;
  }

  /**
   * Get selected block
   */
  getSelectedBlock() {
    if (!this.selectedBlockId) return null;
    return this.blocks.find(b => b.id === this.selectedBlockId);
  }

  /**
   * Merge blocks
   */
  mergeBlocks(blockId1, blockId2) {
    const block1 = this.blocks.find(b => b.id === blockId1);
    const block2 = this.blocks.find(b => b.id === blockId2);

    if (!block1 || !block2 || block1.type !== block2.type) {
      return false;
    }

    // Merge text blocks
    if (block1.type === 'text') {
      block1.content.text += ' ' + block2.content.text;
      const index = this.blocks.findIndex(b => b.id === blockId2);
      this.blocks.splice(index, 1);
      this.updateBlockOrder();
      this.saveToHistory();
      return true;
    }

    return false;
  }

  /**
   * Split block
   */
  splitBlock(blockId, position) {
    const block = this.blocks.find(b => b.id === blockId);
    if (!block || block.type !== 'text') {
      return false;
    }

    const text = block.content.text;
    const part1 = text.substring(0, position);
    const part2 = text.substring(position);

    block.content.text = part1;

    const newBlock = {
      id: 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type: 'text',
      content: { text: part2 }
    };

    const index = this.blocks.findIndex(b => b.id === blockId);
    this.blocks.splice(index + 1, 0, newBlock);
    this.updateBlockOrder();
    this.saveToHistory();
    return newBlock;
  }

  /**
   * Save to history
   */
  saveToHistory() {
    // Remove any history after current index
    this.history = this.history.slice(0, this.historyIndex + 1);

    // Save current state
    this.history.push(JSON.parse(JSON.stringify(this.blocks)));
    this.historyIndex++;

    // Limit history size
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * Undo
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.blocks = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      return true;
    }
    return false;
  }

  /**
   * Redo
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.blocks = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      return true;
    }
    return false;
  }

  /**
   * Can undo
   */
  canUndo() {
    return this.historyIndex > 0;
  }

  /**
   * Can redo
   */
  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Update block order
   */
  updateBlockOrder() {
    this.blocks.forEach((block, index) => {
      block.order = index;
    });
  }

  /**
   * Get blocks
   */
  getBlocks() {
    return this.blocks;
  }

  /**
   * Set blocks
   */
  setBlocks(blocks) {
    this.blocks = blocks;
    this.updateBlockOrder();
    this.saveToHistory();
  }
}

/**
 * Block Validator - Validate block content
 */
class BlockValidator {
  /**
   * Validate heading block
   */
  static validateHeading(content) {
    if (!content.level || content.level < 1 || content.level > 6) {
      return { valid: false, error: 'Level must be between 1 and 6' };
    }
    if (!content.text || content.text.trim().length === 0) {
      return { valid: false, error: 'Heading text cannot be empty' };
    }
    return { valid: true };
  }

  /**
   * Validate text block
   */
  static validateText(content) {
    if (!content.text || content.text.trim().length === 0) {
      return { valid: false, error: 'Text cannot be empty' };
    }
    return { valid: true };
  }

  /**
   * Validate image block
   */
  static validateImage(content) {
    if (!content.url || content.url.trim().length === 0) {
      return { valid: false, error: 'Image URL is required' };
    }
    if (!this.isValidUrl(content.url)) {
      return { valid: false, error: 'Invalid image URL' };
    }
    return { valid: true };
  }

  /**
   * Validate video block
   */
  static validateVideo(content) {
    if (!content.url || content.url.trim().length === 0) {
      return { valid: false, error: 'Video URL is required' };
    }
    if (!this.isValidUrl(content.url)) {
      return { valid: false, error: 'Invalid video URL' };
    }
    if (content.width && (content.width < 100 || content.width > 2000)) {
      return { valid: false, error: 'Width must be between 100 and 2000' };
    }
    if (content.height && (content.height < 100 || content.height > 2000)) {
      return { valid: false, error: 'Height must be between 100 and 2000' };
    }
    return { valid: true };
  }

  /**
   * Validate table block
   */
  static validateTable(content) {
    if (!content.rows || content.rows.length === 0) {
      return { valid: false, error: 'Table must have at least one row' };
    }
    if (content.rows.some(row => !Array.isArray(row) || row.length === 0)) {
      return { valid: false, error: 'All rows must have at least one cell' };
    }
    return { valid: true };
  }

  /**
   * Validate spacer block
   */
  static validateSpacer(content) {
    if (!content.height || content.height < 0 || content.height > 500) {
      return { valid: false, error: 'Height must be between 0 and 500' };
    }
    return { valid: true };
  }

  /**
   * Validate container block
   */
  static validateContainer(content) {
    const validStyles = ['default', 'highlight', 'warning', 'danger', 'success'];
    if (!validStyles.includes(content.style)) {
      return { valid: false, error: 'Invalid container style' };
    }
    return { valid: true };
  }

  /**
   * Validate columns block
   */
  static validateColumns(content) {
    if (!content.columnCount || content.columnCount < 1 || content.columnCount > 4) {
      return { valid: false, error: 'Column count must be between 1 and 4' };
    }
    return { valid: true };
  }

  /**
   * Validate block
   */
  static validateBlock(block) {
    const validators = {
      heading: this.validateHeading,
      text: this.validateText,
      image: this.validateImage,
      video: this.validateVideo,
      table: this.validateTable,
      spacer: this.validateSpacer,
      container: this.validateContainer,
      columns: this.validateColumns
    };

    const validator = validators[block.type];
    if (!validator) {
      return { valid: false, error: `Unknown block type: ${block.type}` };
    }

    return validator(block.content);
  }

  /**
   * Check if URL is valid
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Block Importer - Import blocks from various formats
 */
class BlockImporter {
  /**
   * Import from JSON
   */
  static fromJSON(json) {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data)) {
        return data;
      }
      if (data.blocks && Array.isArray(data.blocks)) {
        return data.blocks;
      }
      return [];
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  }

  /**
   * Import from HTML
   */
  static fromHTML(html) {
    const blocks = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    doc.body.childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const block = this.convertNodeToBlock(node);
        if (block) {
          blocks.push(block);
        }
      }
    });

    return blocks;
  }

  /**
   * Convert HTML node to block
   */
  static convertNodeToBlock(node) {
    const tagName = node.tagName.toLowerCase();

    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return {
          id: 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          type: 'heading',
          content: {
            level: parseInt(tagName[1]),
            text: node.innerText
          }
        };
      case 'p':
        return {
          id: 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          type: 'text',
          content: { text: node.innerHTML }
        };
      case 'img':
        return {
          id: 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          type: 'image',
          content: {
            url: node.src,
            alt: node.alt,
            caption: ''
          }
        };
      case 'table':
        const rows = [];
        node.querySelectorAll('tr').forEach(tr => {
          const row = [];
          tr.querySelectorAll('td, th').forEach(cell => {
            row.push(cell.innerText);
          });
          rows.push(row);
        });
        return {
          id: 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          type: 'table',
          content: { rows }
        };
      default:
        return null;
    }
  }
}

/**
 * Block Exporter - Export blocks to various formats
 */
class BlockExporter {
  /**
   * Export to JSON
   */
  static toJSON(blocks) {
    return JSON.stringify(blocks, null, 2);
  }

  /**
   * Export to HTML
   */
  static toHTML(blocks) {
    const renderer = new BlockRenderer();
    return renderer.renderBlocks(blocks);
  }

  /**
   * Export to Markdown
   */
  static toMarkdown(blocks) {
    let markdown = '';

    blocks.forEach(block => {
      switch (block.type) {
        case 'heading':
          markdown += '#'.repeat(block.content.level) + ' ' + block.content.text + '\n\n';
          break;
        case 'text':
          markdown += block.content.text + '\n\n';
          break;
        case 'image':
          markdown += `![${block.content.alt}](${block.content.url})\n\n`;
          break;
        case 'table':
          markdown += this.tableToMarkdown(block.content.rows) + '\n\n';
          break;
      }
    });

    return markdown;
  }

  /**
   * Convert table to markdown
   */
  static tableToMarkdown(rows) {
    if (rows.length === 0) return '';

    let markdown = rows[0].map(cell => `| ${cell} `).join('') + '|\n';
    markdown += rows[0].map(() => '| --- ').join('') + '|\n';

    for (let i = 1; i < rows.length; i++) {
      markdown += rows[i].map(cell => `| ${cell} `).join('') + '|\n';
    }

    return markdown;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AdvancedBlockEditor,
    BlockValidator,
    BlockImporter,
    BlockExporter
  };
}
