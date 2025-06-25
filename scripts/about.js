// About page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Team member interactions
    const teamMembers = document.querySelectorAll('.team-member');
    
    teamMembers.forEach(member => {
        member.addEventListener('mouseenter', function() {
            // Add subtle animation on hover
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        member.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-4px) scale(1)';
        });
    });
    
    // Network map hub marker interactions
    const hubMarkers = document.querySelectorAll('.hub-marker');
    
    hubMarkers.forEach(marker => {
        const dot = marker.querySelector('.marker-dot');
        const label = marker.querySelector('.marker-label');
        
        marker.addEventListener('click', function() {
            const hubName = this.getAttribute('data-hub');
            
            // Remove active class from all markers
            hubMarkers.forEach(m => {
                m.querySelector('.marker-dot').classList.remove('active');
            });
            
            // Add active class to clicked marker
            dot.classList.add('active');
            
            // Show hub information (this could be expanded to show more details)
            showHubInfo(hubName);
        });
        
        // Enhanced hover effects
        marker.addEventListener('mouseenter', function() {
            if (!dot.classList.contains('active')) {
                dot.style.transform = 'scale(1.2)';
            }
            label.style.opacity = '1';
        });
        
        marker.addEventListener('mouseleave', function() {
            if (!dot.classList.contains('active')) {
                dot.style.transform = 'scale(1)';
            }
            label.style.opacity = '0';
        });
    });
    
    // Function to show hub information
    function showHubInfo(hubName) {
        const hubInfo = {
            'San Francisco': {
                description: 'Silicon Valley innovation hub focusing on AI ethics and sustainability.',
                members: '200+',
                projects: '35+'
            },
            'New York': {
                description: 'Financial and media center driving AI applications in fintech and social good.',
                members: '180+',
                projects: '28+'
            },

            'London': {
                description: 'Research and policy-focused hub bridging academia and industry.',
                members: '150+',
                projects: '30+'
            },
            'Singapore': {
                description: 'Asia-Pacific gateway promoting AI for development and governance.',
                members: '120+',
                projects: '22+'
            },
            'Sydney': {
                description: 'Climate and environmental AI solutions hub for the Pacific region.',
                members: '90+',
                projects: '18+'
            }
        };
        
        const info = hubInfo[hubName];
    }
    
    // Stats counter animation
    function animateStatsOnScroll() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
                    const target = parseInt(entry.target.textContent.replace(/[^\d]/g, ''));
                    if (target && target > 0) {
                        animateCounter(entry.target, target);
                        entry.target.setAttribute('data-animated', 'true');
                    }
                }
            });
        }, {
            threshold: 0.5
        });
        
        statNumbers.forEach(stat => {
            observer.observe(stat);
        });
    }
    
    // Counter animation function
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const startTime = performance.now();
        const suffix = element.textContent.replace(/[\d]/g, '');
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + suffix;
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
    
    // Initialize stats animation
    animateStatsOnScroll();
    
    // Values section parallax effect
    const valueCards = document.querySelectorAll('.value-card');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        valueCards.forEach((card, index) => {
            const offset = rate * (index + 1) * 0.1;
            card.style.transform = `translateY(${offset}px)`;
        });
    });
    
    // Team social links enhancement
    const socialLinks = document.querySelectorAll('.team-social .social-link');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add click animation
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // In a real implementation, this would open the actual social media profile
            console.log('Opening social media profile...');
        });
    });
    
    // Mission and vision cards animation
    const missionCard = document.querySelector('.mission-card');
    const visionCard = document.querySelector('.vision-card');
    
    if (missionCard && visionCard) {
        const cardsObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 200);
                }
            });
        }, {
            threshold: 0.3
        });
        
        // Initial state
        [missionCard, visionCard].forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            cardsObserver.observe(card);
        });
    }
    

}); 