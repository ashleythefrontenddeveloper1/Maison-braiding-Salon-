'use strict';

// Mobile navigation
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  menuToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  mainNav.classList.toggle('open', !open);
});
mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  mainNav.classList.remove('open');
}));

// Style gallery filters and search
const filterButtons = [...document.querySelectorAll('.filter-button')];
const galleryCards = [...document.querySelectorAll('.gallery-card')];
const styleSearch = document.querySelector('#style-search');
const noResults = document.querySelector('#no-results');
let activeFilter = 'all';
function filterGallery() {
  const query = styleSearch.value.trim().toLowerCase();
  let shown = 0;
  galleryCards.forEach((card) => {
    const inCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
    const searchable = `${card.dataset.title} ${card.dataset.description} ${card.dataset.category}`.toLowerCase();
    const match = inCategory && (!query || searchable.includes(query));
    card.hidden = !match;
    if (match) shown += 1;
  });
  noResults.hidden = shown > 0;
}
filterButtons.forEach((button) => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach((item) => item.classList.toggle('active', item === button));
  filterGallery();
}));
styleSearch.addEventListener('input', filterGallery);

// Images get a reliable fallback so failed remote hosts do not leave broken-image icons.
const fallbackPhoto = 'https://images.pexels.com/photos/10398045/pexels-photo-10398045.jpeg?auto=compress&cs=tinysrgb&w=1000';
document.querySelectorAll('.gallery-photo img, .hero-photo img, .about-image img').forEach((img) => {
  img.addEventListener('error', () => {
    if (img.dataset.fallbackTried !== 'true') {
      img.dataset.fallbackTried = 'true';
      img.src = fallbackPhoto;
      img.alt = `${img.alt} (sample braid photo)`;
    } else {
      img.style.opacity = '0';
      img.parentElement.classList.add('photo-unavailable');
      img.parentElement.setAttribute('aria-label', img.alt || 'Hairstyle photo preview');
    }
  });
});

// Accessible lightbox
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxTitle = document.querySelector('#lightbox-title');
const lightboxDescription = document.querySelector('#lightbox-description');
const lightboxClose = document.querySelector('#lightbox-close');
let currentCardIndex = 0;
let priorFocus = null;
function visibleCards() { return galleryCards.filter((card) => !card.hidden); }
function renderLightbox(card) {
  const image = card.querySelector('img');
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = card.dataset.title;
  lightboxDescription.textContent = card.dataset.description;
}
function openLightbox(card) {
  const cards = visibleCards();
  currentCardIndex = cards.indexOf(card);
  priorFocus = document.activeElement;
  renderLightbox(card);
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}
function moveLightbox(direction) {
  const cards = visibleCards();
  if (!cards.length) return;
  currentCardIndex = (currentCardIndex + direction + cards.length) % cards.length;
  renderLightbox(cards[currentCardIndex]);
}
function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = '';
  document.body.style.overflow = '';
  if (priorFocus && typeof priorFocus.focus === 'function') priorFocus.focus();
}
galleryCards.forEach((card) => card.addEventListener('click', () => openLightbox(card)));
lightboxClose.addEventListener('click', closeLightbox);
document.querySelector('#lightbox-prev').addEventListener('click', () => moveLightbox(-1));
document.querySelector('#lightbox-next').addEventListener('click', () => moveLightbox(1));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (event) => {
  if (lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') moveLightbox(-1);
  if (event.key === 'ArrowRight') moveLightbox(1);
});

// Appointment booking preview. Demo bookings are remembered in this browser only.
const serviceCatalog = {
  knotless: { name: 'Medium Knotless Braids', price: 95, duration: '4 hours' },
  boho: { name: 'Boho Knotless Braids', price: 125, duration: '5 hours' },
  fulani: { name: 'Fulani Braids', price: 90, duration: '3.5 hours' },
  cornrows: { name: 'Stitch Cornrows', price: 65, duration: '2 hours' },
  twists: { name: 'Passion Twists', price: 105, duration: '4 hours' },
  kids: { name: 'Kids Braids', price: 55, duration: '2 hours' }
};
const demoSlots = ['09:00', '10:30', '12:30', '14:00', '15:30', '17:00'];
const slotStorageKey = 'maisonBraidDemoBookingsV2';
const bookingForm = document.querySelector('#booking-form');
const serviceSelect = document.querySelector('#service-select');
const addonSelect = document.querySelector('#addon-select');
const dateInput = document.querySelector('#booking-date');
const slotsWrap = document.querySelector('#time-slots');
const selectedTimeInput = document.querySelector('#selected-time');
const closedNote = document.querySelector('#closed-note');
const formError = document.querySelector('#form-error');
const formSuccess = document.querySelector('#booking-confirmation');
const paymentChoices = [...document.querySelectorAll('.payment-choice')];

function readBookings() {
  try { return JSON.parse(localStorage.getItem(slotStorageKey) || '{}'); }
  catch { return {}; }
}
function writeBookings(bookings) {
  try { localStorage.setItem(slotStorageKey, JSON.stringify(bookings)); }
  catch { /* Storage may be unavailable in private browsing; current-page state still works. */ }
}
function localDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function setMinimumAndDefaultDate() {
  const today = new Date();
  dateInput.min = localDateString(today);
  const nextOpen = new Date(today);
  while (nextOpen.getDay() === 0 || nextOpen.getDay() === 1) nextOpen.setDate(nextOpen.getDate() + 1);
  dateInput.value = localDateString(nextOpen);
}
function getSelectedPayment() {
  return bookingForm.querySelector('input[name="payment"]:checked')?.value || 'salon';
}
function getTotal() {
  const service = serviceCatalog[serviceSelect.value];
  return (service ? service.price : 0) + Number(addonSelect.value || 0);
}
function formatEuro(amount) { return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount); }
function updatePriceSummary() {
  const service = serviceCatalog[serviceSelect.value];
  const total = getTotal();
  const online = getSelectedPayment() === 'online';
  document.querySelector('#summary-service').textContent = service ? service.name : 'Choose a style';
  document.querySelector('#summary-total').textContent = formatEuro(total);
  document.querySelector('#summary-duration').textContent = service ? service.duration : '—';
  document.querySelector('#payment-due-label').textContent = online ? '25% deposit (demo)' : 'Pay at the salon';
  document.querySelector('#payment-due').textContent = formatEuro(online ? total * .25 : total);
  document.querySelector('#price-note').textContent = online
    ? 'This is only a deposit estimate. Online checkout is not connected, so no payment will be taken.'
    : 'Estimated price. Final details and timing can be confirmed by the braider.';
}
function chooseSlot(slot) {
  selectedTimeInput.value = slot;
  slotsWrap.querySelectorAll('.time-slot').forEach((button) => button.classList.toggle('selected', button.dataset.time === slot));
}
function renderSlots() {
  const date = dateInput.value;
  selectedTimeInput.value = '';
  slotsWrap.replaceChildren();
  closedNote.hidden = true;
  if (!date) {
    slotsWrap.innerHTML = '<p class="slot-prompt">Choose a date to see available times.</p>';
    return;
  }
  const weekday = new Date(`${date}T12:00:00`).getDay();
  if (weekday === 0 || weekday === 1) {
    slotsWrap.innerHTML = '<p class="slot-prompt">No appointments on this day.</p>';
    closedNote.hidden = false;
    return;
  }
  const booked = readBookings();
  const available = [];
  demoSlots.forEach((slot) => {
    const key = `${date}|${slot}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'time-slot';
    button.dataset.time = slot;
    button.textContent = slot;
    if (booked[key]) {
      button.disabled = true;
      button.textContent = `${slot} · Taken`;
      button.setAttribute('aria-label', `${slot}, already booked`);
    } else {
      button.setAttribute('aria-label', `${slot}, available`);
      button.addEventListener('click', () => chooseSlot(slot));
      available.push(button);
    }
    slotsWrap.append(button);
  });
  if (available.length) chooseSlot(available[0].dataset.time);
  else slotsWrap.innerHTML = '<p class="slot-prompt">All demo times are taken for this date. Please choose another day ♡</p>';
}

setMinimumAndDefaultDate();
renderSlots();
updatePriceSummary();
dateInput.addEventListener('change', renderSlots);
serviceSelect.addEventListener('change', updatePriceSummary);
addonSelect.addEventListener('change', updatePriceSummary);
paymentChoices.forEach((choice) => choice.addEventListener('change', () => {
  paymentChoices.forEach((item) => item.classList.toggle('selected', item === choice));
  updatePriceSummary();
}));

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
  formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function addSummaryLine(parent, label, value) {
  const row = document.createElement('p');
  const left = document.createElement('span');
  const right = document.createElement('strong');
  left.textContent = label;
  right.textContent = value;
  row.append(left, right);
  parent.append(row);
}
bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  formError.hidden = true;
  if (!bookingForm.reportValidity()) return;
  const name = bookingForm.elements.name.value.trim();
  const email = bookingForm.elements.email.value.trim();
  const date = dateInput.value;
  const time = selectedTimeInput.value;
  const service = serviceCatalog[serviceSelect.value];
  if (!service) return showError('Please choose a hairstyle before confirming.');
  if (!date || !time) return showError('Please choose a date and one of the available times.');
  const day = new Date(`${date}T12:00:00`).getDay();
  if (day === 0 || day === 1) return showError('The studio is closed on Sundays and Mondays. Please choose another date.');
  const key = `${date}|${time}`;
  const bookings = readBookings();
  if (bookings[key]) {
    renderSlots();
    return showError('That time has just been taken in this demo. Please choose another open slot.');
  }
  const payment = getSelectedPayment();
  const addon = Number(addonSelect.value || 0);
  const total = getTotal();
  const deposit = total * .25;
  bookings[key] = { style: service.name, savedAt: new Date().toISOString() };
  writeBookings(bookings);

  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  document.querySelector('#confirmation-copy').textContent = `Thanks, ${name}! Your demo appointment is saved in this browser. This is a preview only — the salon has not received your details.`;
  const summary = document.querySelector('#confirmation-summary');
  summary.replaceChildren();
  addSummaryLine(summary, 'Style', service.name);
  if (addon) addSummaryLine(summary, 'Extra', addonSelect.options[addonSelect.selectedIndex].text);
  addSummaryLine(summary, 'Date', dateLabel);
  addSummaryLine(summary, 'Time', time);
  addSummaryLine(summary, 'Name', name);
  addSummaryLine(summary, 'Email', email);
  addSummaryLine(summary, 'Estimated total', formatEuro(total));
  addSummaryLine(summary, 'Payment preference', payment === 'online' ? `Online deposit selected · ${formatEuro(deposit)} estimate` : 'Pay at the salon');
  document.querySelector('#confirmation-note').textContent = payment === 'online'
    ? 'No online deposit has been charged. Connect a payment provider checkout before accepting real online payments.'
    : 'No payment has been taken. Connect a booking calendar or booking server before using this for real salon appointments.';
  bookingForm.hidden = true;
  formSuccess.hidden = false;
  renderSlots();
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.querySelector('#print-booking').addEventListener('click', () => window.print());
document.querySelector('#book-another').addEventListener('click', () => {
  formSuccess.hidden = true;
  bookingForm.hidden = false;
  bookingForm.reset();
  setMinimumAndDefaultDate();
  renderSlots();
  paymentChoices.forEach((choice) => choice.classList.toggle('selected', choice.querySelector('input').checked));
  updatePriceSummary();
  bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelector('#year').textContent = new Date().getFullYear();
