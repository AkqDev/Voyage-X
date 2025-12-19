// Ensure strict mode for better code quality
'use strict';

// --- Global Variable Declarations ---
const scrollTopBtn = document.getElementById("scrollTopBtn");
const mainNavbar = document.getElementById("main-navbar");
const heroSection = document.getElementById("home");
// Use a safe calculation for hero height
const heroHeight = heroSection ? heroSection.clientHeight : 0;
// Define the offset for ScrollSpy to account for the sticky navbar height
const SCROLLSPY_OFFSET = 150; 
let autoSlideInterval; // Variable to hold the carousel interval ID

// --- 1. Sidebar Functions ---
function opensidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("translate-x-full");
    document.body.classList.add('sidebar-open'); // To prevent background scroll on mobile
}

function closesidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.add("translate-x-full");
    document.body.classList.remove('sidebar-open');
}

// Scroll to the top of the document smoothly
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
}

// Function to highlight the active link in the navigation bar
function highlightActiveLink(scrollPosition) {
    const sections = document.querySelectorAll('section[id], div[id]'); 
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentActive = null;

    // Determine the currently visible section
    sections.forEach(section => {
        const sectionTop = section.offsetTop - SCROLLSPY_OFFSET; 
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentActive = section.getAttribute('id');
        }
    });

    // Update link styles
    navLinks.forEach(link => {
        // Reset default style
        link.classList.remove('text-yellow-400');
        link.classList.add('text-white'); 

        // Apply active style
        if (link.getAttribute('href').substring(1) === currentActive) {
            link.classList.remove('text-white');
            link.classList.add('text-yellow-400'); 
        }
    });
}

// Main scroll event handler
window.onscroll = function() {
    const scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
    
    // a) Scroll-to-Top Button Toggle
    if (scrollTopBtn) {
       scrollTopBtn.style.display = scrollPosition > 300 ? "flex" : "none";
    }

    if (mainNavbar) {
        if (scrollPosition > heroHeight - 100) { 
            mainNavbar.classList.remove("bg-opacity-70");
            mainNavbar.classList.add("bg-opacity-100", "bg-gray-900");
        } else {
            mainNavbar.classList.remove("bg-opacity-100", "bg-gray-900");
            mainNavbar.classList.add("bg-opacity-70");
        }
    }

    // c) Simple Parallax Effect on Hero Background (Background attachment: fixed required in CSS)
    if (heroSection) {
        heroSection.style.backgroundPositionY = (-scrollPosition * 0.2) + 'px';
    }
    
    // d) ScrollSpy: Highlight Active Navigation Link
    highlightActiveLink(scrollPosition);
};

// --- 3. Animated Number Counter Functionality ---
function animateCount(element, finalValue) {
    let startTimestamp = null;
    const duration = 2000; // Animation duration in ms (2 seconds)

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Calculate the current value
        const currentValue = Math.floor(progress * finalValue);
        element.textContent = currentValue.toLocaleString();

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // Ensure the final value is set precisely at the end
            element.textContent = finalValue.toLocaleString();
        }
    };

    window.requestAnimationFrame(step);
}

// --- 8. Form Submission and Validation (Declared globally for accessibility) ---
function validateContactForm(event) {
    event.preventDefault(); 
    
    const form = document.getElementById('contactForm');
    if (!form) {
        console.warn("Contact form not found.");
        return false;
    }
    
    const name = form.elements['name'] ? form.elements['name'].value.trim() : '';
    const email = form.elements['email'] ? form.elements['email'].value.trim() : '';
    const subject = form.elements['subject'] ? form.elements['subject'].value.trim() : '';
    const message = form.elements['message'] ? form.elements['message'].value.trim() : '';

    if (name === "" || email === "" || subject === "" || message === "") {
        alert("Please fill in all fields.");
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return false;
    }

    alert("Message sent successfully! (This is a mock submission.)");
    form.reset();
    return true;
}


// --- DOMContentLoaded: Initial setup and logic activation ---
document.addEventListener("DOMContentLoaded", function() {
    
    // Initialize scroll button to hidden
    if (scrollTopBtn) {
        scrollTopBtn.style.display = "none";
    }

    // --- 4. Intersection Observer for Scroll Animations (Fade-In & Counter) ---
    const sections = document.querySelectorAll(".fade-in-section");
    
    // Define the style you need to apply for the fade-in effect to work in CSS
    // e.g., in styles.css: 
    /*
    .fade-in-section { opacity: 0; transform: translateY(20px); transition: all 0.6s ease-out; }
    .fade-in-section.is-visible { opacity: 1; transform: translateY(0); }
    */

    const observerOptions = {
        root: null, 
        rootMargin: "0px",
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                
                // Staggered Fade-in Logic for inner elements
                const childrenToStagger = entry.target.querySelectorAll(".fade-in-section > div, .fade-in-section > h1, .fade-in-section > p, .fade-in-section > header"); 
                childrenToStagger.forEach((child, index) => {
                    // Staggering based on index
                    child.style.transitionDelay = `${index * 0.1}s`; 
                    child.classList.add("is-visible"); 
                });

                // Animated Counter Logic (Targets h1 with class .text-5xl inside the counter div)
                if (entry.target.querySelector('.text-5xl')) {
                    const statElements = entry.target.querySelectorAll('.text-5xl');
                    statElements.forEach(statElement => {
                        // Extract number, handling potential commas (e.g., '100,000')
                        const match = statElement.textContent.match(/[\d,]+/);
                        if (match) {
                            const finalValue = parseInt(match[0].replace(/,/g, ''));
                            // Reset text content to '0' before starting animation
                            statElement.textContent = '0'; 
                            animateCount(statElement, finalValue);
                        }
                    });
                }
                
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        // Only observe sections that haven't been marked as visible (for potential server-side rendering or initial view)
        if (!section.classList.contains('is-visible')) {
            observer.observe(section);
        }
    });


    // --- 5. Accordion/FAQ Toggle Functionality ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            const icon = header.querySelector('i');

            // Close all other open items (ensures only one is open at a time)
            document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                if (activeItem !== item) {
                    activeItem.classList.remove('active');
                    activeItem.querySelector('.accordion-content').style.maxHeight = 0;
                    activeItem.querySelector('.accordion-header i').classList.replace('fa-minus', 'fa-plus');
                }
            });

            // Toggle the clicked item
            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                // Set max-height to the content's scroll height for smooth "slide-down" effect
                content.style.maxHeight = content.scrollHeight + "px";
                icon.classList.replace('fa-plus', 'fa-minus');
            } else {
                content.style.maxHeight = 0;
                icon.classList.replace('fa-minus', 'fa-plus');
            }
        });
    });

    // --- 6. Simple Image Carousel Functionality ---
    const carousel = document.getElementById('image-carousel');
    if (carousel) {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const totalSlides = slides.length;
        let currentSlide = 0;
        const AUTOPLAY_INTERVAL = 2000; // 2 seconds for auto-advance
        const INTERACTION_PAUSE = 5000; // 5 seconds pause after user interaction

        function showSlide(index) {
            slides.forEach((slide) => {
                slide.classList.add('hidden');
                slide.classList.remove('block');
            });
            slides[index].classList.remove('hidden');
            slides[index].classList.add('block');
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; 
            showSlide(currentSlide);
        }
        
        function restartAutoplay() {
            clearInterval(autoSlideInterval);
            // Pause briefly after interaction before resuming autoplay
            setTimeout(() => {
                autoSlideInterval = setInterval(nextSlide, AUTOPLAY_INTERVAL);
            }, INTERACTION_PAUSE); 
        }

        // Initialize the carousel
        showSlide(currentSlide);

        const prevButton = document.getElementById('carousel-prev');
        const nextButton = document.getElementById('carousel-next');

        // Add event listeners for navigation buttons (with interaction pause)
        if (prevButton) {
            prevButton.addEventListener('click', prevSlide);
            prevButton.addEventListener('click', restartAutoplay);
        }
        if (nextButton) {
            nextButton.addEventListener('click', nextSlide);
            nextButton.addEventListener('click', restartAutoplay);
        }

        // Autoplay feature
        autoSlideInterval = setInterval(nextSlide, AUTOPLAY_INTERVAL); 
        
        // Pause on hover
        carousel.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        carousel.addEventListener('mouseleave', () => autoSlideInterval = setInterval(nextSlide, AUTOPLAY_INTERVAL));
    }


    // --- 8. Attach Form Validation ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', validateContactForm);
    }
});