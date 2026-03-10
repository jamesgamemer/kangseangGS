/**
 * Guide View Page - Load and display a single guide
 */

// Initialize guide renderer
const guideRenderer = new GuideRenderer({
  supabaseUrl: window.SUPABASE_URL || null,
  supabaseKey: window.SUPABASE_KEY || null
});

/**
 * Get slug from URL parameters
 */
function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

/**
 * Load and render guide on page load
 */
async function initializeGuidePage() {
  const container = document.getElementById('guide-content');
  const slug = getSlugFromUrl();

  if (!slug) {
    container.innerHTML = '<div class="error">No guide specified. Please select a guide from the list.</div>';
    return;
  }

  try {
    // Load guide
    const guide = await guideRenderer.loadGuideBySlug(slug);

    if (!guide) {
      container.innerHTML = '<div class="error">Guide not found. Please check the URL and try again.</div>';
      return;
    }

    // Update page title
    document.title = guide.title + ' - Guide';

    // Render guide
    guideRenderer.renderGuide(guide, 'guide-content');

    // Setup table of contents smooth scrolling
    setupTableOfContentsScrolling();

    // Track view
    trackGuideView(guide);
  } catch (error) {
    console.error('Error loading guide:', error);
    container.innerHTML = '<div class="error">Error loading guide. Please try again later.</div>';
  }
}

/**
 * Setup smooth scrolling for table of contents
 */
function setupTableOfContentsScrolling() {
  const tocLinks = document.querySelectorAll('.guide-toc a');

  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.querySelector(`[data-block-id="${targetId}"]`) ||
                           document.querySelector(`#${targetId}`);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/**
 * Track guide view (optional analytics)
 */
function trackGuideView(guide) {
  // Send analytics event
  if (window.gtag) {
    gtag('event', 'view_guide', {
      guide_id: guide.id,
      guide_title: guide.title,
      guide_slug: guide.slug
    });
  }

  // Or use custom tracking
  console.log('Guide viewed:', guide.slug);
}

/**
 * Setup edit button
 */
function setupEditButton() {
  const editBtn = document.querySelector('.guide-action-btn.edit');
  if (editBtn) {
    const slug = getSlugFromUrl();
    editBtn.href = `../admin/guide-editor.html?slug=${encodeURIComponent(slug)}`;
  }
}

/**
 * Initialize page when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeGuidePage();
  setupEditButton();
});
