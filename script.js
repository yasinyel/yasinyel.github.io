// ===== TYPING EFFECT =====
const titles = [
    'Bilişim Teknolojileri Öğretmeni',
    'iOS Uygulama Geliştirici',
    'React Native Developer',
    'Yazılım Tutkunu'
];

let titleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingEl = document.getElementById('typingText');

function typeEffect() {
    const currentTitle = titles[titleIndex];

    if (isDeleting) {
        typingEl.textContent = currentTitle.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingEl.textContent = currentTitle.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? 30 : 60;

    if (!isDeleting && charIndex === currentTitle.length) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        speed = 500;
    }

    setTimeout(typeEffect, speed);
}

typeEffect();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== MOBILE NAV =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    });
}

// ===== PARTICLES =====
function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (4 + Math.random() * 4) + 's';
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

createParticles();

// ===== SCROLL REVEAL =====
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');

    reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;
        const revealPoint = 100;

        if (elementTop < windowHeight - revealPoint) {
            el.classList.add('active');
        }
    });
}

// Add reveal class to sections
document.querySelectorAll('.section-title, .about-text, .about-details, .detail-card, .app-card, .skill-category, .contact-card, .more-coming, .contact-subtitle').forEach(el => {
    el.classList.add('reveal');
});

window.addEventListener('scroll', revealOnScroll);

// ===== COUNTER TRIGGER =====
let counterAnimated = false;
window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection && !counterAnimated) {
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            animateCounters();
            counterAnimated = true;
        }
    }
});

// ===== SMOOTH SCROLL FOR SAFARI =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Initial reveal check
revealOnScroll();
