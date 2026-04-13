// Home page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    function getApiBaseUrl() {
        const configuredUrl = window.APP_CONFIG && window.APP_CONFIG.apiBaseUrl
            ? String(window.APP_CONFIG.apiBaseUrl).trim()
            : '';
        if (!configuredUrl || configuredUrl.includes('YOUR-WORKER-SUBDOMAIN')) {
            return '';
        }
        return configuredUrl.replace(/\/+$/, '');
    }

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

    const applicationModal = document.getElementById('application-modal');
    const openApplicationButtons = document.querySelectorAll('#open-application-modal, .open-application-modal');
    const closeApplicationButton = document.getElementById('close-application-modal');
    const closeBackdrop = document.querySelector('[data-close-modal]');
    const applicationForm = document.getElementById('munich-application-form');
    const messageBox = document.getElementById('application-form-message');
    const submitButton = document.getElementById('submit-application-button');
    const answerFields = document.querySelectorAll('.application-answer');

    function openApplicationModal() {
        if (!applicationModal) {
            return;
        }
        applicationModal.classList.add('is-open');
        applicationModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        const firstInput = applicationForm ? applicationForm.querySelector('input, textarea') : null;
        if (firstInput) {
            firstInput.focus();
        }
    }

    function closeApplicationModal() {
        if (!applicationModal) {
            return;
        }
        applicationModal.classList.remove('is-open');
        applicationModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (window.location.hash === '#apply-now') {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }

    function setFormMessage(type, text) {
        if (!messageBox) {
            return;
        }
        messageBox.className = 'application-form-message';
        messageBox.textContent = text;
        messageBox.classList.add(type);
    }

    function clearFormMessage() {
        if (!messageBox) {
            return;
        }
        messageBox.className = 'application-form-message';
        messageBox.textContent = '';
    }

    function countWords(text) {
        return text.trim().split(/\s+/).filter(Boolean).length;
    }

    function updateWordCounter(textarea) {
        const counter = document.querySelector(`[data-counter-for="${textarea.id}"]`);
        if (!counter) {
            return true;
        }
        const words = countWords(textarea.value);
        counter.textContent = `${words} words (minimum 300)`;
        const isValid = words >= 300;
        counter.classList.toggle('invalid', !isValid && words > 0);
        return isValid;
    }

    function parseBirthDate(input) {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(input)) {
            return null;
        }
        const [year, month, day] = input.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
            return null;
        }
        return date;
    }

    function calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = String(reader.result || '');
                const base64Content = result.includes(',') ? result.split(',')[1] : '';
                resolve(base64Content);
            };
            reader.onerror = () => reject(new Error('Could not read CV file.'));
            reader.readAsDataURL(file);
        });
    }

    openApplicationButtons.forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            openApplicationModal();
            if (window.location.hash !== '#apply-now') {
                history.replaceState(null, '', '#apply-now');
            }
        });
    });

    if (closeApplicationButton) {
        closeApplicationButton.addEventListener('click', closeApplicationModal);
    }

    if (closeBackdrop) {
        closeBackdrop.addEventListener('click', closeApplicationModal);
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && applicationModal && applicationModal.classList.contains('is-open')) {
            closeApplicationModal();
        }
    });

    if (window.location.hash === '#apply-now') {
        openApplicationModal();
    }

    answerFields.forEach(textarea => {
        updateWordCounter(textarea);
        textarea.addEventListener('input', () => updateWordCounter(textarea));
    });

    if (applicationForm) {
        applicationForm.addEventListener('submit', async event => {
            event.preventDefault();
            clearFormMessage();
            if (!submitButton) {
                setFormMessage('error', 'Application form is not fully initialized. Please refresh and try again.');
                return;
            }

            const formData = new FormData(applicationForm);
            const name = String(formData.get('name') || '').trim();
            const surname = String(formData.get('surname') || '').trim();
            const gender = String(formData.get('gender') || '').trim();
            const email = String(formData.get('email') || '').trim();
            const birthDateRaw = String(formData.get('birthDate') || '').trim();
            const parsedBirthDate = parseBirthDate(birthDateRaw);

            if (!name || !surname || !gender || !email) {
                setFormMessage('error', 'Please complete all required personal details before submitting.');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setFormMessage('error', 'Please enter a valid personal email address.');
                return;
            }

            if (!parsedBirthDate) {
                setFormMessage('error', 'Please select your birthdate using the date picker.');
                return;
            }

            const applicantAge = calculateAge(parsedBirthDate);
            if (applicantAge < 18 || applicantAge > 30) {
                setFormMessage('error', 'Applicants must be between 18 and 30 years old at the time of application.');
                return;
            }

            let allAnswersValid = true;
            answerFields.forEach(textarea => {
                if (!updateWordCounter(textarea)) {
                    allAnswersValid = false;
                }
            });

            if (!allAnswersValid) {
                setFormMessage('error', 'Each long-answer response must be at least 300 words.');
                return;
            }

            const cvFile = formData.get('cv');
            if (!(cvFile instanceof File) || cvFile.size === 0) {
                setFormMessage('error', 'Please upload your CV as a PDF.');
                return;
            }

            if (cvFile.type !== 'application/pdf') {
                setFormMessage('error', 'CV upload must be a PDF file.');
                return;
            }

            if (cvFile.size > 7 * 1024 * 1024) {
                setFormMessage('error', 'CV file is too large. Please keep it under 7 MB.');
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            try {
                const apiBaseUrl = getApiBaseUrl();
                if (!apiBaseUrl) {
                    throw new Error('API endpoint is not configured. Set scripts/config.js to your Cloudflare Worker URL.');
                }
                const cvBase64 = await fileToBase64(cvFile);
                const payload = {
                    name,
                    surname,
                    birthDate: birthDateRaw,
                    gender,
                    email,
                    motivation: String(formData.get('motivation') || '').trim(),
                    aiInterest: String(formData.get('aiInterest') || '').trim(),
                    communityContribution: String(formData.get('communityContribution') || '').trim(),
                    cv: {
                        fileName: cvFile.name,
                        mimeType: cvFile.type,
                        base64: cvBase64
                    }
                };

                const response = await fetch(`${apiBaseUrl}/submit-application`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || 'Submission failed.');
                }

                applicationForm.reset();
                answerFields.forEach(textarea => updateWordCounter(textarea));
                setFormMessage('success', 'Application submitted successfully. Thank you for applying to the Munich Hub.');
            } catch (error) {
                setFormMessage(
                    'error',
                    `Submission failed: ${error.message} If this keeps happening, contact munich@young-ai-leaders.org.`
                );
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Apply';
            }
        });
    }
});