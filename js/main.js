/**
 * Institute of Building Design (IBD) - Interactive Script
 * Handles: Header, Mobile Drawer Navigation, FAQ Accordions,
 * Candidate Information Capture & Paystack Redirect Flow
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initFaqs();
  initCheckoutModal();
  initContactForm();
});

/* -------------------------------------------------------------
 * 1. Header Scroll Effect
 * ------------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* -------------------------------------------------------------
 * 2. Mobile Drawer Navigation
 * ------------------------------------------------------------- */
function initMobileNav() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

  if (!mobileToggle || !mobileNav) return;

  const openNav = () => {
    mobileNav.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    mobileNav.classList.remove('active');
    document.body.style.overflow = '';
  };

  mobileToggle.addEventListener('click', openNav);
  if (mobileClose) mobileClose.addEventListener('click', closeNav);

  mobileNav.addEventListener('click', (e) => {
    if (e.target === mobileNav) {
      closeNav();
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeNav);
  });
}

/* -------------------------------------------------------------
 * 3. Accessible FAQ Accordions
 * ------------------------------------------------------------- */
function initFaqs() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all other items in same accordion group
      const parent = item.parentElement;
      if (parent) {
        parent.querySelectorAll('.faq-item.active').forEach(activeItem => {
          if (activeItem !== item) {
            activeItem.classList.remove('active');
            const otherAns = activeItem.querySelector('.faq-answer');
            if (otherAns) otherAns.style.maxHeight = null;
          }
        });
      }

      if (isOpen) {
        item.classList.remove('active');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* -------------------------------------------------------------
 * 4. Candidate Information & Paystack Enrolment Modal
 * ------------------------------------------------------------- */
function initCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.checkout-close-btn');
  const triggerBtns = document.querySelectorAll('[data-checkout-trigger]');
  const productRadios = modal.querySelectorAll('input[name="checkout-product"]');
  const checkoutForm = document.getElementById('checkout-form');
  const successState = document.getElementById('checkout-success');
  const checkoutTitle = document.getElementById('checkout-item-title');
  const checkoutSubtotal = document.getElementById('checkout-subtotal');
  const checkoutTotal = document.getElementById('checkout-total');
  const paystackRedirectBtn = document.getElementById('paystack-redirect-btn');

  const PAYSTACK_URL = 'https://paystack.shop/pay/bzzaclu1al';

  const products = {
    'cpd-companion': {
      title: 'Option 1 - CPD Companion (Opening Offer)',
      programme: 'All Cat 1 + 3 Points | VA Membership | Assisted Tracking',
      price: 2500,
      currency: 'R',
      summary: '1 Year validity (2026). All Cat 1 + 3 points, Cat 2 guidance, VA membership.'
    },
    'ai-built-environment': {
      title: 'Option 2 - AI in the Built Environment',
      programme: '8 Live Sessions | 5 Weeks | 2 Cat 1 & 1 Cat 3 CPD Points',
      price: 10000,
      currency: 'R',
      summary: 'Full tuition, digital course archive, board review & SAIBD certificate.'
    },
    'ai-early-bird': {
      title: 'Option 2 - AI in the Built Environment (Early Bird)',
      programme: '8 Live Sessions | 5 Weeks | Early Bird Tuition',
      price: 7500,
      currency: 'R',
      summary: 'Early registration discount. Full programme access and CPD points.'
    }
  };

  let selectedProductKey = 'cpd-companion';

  const updateSummary = () => {
    const product = products[selectedProductKey] || products['cpd-companion'];

    if (checkoutTitle) checkoutTitle.textContent = `${product.title}`;
    if (checkoutSubtotal) checkoutSubtotal.textContent = `R ${product.price.toLocaleString('en-ZA')}`;
    if (checkoutTotal) checkoutTotal.textContent = `R ${product.price.toLocaleString('en-ZA')}`;

    productRadios.forEach(radio => {
      const parent = radio.closest('.product-option-radio');
      if (parent) {
        if (radio.value === selectedProductKey) {
          parent.classList.add('selected');
          radio.checked = true;
        } else {
          parent.classList.remove('selected');
        }
      }
    });
  };

  const openModal = (productKey = 'cpd-companion') => {
    if (products[productKey]) {
      selectedProductKey = productKey;
    } else {
      selectedProductKey = 'cpd-companion';
    }
    if (successState) successState.style.display = 'none';
    if (checkoutForm) checkoutForm.style.display = 'block';
    updateSummary();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productKey = btn.getAttribute('data-checkout-trigger') || 'cpd-companion';
      openModal(productKey);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  productRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      selectedProductKey = radio.value;
      updateSummary();
    });
  });

  // Handle Form Submit -> Capture info and forward to Paystack
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = checkoutForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spin" style="animation:spin 1s linear infinite;width:18px;height:18px;margin-right:8px;vertical-align:middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg> Redirecting to Paystack Secure Payment...
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        checkoutForm.style.display = 'none';

        if (successState) {
          const successProd = products[selectedProductKey];
          const refNumber = 'IBD-' + Math.floor(100000 + Math.random() * 900000);

          const refElem = document.getElementById('receipt-ref');
          const itemElem = document.getElementById('receipt-item');
          const amountElem = document.getElementById('receipt-amount');

          if (refElem) refElem.textContent = refNumber;
          if (itemElem) itemElem.textContent = successProd.title;
          if (amountElem) amountElem.textContent = `R ${successProd.price.toLocaleString('en-ZA')}`;

          successState.style.display = 'block';

          if (paystackRedirectBtn) {
            paystackRedirectBtn.href = PAYSTACK_URL;
          }

          // Automatically redirect to Paystack after 1.5 seconds
          setTimeout(() => {
            window.location.href = PAYSTACK_URL;
          }, 1500);
        }
      }, 1000);
    });
  }

  // Inject animation keyframes if not present
  if (!document.getElementById('checkout-spin-style')) {
    const style = document.createElement('style');
    style.id = 'checkout-spin-style';
    style.textContent = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
}

/* -------------------------------------------------------------
 * 5. General Contact Form
 * ------------------------------------------------------------- */
function initContactForm() {
  const contactForm = document.getElementById('institute-contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Submitting Inquiry...';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalText;
      const responseBox = document.getElementById('contact-form-response');
      if (responseBox) {
        responseBox.style.display = 'block';
        responseBox.innerHTML = `
          <div style="background-color:#F0FDFA;border:1px solid #CCFBF1;border-radius:8px;padding:1rem 1.25rem;color:#0F766E;margin-top:1rem;">
            <strong>Thank you. Your message has been sent to the IBD Admissions Desk.</strong>
            <p style="margin:0.25rem 0 0;font-size:0.875rem;">Our academic team (admin@saibd.org.za) will respond within 1 business day.</p>
          </div>
        `;
      }
      contactForm.reset();
    }, 800);
  });
}
