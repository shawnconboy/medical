MedTrackⓇ — Static Frontend Demo

Overview
--------
This is a simple front-end only demo for the fictional American Labs MedTrackⓇ system. It includes static HTML/CSS/JS pages that demonstrate:

- Homepage describing services (`index.html`)
- Status lookup (`status.html`) — client-side demo with seeded orders in localStorage
- Appointment request form (`appointment.html`) — saves requests to localStorage
- FAQ (`faq.html`) — accordion UI
- Reviews (`reviews.html`) — saved to localStorage and displayed

Quick start
-----------
Open `index.html` in your browser (double-click in Finder or run `open index.html` from the `medical` folder).

Demo orders (auto-seeded)
-------------------------
On first load the app will automatically seed demo orders into your browser's localStorage so the status lookup works out of the box. Try these IDs:

- ORD-1001
- ORD-1002
- ORD-1003
- ORD-1004
- ORD-1005
- ORD-1006
- BAR-2001
- BAR-2002
- BAR-2003
- 1234567890

Notes
-----
- All data is stored locally in the browser (localStorage) for demo purposes. Clearing browser data will remove seeded orders, appointments, and reviews.
- This is front-end only and does not transmit data to a server.
# medical