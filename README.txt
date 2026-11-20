MAISON BRAID — UPDATED WEBSITE

FILES
- index.html: the website content and sections
- styles.css: the new mint, lilac, butter-yellow and soft-coral design
- script.js: mobile navigation, 18-style gallery filters/search/lightbox, image fallbacks, date selection, availability buttons, price summary and demo booking confirmation

PREVIEW
1. Keep all three website files in the same folder.
2. Open index.html in a modern browser. For local development, use VS Code Live Server or another static server.
3. An internet connection is needed for the remotely hosted sample photos and Google Fonts.

WHAT WORKS IN THIS PREVIEW
- 18 labelled hairstyle cards with category filters and a search box
- Click any photo to enlarge it; use the arrows or keyboard arrows to move through visible styles
- Responsive layout and mobile menu
- Choose a hairstyle, add-on, date and available time
- Sundays and Mondays are shown as closed
- Selecting a slot updates the booking summary and estimated total
- A demo confirmation can be printed
- Demo-booked slots are saved in this browser using localStorage and become unavailable on this same device/browser

IMPORTANT BEFORE REAL-WORLD LAUNCH
This is a static front-end demo. It does NOT send appointment requests to a salon, reserve slots for other visitors, or process payments. The local demo slot list and localStorage are not a shared live calendar. For real bookings, connect the form to a secure server/database or salon booking platform so availability is shared and slots are checked/locked on the server. For real deposits, connect a hosted checkout from a payment provider such as Stripe or Mollie; do not collect card numbers or security codes in this static website. The online deposit choice here is a preview only and does not charge anyone.

CUSTOMISE THESE DETAILS
- Business name and text: edit index.html (search for “Maison Braid”)
- Photos and style names: edit the .gallery-card blocks in index.html
- Prices and appointment durations: edit serviceCatalog near the top of script.js and the matching service options in index.html
- Opening days and times: edit demoSlots and the closed-day check in script.js
- Colour palette: edit the CSS variables at the top of styles.css
- Currency: prices currently display in euros (€). Change formatEuro() in script.js and the service option prices if needed.

PHOTO NOTE
Sample hairstyle photographs are loaded from third-party image hosts. Their availability and reuse permissions can change, so replace them with your own salon/client photos or images you have permission to use before publishing commercially. A fallback photo is used when a gallery image fails to load.
