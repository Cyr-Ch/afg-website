# AI for Good Munich Hub Website

A modern, responsive website for the AI for Good Hub in Munich, designed to empower young professionals (ages 18-30) to build AI solutions for the UN Sustainable Development Goals.

## 🌟 Features

### Design System
- **Color Palette**: Deep navy blue (#1E2A47), vibrant teal (#3AB795), warm gold (#F2C14E)
- **Typography**: Poppins/Montserrat for headings, Roboto for body text
- **Mobile-first responsive design** with 12-column grid system
- **Accessibility**: High contrast ratios, alt tags, keyboard navigation

### Key Functionalities
- ✅ Sticky navigation with mobile hamburger menu
- ✅ Interactive timeline with milestone animations
- ✅ Project carousel with touch/swipe support
- ✅ Contact form with real-time validation
- ✅ Event calendar with filtering
- ✅ Team grid with hover effects
- ✅ Global network map with interactive markers
- ✅ Newsletter signup
- ✅ Smooth animations and transitions

## 📁 Project Structure

```
AIforGoodHub/
├── index.html              # Homepage
├── about.html               # About Us page
├── contact.html             # Contact page
├── programs.html            # Programs & Events page
├── styles/
│   ├── main.css            # Global styles and design system
│   ├── home.css            # Homepage specific styles
│   ├── about.css           # About page specific styles
│   └── contact.css         # Contact page specific styles
├── scripts/
│   ├── main.js             # Global JavaScript functionality
│   ├── home.js             # Homepage carousel and animations
│   ├── about.js            # About page interactions
│   └── contact.js          # Contact form handling
└── README.md               # This file
```

## 🎨 Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Deep Navy | #1E2A47 | Primary headers, navigation |
| Vibrant Teal | #3AB795 | CTAs, accents, links |
| Warm Gold | #F2C14E | Highlights, special elements |
| Off-white | #FAFAFA | Background |
| Light Gray | #E5E5E5 | Secondary backgrounds |

## 📱 Pages Overview

### 1. Homepage (`index.html`)
- **Hero Section**: Full-screen with Munich meetup imagery and teal overlay
- **What We Do**: Three-column feature cards
- **Impact Timeline**: Interactive horizontal timeline with key milestones
- **Featured Projects**: Carousel showcasing student-led prototypes
- **Get Involved**: Membership benefits and partnership opportunities
- **Partners**: Logo strip of collaborating organizations

### 2. About Us (`about.html`)
- **Mission & Vision**: Two-column layout with statistics
- **Meet the Team**: Grid with photos, bios, and social links
- **Global Network**: Interactive world map showing hub locations
- **Values**: Three core values with icons and descriptions

### 3. Programs & Events (`programs.html`)
- **Event Calendar**: Filterable by type and date
- **Event Cards**: Detailed information with registration buttons
- **Past Events Gallery**: Photo gallery with lightbox functionality
- **Program Types**: Overview of workshops, panels, and hackathons
- **Newsletter Signup**: Subscription form for updates

### 4. Contact (`contact.html`)
- **Contact Form**: Multi-field form with validation
- **Contact Information**: Methods and response time
- **Munich Map**: Optional embedded Google Map
- **FAQ Section**: Common questions and answers

## 🖼️ Image Placeholders

All images use descriptive placeholders with specific requirements:

- **Hero Image**: Munich meetup with diverse young professionals networking
- **Team Photos**: Professional headshots with placeholder person icons
- **Project Screenshots**: Mockups of AI applications and dashboards
- **Event Photos**: Candid shots from past meetups and events
- **Partner Logos**: Organization and company logos
- **Icons**: SVG icons for social media, features, and navigation

## 🚀 Getting Started

### Prerequisites
- Web server (local or hosted)
- Modern web browser
- Text editor for customization

### Installation
1. Clone or download all files to your web server
2. Ensure all file paths are correct
3. Replace placeholder images with actual photos
4. Update contact information and links
5. Configure form handling (see Form Integration section)

### Form Integration
The contact form currently uses placeholder submission. To integrate with a backend:

1. **Update form action** in `contact.html`:
   ```html
   <form class="contact-form" action="/submit-contact" method="POST">
   ```

2. **Integrate with services** like:
   - Mailchimp (newsletter)
   - Google Forms
   - Netlify Forms
   - Custom backend API

3. **Update JavaScript** in `scripts/contact.js` to handle real submissions

## 🎯 Customization Guide

### Changing Colors
Update CSS variables in `styles/main.css`:
```css
:root {
    --primary-navy: #1E2A47;
    --secondary-teal: #3AB795;
    --accent-gold: #F2C14E;
    /* ... */
}
```

### Adding New Events
Update the events array in `scripts/programs.js` or integrate with a CMS.

### Modifying Content
- Text content can be edited directly in HTML files
- Team information in `about.html`
- Event details in `programs.html`
- Contact information throughout the site

## 📊 Performance Optimizations

- **Lazy loading** for images
- **CSS/JS minification** ready
- **Mobile-first responsive design**
- **Efficient animations** with CSS transforms
- **Semantic HTML** for SEO

## 🔧 Technical Requirements

- Modern browsers (Chrome 70+, Firefox 65+, Safari 12+)
- JavaScript enabled for interactive features
- CSS Grid and Flexbox support
- SVG support for icons

## 📈 SEO Features

- Semantic HTML structure
- Meta descriptions for each page
- Alt tags for all images
- Structured data ready for events
- Fast loading times
- Mobile-friendly design

## 🤝 Contributing

To add new features or pages:

1. Follow the existing CSS naming conventions
2. Use the established color palette and spacing system
3. Ensure mobile responsiveness
4. Add appropriate placeholder images with descriptions
5. Test across different browsers and devices

## 📞 Support

For questions about the website structure or customization:
- Review the code comments for guidance
- Check browser console for any JavaScript errors
- Ensure all file paths are correct
- Validate HTML and CSS syntax

## 🌍 Deployment

The website is built with standard HTML/CSS/JavaScript and can be deployed on:
- Static hosting services (Netlify, Vercel, GitHub Pages)
- Traditional web servers (Apache, Nginx)
- Content delivery networks (CDN)

### Recommended Deployment Steps:
1. Optimize and compress images
2. Minify CSS and JavaScript files
3. Set up proper HTTPS
4. Configure analytics (Google Analytics suggested)
5. Set up form handling service
6. Test all functionality post-deployment

---

**Built for AI for Good Munich Hub** | Empowering 18-30 year-olds to build AI solutions for the SDGs 