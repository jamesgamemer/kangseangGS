/**
 * Guide Editor - Admin panel for creating and editing guides
 */

// Initialize systems
const blockSystem = new BlockSystem();
const blockRenderer = new BlockRenderer();
const guideRenderer = new GuideRenderer({
  supabaseUrl: window.SUPABASE_URL || null,
  supabaseKey: window.SUPABASE_KEY || null
});
const mediaUploader = new MediaUploader({
  supabaseUrl: window.SUPABASE_URL || null,
  supabaseKey: window.SUPABASE_KEY || null
});

let currentGuide = null;
let isEditMode = false;

/**
 * Get slug from URL parameters
 */
function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

/**
 * Initialize editor
 */
async function initializeEditor() {
  const container = document.getElementById('editor-content');
  const slug = getSlugFromUrl();

  try {
    if (slug) {
      // Load existing guide
      isEditMode = true;
      currentGuide = await guideRenderer.loadGuideBySlug(slug);
      
      if (!currentGuide) {
        container.innerHTML = '<div class="error">Guide not found.</div>';
        return;
      }

      blockSystem.loadBlocks(currentGuide.blocks);
      document.getElementById('breadcrumb-title').textContent = currentGuide.title;
    } else {
      // Create new guide
      isEditMode = false;
      currentGuide = {
        title: 'New Guide',
        slug: '',
        description: '',
        cover_image: '',
        blocks: []
      };
    }

    renderEditor();
  } catch (error) {
    console.error('Error initializing editor:', error);
    container.innerHTML = '<div class="error">Error loading editor. Please try again.</div>';
  }
}

/**
 * Render the editor interface
 */
function renderEditor() {
  const container = document.getElementById('editor-content');
  container.innerHTML = '';

  // Create editor header
  const header = document.createElement('div');
  header.className = 'editor-header';
  header.innerHTML = `
    <input 
      type="text" 
      id="guide-title" 
      class="editor-title-input" 
      placeholder="Guide Title"
      value="${escapeHtml(currentGuide.title)}"
    >
    <div class="editor-actions">
      <button class="editor-btn editor-btn-secondary" onclick="previewGuide()">Preview</button>
      <button class="editor-btn editor-btn-primary" onclick="saveGuide()">Save Guide</button>
      ${isEditMode ? '<button class="editor-btn editor-btn-danger" onclick="deleteGuide()">Delete</button>' : ''}
    </div>
  `;
  container.appendChild(header);

  // Create metadata section
  const metaSection = document.createElement('div');
  metaSection.className = 'editor-meta';
  metaSection.innerHTML = `
    <div class="editor-meta-row">
      <div class="editor-meta-field">
        <label class="editor-meta-label">Slug (URL)</label>
        <input 
          type="text" 
          id="guide-slug" 
          class="editor-meta-input" 
          placeholder="guide-slug"
          value="${escapeHtml(currentGuide.slug)}"
        >
      </div>
      <div class="editor-meta-field">
        <label class="editor-meta-label">Cover Image URL</label>
        <input 
          type="text" 
          id="guide-cover" 
          class="editor-meta-input" 
          placeholder="https://example.com/image.jpg"
          value="${escapeHtml(currentGuide.cover_image)}"
        >
        <div class="editor-cover-preview">
          ${currentGuide.cover_image ? `<img src="${escapeHtml(currentGuide.cover_image)}" alt="Cover">` : ''}
        </div>
      </div>
    </div>
    <div class="editor-meta-row">
      <div class="editor-meta-field">
        <label class="editor-meta-label">Description</label>
        <textarea 
          id="guide-description" 
          class="editor-meta-textarea" 
          placeholder="Guide description..."
        >${escapeHtml(currentGuide.description)}</textarea>
      </div>
    </div>
  `;
  container.appendChild(metaSection);

  // Create blocks editor
  const blocksEditor = document.createElement('div');
  blocksEditor.className = 'blocks-editor';

  // Sidebar with block types
  const sidebar = document.createElement('div');
  sidebar.className = 'blocks-sidebar';
  sidebar.innerHTML = '<h3>Add Block</h3><div class="block-types"></div>';

  const blockTypes = blockSystem.getAvailableBlockTypes();
  const blockTypesContainer = sidebar.querySelector('.block-types');

  blockTypes.forEach(blockType => {
    const btn = document.createElement('button');
    btn.className = 'block-type-btn';
    btn.textContent = blockType.label;
    btn.onclick = () => addBlock(blockType.type);
    blockTypesContainer.appendChild(btn);
  });

  blocksEditor.appendChild(sidebar);

  // Canvas with blocks
  const canvas = document.createElement('div');
  canvas.className = 'blocks-canvas';
  canvas.id = 'blocks-canvas';
  blocksEditor.appendChild(canvas);

  container.appendChild(blocksEditor);

  // Render existing blocks
  renderBlocks();

  // Setup event listeners
  document.getElementById('guide-title').addEventListener('change', (e) => {
    currentGuide.title = e.target.value;
  });

  document.getElementById('guide-slug').addEventListener('change', (e) => {
    currentGuide.slug = e.target.value;
  });

  document.getElementById('guide-description').addEventListener('change', (e) => {
    currentGuide.description = e.target.value;
  });

  document.getElementById('guide-cover').addEventListener('change', (e) => {
    currentGuide.cover_image = e.target.value;
    const preview = document.querySelector('.editor-cover-preview');
    if (e.target.value) {
      preview.innerHTML = `<img src="${escapeHtml(e.target.value)}" alt="Cover">`;
    } else {
      preview.innerHTML = '';
    }
  });
}

/**
 * Render blocks in canvas
 */
function renderBlocks() {
  const canvas = document.getElementById('blocks-canvas');
  canvas.innerHTML = '';

  const blocks = blockSystem.getBlocks();

  if (blocks.length === 0) {
    canvas.innerHTML = '<p style="text-align: center; color: #b0b0b0; padding: 40px;">No blocks yet. Add one to get started.</p>';
    return;
  }

  blocks.forEach((block, index) => {
    const blockEl = createBlockElement(block, index);
    canvas.appendChild(blockEl);
  });

  // Setup drag and drop
  setupDragAndDrop();
}

/**
 * Create block element
 */
function createBlockElement(block, index) {
  const div = document.createElement('div');
  div.className = 'block-item';
  div.draggable = true;
  div.dataset.blockId = block.id;

  const typeInfo = blockSystem.getBlockTypeInfo(block.type);
  const contentPreview = getBlockContentPreview(block);

  div.innerHTML = `
    <div class="block-item-header">
      <span class="block-item-type"><span class="drag-handle">⋮⋮</span>${typeInfo.label}</span>
      <div class="block-item-actions">
        <button class="block-item-btn" onclick="editBlock('${block.id}')">Edit</button>
        <button class="block-item-btn" onclick="duplicateBlock('${block.id}')">Duplicate</button>
        <button class="block-item-btn" onclick="removeBlock('${block.id}')">Delete</button>
      </div>
    </div>
    <div class="block-item-content">${contentPreview}</div>
  `;

  return div;
}

/**
 * Get preview of block content
 */
function getBlockContentPreview(block) {
  const content = block.content;

  switch (block.type) {
    case 'heading':
      return `<strong>Heading ${content.level}:</strong> ${escapeHtml(content.text)}`;
    case 'text':
      return `<strong>Text:</strong> ${escapeHtml(content.text.substring(0, 50))}${content.text.length > 50 ? '...' : ''}`;
    case 'image':
      return `<strong>Image:</strong> ${escapeHtml(content.alt || 'Untitled')}`;
    case 'video':
      return `<strong>Video:</strong> ${content.type} - ${escapeHtml(content.url.substring(0, 40))}...`;
    case 'table':
      return `<strong>Table:</strong> ${content.rows.length} rows`;
    case 'spacer':
      return `<strong>Spacer:</strong> ${content.height}px`;
    case 'container':
      return `<strong>Container:</strong> ${content.style}`;
    case 'columns':
      return `<strong>Columns:</strong> ${content.columnCount} columns`;
    default:
      return '<strong>Unknown block type</strong>';
  }
}

/**
 * Add new block
 */
function addBlock(type) {
  const block = blockSystem.createBlock(type);
  blockSystem.addBlock(block);
  renderBlocks();
  
  // Scroll to new block
  setTimeout(() => {
    const blockEl = document.querySelector(`[data-block-id="${block.id}"]`);
    if (blockEl) {
      blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      editBlock(block.id);
    }
  }, 100);
}

/**
 * Edit block
 */
function editBlock(blockId) {
  const block = blockSystem.getBlock(blockId);
  if (!block) return;

  const content = prompt(`Edit ${block.type} content (JSON):`, JSON.stringify(block.content, null, 2));
  
  if (content) {
    try {
      const parsed = JSON.parse(content);
      blockSystem.updateBlock(blockId, parsed);
      renderBlocks();
    } catch (error) {
      alert('Invalid JSON format');
    }
  }
}

/**
 * Duplicate block
 */
function duplicateBlock(blockId) {
  const block = blockSystem.getBlock(blockId);
  if (!block) return;

  const newBlock = blockSystem.createBlock(block.type, JSON.parse(JSON.stringify(block.content)));
  const index = blockSystem.getBlocks().findIndex(b => b.id === blockId);
  blockSystem.addBlock(newBlock, index + 1);
  renderBlocks();
}

/**
 * Remove block
 */
function removeBlock(blockId) {
  if (confirm('Are you sure you want to delete this block?')) {
    blockSystem.removeBlock(blockId);
    renderBlocks();
  }
}

/**
 * Setup drag and drop
 */
function setupDragAndDrop() {
  const blockItems = document.querySelectorAll('.block-item');
  let draggedElement = null;

  blockItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedElement = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    item.addEventListener('dragend', (e) => {
      item.classList.remove('dragging');
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      if (draggedElement && draggedElement !== item) {
        const rect = item.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        
        if (e.clientY < midpoint) {
          item.parentNode.insertBefore(draggedElement, item);
        } else {
          item.parentNode.insertBefore(draggedElement, item.nextSibling);
        }
      }
    });
  });

  // Update block order after drag
  setTimeout(() => {
    const canvas = document.getElementById('blocks-canvas');
    const orderedBlockIds = Array.from(canvas.querySelectorAll('.block-item')).map(el => el.dataset.blockId);
    
    const newBlocks = [];
    orderedBlockIds.forEach(id => {
      const block = blockSystem.getBlock(id);
      if (block) newBlocks.push(block);
    });
    
    blockSystem.blocks = newBlocks;
    blockSystem.updateBlockOrder();
  }, 100);
}

/**
 * Preview guide
 */
function previewGuide() {
  // Create a temporary guide object
  const guide = {
    ...currentGuide,
    blocks: blockSystem.getBlocks()
  };

  // Open preview in new window
  const previewWindow = window.open('', 'preview', 'width=1000,height=800');
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(guide.title)} - Preview</title>
      <link rel="stylesheet" href="../css/guide-system.css">
      <style>
        body {
          background: #0f1117;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
        }
        .guide-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
        }
      </style>
    </head>
    <body>
      <div class="guide-container">
        <div id="guide-content"></div>
      </div>
      <script>
        class BlockRenderer {
          ${blockRenderer.constructor.toString()}
          ${blockRenderer.renderHeading.toString()}
          ${blockRenderer.renderText.toString()}
          ${blockRenderer.parseTextFormatting.toString()}
          ${blockRenderer.renderImage.toString()}
          ${blockRenderer.renderVideo.toString()}
          ${blockRenderer.extractYoutubeId.toString()}
          ${blockRenderer.renderTable.toString()}
          ${blockRenderer.renderSpacer.toString()}
          ${blockRenderer.renderContainer.toString()}
          ${blockRenderer.renderColumns.toString()}
          ${blockRenderer.escapeHtml.toString()}
          ${blockRenderer.renderBlock.toString()}
          ${blockRenderer.renderBlocks.toString()}
        }
        
        const renderer = new BlockRenderer();
        const guide = ${JSON.stringify(guide)};
        const container = document.getElementById('guide-content');
        container.innerHTML = renderer.renderBlocks(guide.blocks);
      </script>
    </body>
    </html>
  `);
  previewWindow.document.close();
}

/**
 * Save guide
 */
async function saveGuide() {
  // Validate
  if (!currentGuide.title.trim()) {
    alert('Please enter a guide title');
    return;
  }

  if (!currentGuide.slug.trim()) {
    alert('Please enter a guide slug');
    return;
  }

  // Update blocks
  currentGuide.blocks = blockSystem.getBlocks();

  try {
    if (window.SUPABASE_URL && window.SUPABASE_KEY) {
      // Save to Supabase
      await saveGuideToSupabase(currentGuide);
      alert('Guide saved successfully!');
    } else {
      // Save to localStorage (fallback)
      saveGuideToLocalStorage(currentGuide);
      alert('Guide saved to local storage (Supabase not configured)');
    }

    // Redirect to guide view
    setTimeout(() => {
      window.location.href = `../guides/guide-view.html?slug=${encodeURIComponent(currentGuide.slug)}`;
    }, 1000);
  } catch (error) {
    console.error('Error saving guide:', error);
    alert('Error saving guide: ' + error.message);
  }
}

/**
 * Save guide to Supabase
 */
async function saveGuideToSupabase(guide) {
  // This is a placeholder - implement actual Supabase integration
  throw new Error('Supabase integration not yet implemented');
}

/**
 * Save guide to localStorage (fallback)
 */
function saveGuideToLocalStorage(guide) {
  const guides = JSON.parse(localStorage.getItem('guides') || '[]');
  const index = guides.findIndex(g => g.slug === guide.slug);

  if (index >= 0) {
    guides[index] = guide;
  } else {
    guide.id = Date.now();
    guides.push(guide);
  }

  localStorage.setItem('guides', JSON.stringify(guides));
}

/**
 * Delete guide
 */
async function deleteGuide() {
  if (!confirm('Are you sure you want to delete this guide? This action cannot be undone.')) {
    return;
  }

  try {
    // Delete from storage
    if (window.SUPABASE_URL && window.SUPABASE_KEY) {
      // Delete from Supabase
      throw new Error('Supabase integration not yet implemented');
    } else {
      // Delete from localStorage
      const guides = JSON.parse(localStorage.getItem('guides') || '[]');
      const filtered = guides.filter(g => g.slug !== currentGuide.slug);
      localStorage.setItem('guides', JSON.stringify(filtered));
    }

    alert('Guide deleted successfully!');
    window.location.href = '../guides.html';
  } catch (error) {
    console.error('Error deleting guide:', error);
    alert('Error deleting guide: ' + error.message);
  }
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeEditor();
});
