/* ====================================
   MAIN.JS - Application Logic
   ==================================== */

// ============== PAGE NAVIGATION ==============

let currentPage = 0;
const totalPages = 7;
const pagesContainer = document.getElementById('pagesContainer');
const currentPageSpan = document.getElementById('currentPage');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

/**
 * Update page display and button states
 */
function updatePage() {
    // Translate pages container
    pagesContainer.style.transform = `translateX(-${currentPage * 100}%)`;
    
    // Update page counter
    currentPageSpan.textContent = currentPage + 1;
    
    // Update button disabled states
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === totalPages - 1;
    
    // Handle video playback on page 5 (index 4)
    const video = document.getElementById('photoVideo3');
    if (video) {
        if (currentPage === 4) {
            video.play().catch(e => {
                console.log('Video autoplay blocked:', e);
            });
        } else {
            video.pause();
        }
    }

    // Handle audio playback on page 6 (index 5)
    const audio = document.getElementById('favoriteSong');
    if (audio) {
        if (currentPage === 5) {
            audio.play().catch(e => {
                console.log('Audio autoplay blocked:', e);
            });
        }
        // Не останавливать аудио при уходе со страницы, чтобы музыка продолжала звучать
    }
    
    // Trigger page entry animations
    triggerPageAnimations();
}

/**
 * Navigate to next page
 */
function nextPage() {
    if (currentPage < totalPages - 1) {
        currentPage++;
        updatePage();
    }
}

/**
 * Navigate to previous page
 */
function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        updatePage();
    }
}

/**
 * Jump to specific page
 * @param {number} pageNum - Page number (0-indexed)
 */
function goToPage(pageNum) {
    if (pageNum >= 0 && pageNum < totalPages) {
        currentPage = pageNum;
        updatePage();
    }
}

// ============== TOUCH/SWIPE NAVIGATION ==============

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

/**
 * Handle touch start
 */
function handleTouchStart(e) {
    // Don't handle touch if it's on navigation buttons or page indicator
    if (e.target.closest('.nav-btn') || e.target.closest('.page-indicator')) {
        return;
    }
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}

/**
 * Handle touch end
 */
function handleTouchEnd(e) {
    // Don't handle touch if it started on navigation buttons or page indicator
    if (e.target.closest('.nav-btn') || e.target.closest('.page-indicator')) {
        return;
    }
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}

/**
 * Process swipe gesture
 */
function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50;

    // Only process horizontal swipes that are longer than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
            // Swipe right - previous page
            prevPage();
        } else {
            // Swipe left - next page
            nextPage();
        }
    }
}

/**
 * Add touch navigation for mobile devices
 */
function addTouchNavigation() {
    const pagesContainer = document.getElementById('pagesContainer');
    
    pagesContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    pagesContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
}

// ============== PHOTO INITIALIZATION ==============

/**
 * Initialize static photos from photos/ folder
 */
function initPhotos() {
    const multimedia = [
        { id: 'photoImg1', textId: 'photoText1', type: 'image' },
        { id: 'photoImg2', textId: 'photoText2', type: 'image' },
        { id: 'photoVideo3', textId: 'photoText3', type: 'video' },
        { id: 'favoriteSong', textId: 'songText', type: 'audio' }
    ];

    multimedia.forEach(item => {
        const element = document.getElementById(item.id);
        const text = document.getElementById(item.textId);
        const placeholder = element.parentElement;

        if (!element) {
            return;
        }

        if (item.type === 'video') {
            element.onloadeddata = function() {
                placeholder.classList.add('filled');
                text.style.display = 'none';
                element.play().catch(e => {
                    console.log('Autoplay blocked for video:', e);
                });
            };

            element.onerror = function() {
                placeholder.classList.remove('filled');
                text.style.display = 'block';
            };

            if (element.readyState >= 2) {
                placeholder.classList.add('filled');
                text.style.display = 'none';
                element.play().catch(e => {
                    console.log('Autoplay blocked for video:', e);
                });
            }
        } else if (item.type === 'audio') {
            element.oncanplay = function() {
                placeholder.classList.add('filled');
                text.style.display = 'none';
            };

            element.onerror = function() {
                placeholder.classList.remove('filled');
                text.style.display = 'block';
            };

            if (element.readyState >= 2) {
                placeholder.classList.add('filled');
                text.style.display = 'none';
            }
        } else {
            element.onload = function() {
                placeholder.classList.add('filled');
                text.style.display = 'none';
            };

            element.onerror = function() {
                placeholder.classList.remove('filled');
                text.style.display = 'block';
            };

            if (element.complete) {
                if (element.naturalHeight !== 0) {
                    placeholder.classList.add('filled');
                    text.style.display = 'none';
                } else {
                    placeholder.classList.remove('filled');
                    text.style.display = 'block';
                }
            }
        }
    });
}

// ============== PAGE ANIMATIONS ==============

/**
 * Trigger entry animations for current page
 */
function triggerPageAnimations() {
    const currentPageElement = document.querySelectorAll('.page')[currentPage];
    if (!currentPageElement) return;
    
    // Reset animations by triggering reflow
    const animatedElements = currentPageElement.querySelectorAll('[class*="fadeIn"]');
    
    animatedElements.forEach(el => {
        el.style.animation = 'none';
        setTimeout(() => {
            el.style.animation = '';
        }, 10);
    });
}

// ============== INITIALIZATION ==============

/**
 * Initialize the application
 */
function init() {
    // Set initial page
    updatePage();
    
    // Add accessibility
    addAccessibility();
    
    // Add touch navigation for mobile
    addTouchNavigation();
    
    // Prevent default link behavior if needed
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
}

/**
 * Add accessibility features
 */
function addAccessibility() {
    // Add ARIA labels to buttons
    prevBtn.setAttribute('aria-label', 'Предыдущая страница');
    nextBtn.setAttribute('aria-label', 'Следующая страница');
    
    // Add role to main elements
    const pages = document.querySelectorAll('.page');
    pages.forEach((page, index) => {
        page.setAttribute('role', 'article');
        page.setAttribute('aria-label', `Страница ${index + 1}`);
    });
}

/**
 * Prevent context menu on photos
 */
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('photo-image')) {
        e.preventDefault();
    }
});

/**
 * Handle window resize for responsive updates
 */
window.addEventListener('resize', () => {
    // Recalculate any necessary dimensions
    updatePage();
});

/**
 * Smooth scroll behavior
 */
document.documentElement.style.scrollBehavior = 'smooth';

/**
 * Add page visibility change handler
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden
        console.log('Page hidden');
    } else {
        // Page is visible
        triggerPageAnimations();
    }
});

// ============== START APPLICATION ==============

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}