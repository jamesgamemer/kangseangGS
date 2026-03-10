/**
 * Guide Renderer - Handles loading and rendering complete guides
 */

class GuideRenderer {
  constructor(options = {}) {
    this.supabaseUrl = options.supabaseUrl || null;
    this.supabaseKey = options.supabaseKey || null;
    this.blockRenderer = new BlockRenderer();
    this.useSupabase = !!(this.supabaseUrl && this.supabaseKey);
  }

  /**
   * Load guide by slug
   */
  async loadGuideBySlug(slug) {
    if (this.useSupabase) {
      return await this.loadGuideFromSupabase(slug);
    } else {
      return await this.loadGuideFromJSON(slug);
    }
  }

  /**
   * Load guide from Supabase
   */
  async loadGuideFromSupabase(slug) {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/guides?slug=eq.${slug}`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load guide: ${response.statusText}`);
      }

      const guides = await response.json();
      if (guides.length === 0) {
        return null;
      }

      const guide = guides[0];

      // Load guide blocks
      const blocksResponse = await fetch(
        `${this.supabaseUrl}/rest/v1/guide_blocks?guide_id=eq.${guide.id}&order=block_order.asc`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        }
      );

      if (!blocksResponse.ok) {
        throw new Error(`Failed to load guide blocks: ${blocksResponse.statusText}`);
      }

      const blocks = await blocksResponse.json();

      return {
        ...guide,
        blocks: blocks.map(b => ({
          id: b.id,
          type: b.block_type,
          content: b.block_content,
          order: b.block_order
        }))
      };
    } catch (error) {
      console.error('Error loading guide from Supabase:', error);
      return null;
    }
  }

  /**
   * Load guide from JSON (fallback)
   */
  async loadGuideFromJSON(slug) {
    try {
      const response = await fetch('data/guides.json');
      if (!response.ok) {
        throw new Error(`Failed to load guides: ${response.statusText}`);
      }

      const data = await response.json();

      // Search for guide in sections
      for (const section of data.sections) {
        const guide = section.guides.find(g => g.slug === slug);
        if (guide) {
          // Return guide with empty blocks for JSON fallback
          // In production, you'd load actual guide content
          return {
            id: guide.id,
            title: guide.title,
            slug: guide.slug,
            description: guide.description,
            cover_image: guide.image,
            blocks: this.getDefaultBlocksForGuide(guide)
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error loading guide from JSON:', error);
      return null;
    }
  }

  /**
   * Get default blocks for a guide (for JSON fallback)
   */
  getDefaultBlocksForGuide(guide) {
    return [
      {
        id: 'block_intro_' + guide.id,
        type: 'heading',
        content: { level: 1, text: guide.title },
        order: 0
      },
      {
        id: 'block_desc_' + guide.id,
        type: 'text',
        content: { text: guide.description || 'Guide content goes here.' },
        order: 1
      },
      {
        id: 'block_image_' + guide.id,
        type: 'image',
        content: {
          url: guide.image,
          alt: guide.title,
          caption: ''
        },
        order: 2
      },
      {
        id: 'block_content_' + guide.id,
        type: 'text',
        content: { text: 'This is a sample guide. Edit this guide in the admin panel to add more content.' },
        order: 3
      }
    ];
  }

  /**
   * Render guide to HTML
   */
  renderGuide(guide, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    // Clear container
    container.innerHTML = '';

    // Create guide header
    const header = document.createElement('div');
    header.className = 'guide-header';
    
    if (guide.cover_image) {
      const coverImg = document.createElement('img');
      coverImg.src = guide.cover_image;
      coverImg.alt = guide.title;
      coverImg.className = 'guide-cover-image';
      header.appendChild(coverImg);
    }

    const titleDiv = document.createElement('div');
    titleDiv.className = 'guide-title-section';
    titleDiv.innerHTML = `
      <h1 class="guide-main-title">${this.escapeHtml(guide.title)}</h1>
      ${guide.description ? `<p class="guide-main-description">${this.escapeHtml(guide.description)}</p>` : ''}
    `;
    header.appendChild(titleDiv);
    container.appendChild(header);

    // Create guide content area
    const content = document.createElement('div');
    content.className = 'guide-content';
    content.innerHTML = this.blockRenderer.renderBlocks(guide.blocks);
    container.appendChild(content);

    // Create table of contents if there are headings
    const headings = guide.blocks.filter(b => b.type === 'heading');
    if (headings.length > 1) {
      this.createTableOfContents(container, headings);
    }
  }

  /**
   * Create table of contents
   */
  createTableOfContents(container, headings) {
    const toc = document.createElement('div');
    toc.className = 'guide-toc';
    
    const tocTitle = document.createElement('h3');
    tocTitle.textContent = 'Table of Contents';
    toc.appendChild(tocTitle);

    const tocList = document.createElement('ul');
    
    headings.forEach((heading, index) => {
      const level = heading.content.level || 1;
      const text = heading.content.text || 'Heading';
      
      const li = document.createElement('li');
      li.className = `toc-level-${level}`;
      
      const link = document.createElement('a');
      link.href = `#heading-${index}`;
      link.textContent = text;
      
      li.appendChild(link);
      tocList.appendChild(li);
    });

    toc.appendChild(tocList);
    container.insertBefore(toc, container.querySelector('.guide-content'));
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

  /**
   * Load all guides list
   */
  async loadGuidesList() {
    if (this.useSupabase) {
      return await this.loadGuidesListFromSupabase();
    } else {
      return await this.loadGuidesListFromJSON();
    }
  }

  /**
   * Load guides list from Supabase
   */
  async loadGuidesListFromSupabase() {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/guides?order=created_at.desc`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load guides: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading guides from Supabase:', error);
      return [];
    }
  }

  /**
   * Load guides list from JSON
   */
  async loadGuidesListFromJSON() {
    try {
      const response = await fetch('data/guides.json');
      if (!response.ok) {
        throw new Error(`Failed to load guides: ${response.statusText}`);
      }

      const data = await response.json();
      const guides = [];

      data.sections.forEach(section => {
        section.guides.forEach(guide => {
          guides.push({
            id: guide.id,
            title: guide.title,
            slug: guide.slug,
            description: guide.description,
            cover_image: guide.image
          });
        });
      });

      return guides;
    } catch (error) {
      console.error('Error loading guides from JSON:', error);
      return [];
    }
  }

  /**
   * Render guides list
   */
  renderGuidesList(guides, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'guides-grid';

    guides.forEach(guide => {
      const card = document.createElement('a');
      card.className = 'guide-card';
      card.href = `guides/guide-view.html?slug=${encodeURIComponent(guide.slug)}`;
      
      card.innerHTML = `
        <div class="guide-card-image">
          <img src="${this.escapeHtml(guide.cover_image || 'images/placeholder.jpg')}" alt="${this.escapeHtml(guide.title)}" loading="lazy">
        </div>
        <div class="guide-card-content">
          <h3 class="guide-card-title">${this.escapeHtml(guide.title)}</h3>
          ${guide.description ? `<p class="guide-card-description">${this.escapeHtml(guide.description)}</p>` : ''}
        </div>
      `;

      grid.appendChild(card);
    });

    container.appendChild(grid);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GuideRenderer;
}
