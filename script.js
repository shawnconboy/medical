// Small client-side script to power demo features: status lookup, appointments, reviews, FAQ accordion

document.addEventListener('DOMContentLoaded', function () {
    // year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Demo sample data for status lookup (moved to localStorage)
    const defaultOrders = [
        { id: 'ORD-1001', patient: 'Acme Clinic', test: 'CBC', status: 'Received at intake' },
        { id: 'ORD-1002', patient: 'Northside Clinic', test: 'Lipid Panel', status: 'Processing — chemistry' },
        { id: 'ORD-1003', patient: 'Westside Pediatrics', test: 'Metabolic Panel', status: 'In queue' },
        { id: 'ORD-1004', patient: 'Central Hospital', test: 'Hemoglobin A1c', status: 'Processing — hematology' },
        { id: 'ORD-1005', patient: 'Valley Clinic', test: 'Thyroid Panel', status: 'Awaiting pickup' },
        { id: 'ORD-1006', patient: 'Riverbend Lab', test: 'Urinalysis', status: 'Completed — report available' },
        { id: 'BAR-2001', patient: 'Downtown Health', test: 'COVID PCR', status: 'Completed — report available' },
        { id: 'BAR-2002', patient: 'Sunrise Clinic', test: 'Strep A', status: 'Processing — microbiology' },
        { id: 'BAR-2003', patient: 'Lakeside Practice', test: 'Lipid Panel', status: 'Received at intake' },
        { id: '1234567890', patient: 'Neighborhood Health', test: 'COVID PCR', status: 'Completed — report available' }
    ];

    // Demo appointments
    const defaultAppts = [
        { id: 'APPT-1001', name: 'Jamie Mosley', email: 'jamie@clinic.com', phone: '555-1111', clinic: 'Acme Clinic', date: '2025-10-25', notes: 'Routine blood draw', created: '2025-10-20T09:00:00Z' },
        { id: 'APPT-1002', name: 'Mark Barron', email: 'mark@northside.com', phone: '555-2222', clinic: 'Northside Clinic', date: '2025-10-26', notes: 'Lipid panel', created: '2025-10-21T10:00:00Z' },
        { id: 'APPT-1003', name: 'Elisabeth Elmore', email: 'elisabeth@central.com', phone: '555-3333', clinic: 'Central Hospital', date: '2025-10-27', notes: 'Hemoglobin A1c', created: '2025-10-22T11:00:00Z' },
        { id: 'APPT-1004', name: 'Maria Chen', email: 'maria.chen@riverbend.org', phone: '555-4444', clinic: 'Riverbend Lab', date: '2025-10-28', notes: 'Urinalysis follow-up', created: '2025-10-22T13:00:00Z' },
        { id: 'APPT-1005', name: 'Daniel Ortiz', email: 'dan.ortiz@lakeside.com', phone: '555-5555', clinic: 'Lakeside Practice', date: '2025-10-29', notes: 'COVID PCR', created: '2025-10-22T14:00:00Z' }
    ];
    // Demo reviews
    const defaultReviews = [
        { name: 'Jamie Mosley', rating: 5, text: 'Fast and friendly service!', created: '2025-10-20T09:30:00Z' },
        { name: 'Mark Barron', rating: 4, text: 'Results were quick, but the waiting room was crowded.', created: '2025-10-21T10:30:00Z' },
        { name: 'Elisabeth Elmore', rating: 5, text: 'Very professional staff.', created: '2025-10-22T11:30:00Z' },
        { name: 'Lydia Vaughn', rating: 3, text: 'Average experience, but results were accurate.', created: '2025-10-22T12:00:00Z' },
        { name: 'Shawn Conboy', rating: 5, text: 'Highly recommend American Labs!', created: '2025-10-22T12:30:00Z' }
    ];

    // Always use hardcoded demo orders for status lookup and export
    function getOrders() {
        return defaultOrders;
    }
    function setOrders(arr) { /* no-op for demo */ }
    // CSV export helpers
    function toCSV(arr, fields) {
        if (!arr || arr.length === 0) return '';
        const esc = s => '"' + String(s).replace(/"/g, '""') + '"';
        return fields.join(',') + '\n' + arr.map(row => fields.map(f => esc(row[f] || '')).join(',')).join('\n');
    }
    function downloadCSV(filename, csv) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a) }, 100);
    }

    // Orders export
    const exportOrdersBtn = document.getElementById('export-orders');
    if (exportOrdersBtn) {
        exportOrdersBtn.addEventListener('click', function () {
            const orders = getOrders().map(o => {
                const parts = parseStatus(o.status);
                return { id: o.id, patient: o.patient, test: o.test, stage: parts.stage, detail: parts.detail };
            });
            const csv = toCSV(orders, ['id', 'patient', 'test', 'stage', 'detail']);
            downloadCSV('orders.csv', csv);
        });
    }
    // Appointments export
    const exportApptsBtn = document.getElementById('export-appts');
    if (exportApptsBtn) {
        exportApptsBtn.addEventListener('click', function () {
            const storedAppts = JSON.parse(localStorage.getItem('appts') || '[]');
            const appts = (storedAppts && storedAppts.length) ? storedAppts : defaultAppts;
            const csv = toCSV(appts, ['id', 'name', 'email', 'phone', 'clinic', 'date', 'notes', 'created']);
            downloadCSV('appointments.csv', csv);
        });
    }
    // Reviews export
    const exportReviewsBtn = document.getElementById('export-reviews');
    if (exportReviewsBtn) {
        exportReviewsBtn.addEventListener('click', function () {
            const storedReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
            const reviews = (storedReviews && storedReviews.length) ? storedReviews : defaultReviews;
            const csv = toCSV(reviews, ['name', 'rating', 'text', 'created']);
            downloadCSV('reviews.csv', csv);
        });
    }

    function getOrders() {
        return defaultOrders;
    }
    function setOrders(arr) {
        localStorage.setItem('orders', JSON.stringify(arr));
    }

    // parse status text into stage and detail
    function parseStatus(statusText) {
        if (!statusText) return { stage: '', detail: '' };
        // common separator used in our demo is an em-dash or long dash '—' or hyphen '-'
        const parts = statusText.split(/\s*[—-]\s*/);
        if (parts.length === 1) return { stage: parts[0], detail: '' };
        return { stage: parts[0], detail: parts.slice(1).join(' - ') };
    }

    // render demo orders into the table body
    function renderDemoOrders() {
        const tbody = document.getElementById('demo-orders-tbody');
        if (!tbody) return;
        const q = (document.getElementById('orders-search') || {}).value || '';
        const query = q.trim().toLowerCase();
        const orders = getOrders().filter(o => {
            if (!query) return true;
            return o.id.toLowerCase().includes(query) || o.patient.toLowerCase().includes(query);
        });
        // determine if any order uses normalized stage (Processing or Completed)
        const withStage = orders.map(o => {
            const parts = parseStatus(o.status);
            const norm = normalizeStage(parts.stage);
            return { raw: o, parts, norm };
        });
        const showStage = withStage.some(x => x.norm !== null);
        // toggle header visibility
        const stageHeader = document.querySelector('.data-table thead th[data-key="stage"]');
        if (stageHeader) stageHeader.style.display = showStage ? '' : 'none';
        // render rows: if stage not applicable, show full status in Detail
        tbody.innerHTML = withStage.map(x => {
            const o = x.raw; const parts = x.parts; const norm = x.norm;
            const orderId = escapeHtml(titleCase(o.id));
            const patient = escapeHtml(titleCase(o.patient));
            const test = escapeHtml(titleCase(o.test));
            let stageCell = '';
            let detailCell = '';
            if (norm) {
                stageCell = `<td>${renderStage(norm)}</td>`;
                detailCell = `<td>${escapeHtml(titleCase(parts.detail || ''))}</td>`;
            } else {
                // no normalized stage — hide stage cell and put full status in detail
                stageCell = showStage ? `<td></td>` : '';
                detailCell = `<td>${escapeHtml(titleCase(o.status))}</td>`;
            }
            return `<tr><td class="mono">${orderId}</td><td>${patient}</td><td>${test}</td>${stageCell}${detailCell}</tr>`;
        }).join('');
    }
    renderDemoOrders();

    // Sorting
    let sortState = { key: null, dir: 1 }; // dir: 1 asc, -1 desc
    function sortOrders(key) {
        const orders = getOrders().map(o => {
            const parts = parseStatus(o.status);
            return { id: o.id, patient: o.patient, test: o.test, stage: parts.stage, detail: parts.detail };
        });
        orders.sort((a, b) => {
            const A = String(a[key] || '').toLowerCase();
            const B = String(b[key] || '').toLowerCase();
            if (A < B) return -1 * sortState.dir;
            if (A > B) return 1 * sortState.dir;
            return 0;
        });
        const tbody = document.getElementById('demo-orders-tbody');
        tbody.innerHTML = orders.map(o => `<tr><td class="mono">${escapeHtml(o.id)}</td><td>${escapeHtml(o.patient)}</td><td>${escapeHtml(o.test)}</td><td>${escapeHtml(o.stage)}</td><td>${escapeHtml(o.detail)}</td></tr>`).join('');
    }
    document.querySelectorAll('.data-table thead th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.key;
            if (sortState.key === key) sortState.dir *= -1; else { sortState.key = key; sortState.dir = 1 }
            document.querySelectorAll('.data-table thead th.sortable').forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
            th.classList.add(sortState.dir === 1 ? 'sort-asc' : 'sort-desc');
            sortOrders(key);
            renderDemoOrders();
        });
    });

    // search/filter
    const searchEl = document.getElementById('orders-search');
    const clearSearch = document.getElementById('clear-search');
    if (searchEl) {
        searchEl.addEventListener('input', () => { renderDemoOrders(); });
    }
    if (clearSearch) { clearSearch.addEventListener('click', () => { if (searchEl) { searchEl.value = ''; renderDemoOrders(); } }); }

    // Title-case helper for presentation
    function titleCase(s) {
        if (!s) return '';
        return s.toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // render stage as colored chip
    function renderStage(stageText) {
        const s = ('' + stageText).toLowerCase();
        let cls = 'default';
        let label = stageText || '';
        if (s.includes('processing')) { cls = 'processing'; label = 'Processing' }
        else if (s.includes('completed')) { cls = 'completed'; label = 'Completed' }
        else { cls = 'default'; label = stageText }
        // convert label to kebab-case class for other variants
        const kebab = String(label).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const finalCls = cls === 'default' ? (kebab || 'default') : cls;
        return `<span class="chip ${finalCls}">${escapeHtml(titleCase(label))}</span>`;
    }

    // normalize a stage to a concise label for presentation (always return a string)
    function normalizeStage(stageText) {
        const s = (stageText || '').toLowerCase();
        if (s.includes('processing')) return 'Processing';
        if (s.includes('completed')) return 'Completed';
        if (s.includes('received')) return 'Received';
        if (s.includes('awaiting')) return 'Awaiting Pickup';
        if (s.includes('in queue') || s.includes('inqueue') || s.includes('queued')) return 'In Queue';
        if (s.includes('pending')) return 'Pending';
        // fallback: if there is some text, title-case it
        if (stageText && String(stageText).trim().length > 0) return titleCase(stageText);
        return 'Pending';
    }

    // STATUS PAGE
    const statusForm = document.getElementById('status-form');
    if (statusForm) {
        statusForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const id = document.getElementById('orderId').value.trim();
            const result = document.getElementById('status-result');
            const orders = getOrders();
            const found = orders.find(o => o.id.toLowerCase() === id.toLowerCase());
            if (found) {
                result.innerHTML = `<h3>Status for ${escapeHtml(found.id)}</h3>
                    <p><strong>Client:</strong> ${escapeHtml(found.patient)}</p>
                    <p><strong>Test:</strong> ${escapeHtml(found.test)}</p>
                    <p><strong>Current status:</strong> ${escapeHtml(found.status)}</p>`;
            } else {
                result.innerHTML = `<p>No records found for <strong>${escapeHtml(id)}</strong>. Please check your number and try again or contact support.</p>`;
            }
        });
    }

    // APPOINTMENTS
    const apptForm = document.getElementById('appointment-form');
    if (apptForm) {
        apptForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // client-side validation
            const nameEl = document.getElementById('name');
            const emailEl = document.getElementById('email');
            const errName = document.getElementById('err-name');
            const errEmail = document.getElementById('err-email');
            let ok = true;
            errName.textContent = '';
            errEmail.textContent = '';
            if (!nameEl.value.trim()) { errName.textContent = 'Please enter your full name.'; ok = false }
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailEl.value.trim())) { errEmail.textContent = 'Please enter a valid email address.'; ok = false }
            if (!ok) return;

            const data = {
                id: 'APPT-' + Date.now().toString().slice(-6),
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                clinic: document.getElementById('clinic').value.trim(),
                date: document.getElementById('date').value,
                notes: document.getElementById('notes').value.trim(),
                created: new Date().toISOString()
            };
            const arr = JSON.parse(localStorage.getItem('appts') || '[]');
            arr.push(data);
            localStorage.setItem('appts', JSON.stringify(arr));
            document.getElementById('appointment-result').innerHTML = `<p>Thanks ${escapeHtml(data.name)} — your request (ID: <strong>${data.id}</strong>) has been saved. We will contact you at ${escapeHtml(data.email)}.</p>`;
            apptForm.reset();
            renderAppointments();
        });
    }

    // Render saved appointments
    function renderAppointments() {
        const stored = JSON.parse(localStorage.getItem('appts') || '[]');
        const list = (stored && stored.length) ? stored : defaultAppts;
        const el = document.getElementById('appts-list');
        if (!el) return;
        if (list.length === 0) { el.style.display = 'none'; return }
        el.style.display = 'block';
        el.innerHTML = list.reverse().map(a => `
            <div class="card">
                <p><strong>${escapeHtml(a.name)}</strong> — ${escapeHtml(a.id)}</p>
                <p>${a.date ? 'Preferred: ' + escapeHtml(a.date) : 'No preferred date'}</p>
                <p>${escapeHtml(a.clinic || '')} ${a.phone ? '• ' + escapeHtml(a.phone) : ''}</p>
                <small class="muted">Submitted: ${new Date(a.created).toLocaleString()}</small>
            </div>
        `).join('');
    }
    const viewApptsBtn = document.getElementById('view-appts');
    if (viewApptsBtn) {
        viewApptsBtn.addEventListener('click', function () { renderAppointments(); window.scrollTo({ top: document.getElementById('appts-list').offsetTop - 80, behavior: 'smooth' }) });
    }
    // ensure appointments render on load if present
    renderAppointments();

    // REVIEWS
    const reviewForm = document.getElementById('review-form');
    const reviewsList = document.getElementById('reviews-list');
    const reviewsPager = document.getElementById('reviews-pager');
    const interactiveStars = document.getElementById('interactive-stars');
    const avgRatingEl = document.getElementById('avg-rating');

    // reviews pagination settings
    const REVIEWS_PER_PAGE = 3;
    function computeAvg(list) {
        if (list.length === 0) return 0;
        return (list.reduce((s, r) => s + r.rating, 0) / list.length);
    }

    function renderReviews(page = 1) {
        const stored = JSON.parse(localStorage.getItem('reviews') || '[]');
        const list = (stored && stored.length) ? stored : defaultReviews;
        if (!reviewsList) return;
        if (list.length === 0) { reviewsList.innerHTML = '<p>No reviews yet — be the first to leave one!</p>'; avgRatingEl.textContent = 'No ratings yet'; reviewsPager.style.display = 'none'; return }
        const avg = computeAvg(list);
        // show stars only: compute rounded average to nearest half-star display (we'll fill full stars)
        const rounded = Math.round(avg);
        const stars = Array.from({ length: 5 }, (_, i) => i < rounded ? '★' : '☆').join('');
        avgRatingEl.innerHTML = `<span class="avg-count">${stars}</span> <span class="muted">${avg.toFixed(1)} / 5 (${list.length})</span>`;

        const totalPages = Math.ceil(list.length / REVIEWS_PER_PAGE);
        page = Math.min(Math.max(1, page), totalPages);
        const start = (page - 1) * REVIEWS_PER_PAGE;
        const slice = list.slice(start, start + REVIEWS_PER_PAGE);

        reviewsList.innerHTML = slice.map(r => {
            // build star spans to inherit consistent CSS color
            const stars = Array.from({ length: 5 }, (_, i) => `<span class="star ${i < r.rating ? 'selected' : ''}">★</span>`).join('');
            // sanitize double-hyphen occurrences in user text
            const safeText = escapeHtml((r.text || '').replace(/--/g, '—'));
            return `
            <div class="review card">
                <p><strong>${escapeHtml(r.name)}</strong> — ${stars}</p>
                <p>${safeText}</p>
                <small class="muted">${new Date(r.created).toLocaleString()}</small>
            </div>
        `
        }).join('');

        // pager
        if (totalPages <= 1) { reviewsPager.style.display = 'none'; return }
        reviewsPager.style.display = 'flex';
        reviewsPager.innerHTML = '';
        const prev = document.createElement('button'); prev.textContent = '‹ Prev'; prev.className = 'pager-btn'; prev.disabled = page === 1;
        prev.addEventListener('click', () => renderReviews(page - 1));
        const next = document.createElement('button'); next.textContent = 'Next ›'; next.className = 'pager-btn'; next.disabled = page === totalPages;
        next.addEventListener('click', () => renderReviews(page + 1));
        const info = document.createElement('div'); info.className = 'muted'; info.textContent = `Page ${page} / ${totalPages}`;
        reviewsPager.appendChild(prev);
        reviewsPager.appendChild(info);
        reviewsPager.appendChild(next);
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('review-name').value.trim();
            const rating = parseInt(document.getElementById('review-rating').value || '5', 10);
            const text = document.getElementById('review-text').value.trim();
            const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
            const entry = { name, rating, text, created: new Date().toISOString() };
            reviews.unshift(entry);
            localStorage.setItem('reviews', JSON.stringify(reviews));
            reviewForm.reset();
            renderReviews(1);
        });
    }

    // interactive stars: clicking will set the rating select in the form
    function wireInteractiveStars(el) {
        if (!el) return;
        el.querySelectorAll('.star').forEach(s => {
            s.style.cursor = 'pointer';
            s.addEventListener('click', function () {
                const v = parseInt(this.dataset.value, 10);
                const sel = document.getElementById('review-rating');
                if (sel) sel.value = v;
                // update visuals
                el.querySelectorAll('.star').forEach(st => st.classList.toggle('selected', parseInt(st.dataset.value, 10) <= v));
            });
            s.addEventListener('mouseenter', function () {
                const v = parseInt(this.dataset.value, 10);
                el.querySelectorAll('.star').forEach(st => st.classList.toggle('hover', parseInt(st.dataset.value, 10) <= v));
            });
            s.addEventListener('mouseleave', function () {
                el.querySelectorAll('.star').forEach(st => st.classList.remove('hover'));
            });
        });
    }
    wireInteractiveStars(interactiveStars);

    renderReviews(1);

    // FAQ accordion
    // make accordion keyboard accessible and allow toggling
    document.querySelectorAll('.accordion .accordion-item').forEach(btn => {
        btn.setAttribute('tabindex', '0');
        btn.addEventListener('click', function () {
            const panel = this.nextElementSibling;
            const isOpen = panel.classList.contains('open');
            // toggle only this panel (keep others as-is)
            panel.classList.toggle('open', !isOpen);
        });
        btn.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
        });
    });

    // Collapse/Expand All toggle
    const accToggle = document.getElementById('accordion-toggle');
    if (accToggle) {
        accToggle.addEventListener('click', function () {
            const panels = document.querySelectorAll('.accordion .panel');
            const anyOpen = Array.from(panels).some(p => p.classList.contains('open'));
            panels.forEach(p => p.classList.toggle('open', !anyOpen));
            accToggle.textContent = anyOpen ? 'Expand All' : 'Collapse All';
        });
    }

    // helper
    function escapeHtml(s) {
        if (!s) return '';
        return s.replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" }[c];
        });
    }
});
