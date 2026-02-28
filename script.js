const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const year = document.getElementById('year');
const projectSearch = document.getElementById('project-search');
const projectCards = Array.from(document.querySelectorAll('.project-card'));
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const contactEndpoint = document.body.dataset.contactEndpoint || '';
const resumeEndpoint = document.body.dataset.resumeEndpoint || '';

const openResumeModalButton = document.getElementById('open-resume-modal');
const resumeModal = document.getElementById('resume-modal');
const closeResumeModalButton = document.getElementById('close-resume-modal');
const resumeGateForm = document.getElementById('resume-gate-form');
const resumeStatus = document.getElementById('resume-status');

if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('open');
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (projectSearch) {
  projectSearch.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    projectCards.forEach((card) => {
      const tags = card.dataset.tags || '';
      const content = card.textContent.toLowerCase();
      const matches = !query || tags.includes(query) || content.includes(query);
      card.style.display = matches ? '' : 'none';
    });
  });
}

const endpointIsConfigured = (url) =>
  url &&
  /^https?:\/\/.+/i.test(url) &&
  !url.includes('REPLACE_');

const submitToEndpoint = async (endpoint, payload) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Submission failed');
  }

  return response;
};

if (form && formStatus) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      formStatus.textContent = 'Please complete all required fields.';
      return;
    }

    if (!endpointIsConfigured(contactEndpoint)) {
      formStatus.textContent =
        'Contact endpoint not configured yet. Add your Formspree or Google Apps Script URL in index.html body data-contact-endpoint.';
      return;
    }

    const payload = {
      formType: 'contact_inquiry',
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
      source: 'portfolio_contact_form',
      timestamp: new Date().toISOString()
    };

    formStatus.textContent = 'Sending...';

    try {
      await submitToEndpoint(contactEndpoint, payload);
      formStatus.textContent = 'Message sent successfully.';
      form.reset();
    } catch (error) {
      formStatus.textContent = 'Unable to submit right now. Please try again.';
    }
  });
}

const openResumeModal = () => {
  if (!resumeModal) {
    return;
  }
  resumeModal.classList.add('open');
  resumeModal.setAttribute('aria-hidden', 'false');
};

const closeResumeModal = () => {
  if (!resumeModal) {
    return;
  }
  resumeModal.classList.remove('open');
  resumeModal.setAttribute('aria-hidden', 'true');
};

if (openResumeModalButton) {
  openResumeModalButton.addEventListener('click', openResumeModal);
}

if (closeResumeModalButton) {
  closeResumeModalButton.addEventListener('click', closeResumeModal);
}

if (resumeModal) {
  resumeModal.addEventListener('click', (event) => {
    if (event.target === resumeModal) {
      closeResumeModal();
    }
  });
}

if (resumeGateForm && resumeStatus) {
  resumeGateForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = resumeGateForm.visitorName.value.trim();
    const email = resumeGateForm.visitorEmail.value.trim();
    const phone = resumeGateForm.visitorPhone.value.trim();

    if (!name) {
      resumeStatus.textContent = 'Please enter your name.';
      return;
    }

    if (!email && !phone) {
      resumeStatus.textContent = 'Please provide either an email or contact number.';
      return;
    }

    if (email && !resumeGateForm.visitorEmail.checkValidity()) {
      resumeStatus.textContent = 'Please provide a valid email address.';
      return;
    }

    if (phone && !resumeGateForm.visitorPhone.checkValidity()) {
      resumeStatus.textContent = 'Please provide a valid contact number.';
      return;
    }

    if (!endpointIsConfigured(resumeEndpoint)) {
      resumeStatus.textContent =
        'Resume endpoint not configured yet. Add your Formspree or Google Apps Script URL in index.html body data-resume-endpoint.';
      return;
    }

    const payload = {
      formType: 'resume_download',
      name,
      email: email || null,
      phone: phone || null,
      source: 'portfolio_resume_gate',
      timestamp: new Date().toISOString()
    };

    resumeStatus.textContent = 'Submitting details...';

    try {
      await submitToEndpoint(resumeEndpoint, payload);
    } catch (error) {
      resumeStatus.textContent = 'Unable to submit right now. Please try again.';
      return;
    }

    const link = document.createElement('a');
    link.href = 'assets/Darshan_Chordiya_Resume.pdf';
    link.download = 'Darshan_Chordiya_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();

    resumeStatus.textContent = 'Resume download started.';
    resumeGateForm.reset();
    setTimeout(closeResumeModal, 500);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 40, 180)}ms`;
  observer.observe(element);
});
