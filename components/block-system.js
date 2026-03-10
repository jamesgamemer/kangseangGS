/**
 * Block System - Handles block creation, rendering, and manipulation
 */

class BlockSystem {
  constructor() {
    this.blocks = [];
    this.blockTypes = {
      heading: {
        label: 'Heading',
        icon: 'H',
        defaultContent: { level: 1, text: 'Heading' }
      },
      text: {
        label: 'Text',
        icon: 'T',
        defaultContent: { text: 'Enter text here' }
      },
      image: {
        label: 'Image',
        icon: 'I',
        defaultContent: { url: '', alt: '', caption: '' }
      },
      video: {
        label: 'Video',
        icon: 'V',
        defaultContent: { type: 'youtube', url: '', width: 640, height: 360 }
      },
      table: {
        label: 'Table',
        icon: 'T',
        defaultContent: { rows: [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']] }
      },
      spacer: {
        label: 'Spacer',
        icon: 'S',
        defaultContent: { height: 20 }
      },
      container: {
        label: 'Container',
        icon: 'C',
        defaultContent: { style: 'default', children: [] }
      },
      columns: {
        label: 'Columns',
        icon: 'C',
        defaultContent: { columnCount: 2, children: [] }
      }
    };
  }

  /**
   * Create a new block
   */
  createBlock(type, content = null) {
    const blockType = this.blockTypes[type];
    if (!blockType) {
      console.error(`Unknown block type: ${type}`);
      return null;
    }

    const block = {
      id: this.generateId(),
      type: type,
      content: content || JSON.parse(JSON.stringify(blockType.defaultContent)),
      order: this.blocks.length
    };

    return block;
  }

  /**
   * Add block to the system
   */
  addBlock(block, position = null) {
    if (position !== null && position < this.blocks.length) {
      this.blocks.splice(position, 0, block);
      this.updateBlockOrder();
    } else {
      this.blocks.push(block);
    }
    return block;
  }

  /**
   * Remove block by id
   */
  removeBlock(blockId) {
    const index = this.blocks.findIndex(b => b.id === blockId);
    if (index !== -1) {
      this.blocks.splice(index, 1);
      this.updateBlockOrder();
      return true;
    }
    return false;
  }

  /**
   * Move block to new position
   */
  moveBlock(blockId, newPosition) {
    const index = this.blocks.findIndex(b => b.id === blockId);
    if (index === -1) return false;

    const block = this.blocks.splice(index, 1)[0];
    this.blocks.splice(newPosition, 0, block);
    this.updateBlockOrder();
    return true;
  }

  /**
   * Update block content
   */
  updateBlock(blockId, content) {
    const block = this.blocks.find(b => b.id === blockId);
    if (block) {
      block.content = { ...block.content, ...content };
      return true;
    }
    return false;
  }

  /**
   * Get block by id
   */
  getBlock(blockId) {
    return this.blocks.find(b => b.id === blockId);
  }

  /**
   * Get all blocks
   */
  getBlocks() {
    return this.blocks;
  }

  /**
   * Update block order after reordering
   */
  updateBlockOrder() {
    this.blocks.forEach((block, index) => {
      block.order = index;
    });
  }

  /**
   * Load blocks from data
   */
  loadBlocks(blocksData) {
    this.blocks = blocksData.map((data, index) => ({
      ...data,
      order: index
    }));
  }

  /**
   * Export blocks as JSON
   */
  exportBlocks() {
    return JSON.parse(JSON.stringify(this.blocks));
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get block type info
   */
  getBlockTypeInfo(type) {
    return this.blockTypes[type] || null;
  }

  /**
   * Get all available block types
   */
  getAvailableBlockTypes() {
    return Object.keys(this.blockTypes).map(type => ({
      type: type,
      ...this.blockTypes[type]
    }));
  }
}

/**
 * Block Renderer - Handles rendering blocks to HTML
 */
class BlockRenderer {
  constructor() {
    this.renderers = {
      heading: this.renderHeading.bind(this),
      text: this.renderText.bind(this),
      image: this.renderImage.bind(this),
      video: this.renderVideo.bind(this),
      table: this.renderTable.bind(this),
      spacer: this.renderSpacer.bind(this),
      container: this.renderContainer.bind(this),
      columns: this.renderColumns.bind(this)
    };
  }

  /**
   * Render a single block
   */
  renderBlock(block, blocks = []) {
    const renderer = this.renderers[block.type];
    if (!renderer) {
      console.error(`No renderer for block type: ${block.type}`);
      return '';
    }
    return renderer(block.content, block.id, blocks);
  }

  /**
   * Render all blocks
   */
  renderBlocks(blocks) {
    return blocks.map(block => this.renderBlock(block, blocks)).join('');
  }

  /**
   * Render heading block
   */
  renderHeading(content, blockId, blocks) {
    const level = Math.min(Math.max(content.level || 1, 1), 6);
    const tag = `h${level}`;
    return `<${tag} class="guide-heading" data-block-id="${blockId}">${this.escapeHtml(content.text)}</${tag}>`;
  }

  /**
   * Render text block with formatting support
   */
  renderText(content, blockId, blocks) {
    let text = content.text || '';
    
    // Parse text formatting
    text = this.parseTextFormatting(text);
    
    return `<p class="guide-text" data-block-id="${blockId}">${text}</p>`;
  }

  /**
   * Parse text formatting (bold, italic, underline, color, links)
   */
  parseTextFormatting(text) {
    // Bold: **text** or __text__
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Underline: ~~text~~ (using strikethrough for now)
    text = text.replace(/~~(.*?)~~/g, '<u>$1</u>');
    
    // Links: [text](url)
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    return text;
  }

  /**
   * Render image block
   */
  renderImage(content, blockId, blocks) {
    const url = content.url || '';
    const alt = content.alt || 'Guide image';
    const caption = content.caption || '';
    
    let html = `<figure class="guide-image" data-block-id="${blockId}">`;
    html += `<img src="${this.escapeHtml(url)}" alt="${this.escapeHtml(alt)}" loading="lazy">`;
    if (caption) {
      html += `<figcaption>${this.escapeHtml(caption)}</figcaption>`;
    }
    html += `</figure>`;
    
    return html;
  }

  /**
   * Render video block
   */
  renderVideo(content, blockId, blocks) {
    const type = content.type || 'youtube';
    const url = content.url || '';
    const width = content.width || 640;
    const height = content.height || 360;
    
    if (type === 'youtube') {
      const videoId = this.extractYoutubeId(url);
      if (!videoId) return '';
      
      return `
        <div class="guide-video" data-block-id="${blockId}" style="width: 100%; max-width: ${width}px;">
          <iframe 
            width="100%" 
            height="${height}" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `;
    }
    
    return '';
  }

  /**
   * Extract YouTube video ID from URL
   */
  extractYoutubeId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Render table block
   */
  renderTable(content, blockId, blocks) {
    const rows = content.rows || [];
    if (rows.length === 0) return '';
    
    let html = `<table class="guide-table" data-block-id="${blockId}"><tbody>`;
    
    rows.forEach((row, rowIndex) => {
      html += '<tr>';
      row.forEach((cell, cellIndex) => {
        const tag = rowIndex === 0 ? 'th' : 'td';
        html += `<${tag}>${this.escapeHtml(cell)}</${tag}>`;
      });
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    return html;
  }

  /**
   * Render spacer block
   */
  renderSpacer(content, blockId, blocks) {
    const height = content.height || 20;
    return `<div class="guide-spacer" data-block-id="${blockId}" style="height: ${height}px;"></div>`;
  }

  /**
   * Render container block
   */
  renderContainer(content, blockId, blocks) {
    const style = content.style || 'default';
    const children = content.children || [];
    
    let html = `<div class="guide-container guide-container-${style}" data-block-id="${blockId}">`;
    
    // Render child blocks if they exist
    if (children.length > 0) {
      children.forEach(childId => {
        const childBlock = blocks.find(b => b.id === childId);
        if (childBlock) {
          html += this.renderBlock(childBlock, blocks);
        }
      });
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Render columns block
   */
  renderColumns(content, blockId, blocks) {
    const columnCount = content.columnCount || 2;
    const children = content.children || [];
    
    let html = `<div class="guide-columns guide-columns-${columnCount}" data-block-id="${blockId}">`;
    
    // Divide children into columns
    const childrenPerColumn = Math.ceil(children.length / columnCount);
    
    for (let col = 0; col < columnCount; col++) {
      html += `<div class="guide-column">`;
      
      const startIdx = col * childrenPerColumn;
      const endIdx = Math.min(startIdx + childrenPerColumn, children.length);
      
      for (let i = startIdx; i < endIdx; i++) {
        const childId = children[i];
        const childBlock = blocks.find(b => b.id === childId);
        if (childBlock) {
          html += this.renderBlock(childBlock, blocks);
        }
      }
      
      html += '</div>';
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BlockSystem, BlockRenderer };
}
