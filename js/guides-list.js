/**
 * Guides List Page - Load and display all guides
 */

// Initialize guide renderer
const guideRenderer = new GuideRenderer({
  supabaseUrl: window.SUPABASE_URL || null,
  supabaseKey: window.SUPABASE_KEY || null
});

/**
 * Load and render guides on page load
 */
async function initializeGuidesPage() {
  const container = document.getElementById('guides-container');

  try {
    // Load guides list
    const guides = await guideRenderer.loadGuidesList();

    if (!guides || guides.length === 0) {
      container.innerHTML = '<div class="error">No guides found. Please check back later.</div>';
      return;
    }

    // Render guides
    guideRenderer.renderGuidesList(guides, 'guides-container');

    // Add smooth scroll behavior
    document.querySelectorAll('a.guide-card').forEach(link => {
      link.addEventListener('click', (e) => {
        // Optional: Add analytics tracking here
        console.log('Guide clicked:', link.href);
      });
    });
  } catch (error) {
    console.error('Error loading guides:', error);
    container.innerHTML = '<div class="error">Error loading guides. Please try again later.</div>';
  }
}

/**
 * Filter guides by search term
 */
function filterGuides(searchTerm) {
  const cards = document.querySelectorAll('.guide-card');
  const term = searchTerm.toLowerCase();

  cards.forEach(card => {
    const title = card.querySelector('.guide-card-title').textContent.toLowerCase();
    const description = card.querySelector('.guide-card-description')?.textContent.toLowerCase() || '';

    if (title.includes(term) || description.includes(term)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

/**
 * Add search functionality
 */
function setupSearch() {
  const searchInput = document.querySelector('.search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    filterGuides(e.target.value);
  });
}

/**
 * Initialize page when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeGuidesPage();
  setupSearch();
});
