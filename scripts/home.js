// Home page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Featured Projects - Static display (no carousel functionality)
    const projectCards = document.querySelectorAll('.project-card');
    
    // Optional: Add entrance animation for project cards
    if (projectCards.length > 0) {
        const projectObserver = new IntersectionObserver(function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 150); // Stagger animation
                }
            });
        }, {
            threshold: 0.2
        });
        
        // Initialize cards with hidden state for animation
        projectCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            projectObserver.observe(card);
        });
    }
    
    // Timeline animation on scroll
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate-timeline');
                }, index * 200); // Stagger animation
            }
        });
    }, {
        threshold: 0.3
    });
    
    timelineItems.forEach(item => {
        timelineObserver.observe(item);
    });
    
    // Add timeline animation styles
    const timelineStyle = document.createElement('style');
    timelineStyle.textContent = `
        .timeline-item {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .timeline-item.animate-timeline {
            opacity: 1;
            transform: translateY(0);
        }
        
        .timeline-marker {
            transform: translateX(-50%) scale(0);
            transition: transform 0.5s ease 0.3s;
        }
        
        .timeline-item.animate-timeline .timeline-marker {
            transform: translateX(-50%) scale(1);
        }
    `;
    document.head.appendChild(timelineStyle);
    
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-background');
    
    if (hero && heroBackground) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            
            heroBackground.style.transform = `translateY(${parallax}px)`;
        });
    }
    
    // Counter animation for impact numbers (if added later)
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(progress * target);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
    
    // Expose counter animation for potential use
    window.animateCounter = animateCounter;
}); 