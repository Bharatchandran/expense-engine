document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('emi-form');
    const principalInput = document.getElementById('principal');
    const interestInput = document.getElementById('interestRate');
    const tenureInput = document.getElementById('tenure');
    const previewEmi = document.getElementById('preview-emi');
    const emiListContainer = document.getElementById('emi-list');
    const loadingModal = document.getElementById('loading-modal');

    // Batch Pay Elements
    const batchPayModal = document.getElementById('batch-pay-modal');
    const openBatchModalBtn = document.getElementById('open-batch-modal-btn');
    const closeBatchModalBtn = document.getElementById('close-batch-modal');
    const cancelBatchBtn = document.getElementById('cancel-batch-btn');
    const confirmBatchBtn = document.getElementById('confirm-batch-btn');
    const selectAllEmis = document.getElementById('select-all-emis');
    const batchPayTbody = document.getElementById('batch-pay-tbody');

    // Tracking Toggle
    const trackingRadios = document.getElementsByName('trackingMethod');
    const startDateGroup = document.getElementById('startDateGroup');
    const completedMonthsGroup = document.getElementById('completedMonthsGroup');
    const startDateInput = document.getElementById('startDate');
    const completedMonthsInput = document.getElementById('completedMonths');

    // Stats Elements
    const totalMonthlyEmiEl = document.getElementById('total-monthly-emi');
    const totalPrincipalEl = document.getElementById('total-principal');
    const activeLoansCountEl = document.getElementById('active-loans-count');

    // State
    let emis = [];
    const API_URL = '/api/emis';

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Live preview calculation function
    const calculatePreview = () => {
        const p = parseFloat(principalInput.value) || 0;
        const rateYearly = parseFloat(interestInput.value) || 0;
        const n = parseInt(tenureInput.value) || 0;

        if (p > 0 && rateYearly > 0 && n > 0) {
            const r = (rateYearly / 12) / 100;
            const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            previewEmi.textContent = `${formatCurrency(emi)} / mo`;
        } else {
            previewEmi.textContent = '₹0 / mo';
        }
    };

    // Listeners for live preview
    ['input', 'change'].forEach(evt => {
        principalInput.addEventListener(evt, calculatePreview);
        interestInput.addEventListener(evt, calculatePreview);
        tenureInput.addEventListener(evt, calculatePreview);
    });

    // Calculate on initial load
    calculatePreview();

    // Toggle Tracking Method UI
    trackingRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'date') {
                startDateGroup.style.display = 'flex';
                completedMonthsGroup.style.display = 'none';
                startDateInput.required = true;
                completedMonthsInput.required = false;
            } else {
                startDateGroup.style.display = 'none';
                completedMonthsGroup.style.display = 'flex';
                startDateInput.required = false;
                completedMonthsInput.required = true;
            }
        });
    });

    // Subroutine to calculate remaining balance (for fallback usage)
    const calculateFallbackMetrics = (emi) => {
        let completed = 0;
        if (emi.explicitCompletedMonths != null) {
            completed = emi.explicitCompletedMonths;
        } else if (emi.startDate) {
            const start = new Date(emi.startDate);
            const now = new Date();
            let months = (now.getFullYear() - start.getFullYear()) * 12;
            months -= start.getMonth();
            months += now.getMonth();
            completed = months > 0 ? months : 0;
        }

        if (completed > emi.tenureMonths) completed = emi.tenureMonths;

        emi.calculatedCompletedMonths = completed;
        emi.remainingMonths = emi.tenureMonths - completed;

        const r = (emi.interestRate / 12) / 100;
        const p = emi.principal;
        const n = emi.tenureMonths;

        emi.monthlyEmi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

        const rn = Math.pow(1 + r, n);
        const rp = Math.pow(1 + r, completed);
        let remainingBal = p * (rn - rp) / (rn - 1);
        if (remainingBal < 0) remainingBal = 0;

        emi.remainingPrincipal = remainingBal;
        emi.totalAmountPaid = completed * emi.monthlyEmi;
    };

    // Show loading spinner
    const setLoading = (isLoading) => {
        if (isLoading) {
            loadingModal.classList.add('active');
        } else {
            loadingModal.classList.remove('active');
        }
    };

    // Update Dashboard UI
    const updateDashboard = () => {
        let totalMonthly = 0;
        let totalPrincipal = 0;

        emis.forEach(emi => {
            // Ensure fallback calculations are present if missing
            if (emi.remainingPrincipal === undefined) {
                calculateFallbackMetrics(emi);
            }
            totalMonthly += (emi.monthlyEmi || 0);
            totalPrincipal += (emi.remainingPrincipal || 0);
        });

        totalMonthlyEmiEl.textContent = formatCurrency(totalMonthly);
        totalPrincipalEl.textContent = formatCurrency(totalPrincipal);
        activeLoansCountEl.textContent = emis.length;

        renderEmiList();
    };

    // Render EMI List
    const renderEmiList = () => {
        if (emis.length === 0) {
            emiListContainer.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <p>No active loans. Add a new EMI to get started.</p>
                </div>
            `;
            return;
        }

        emiListContainer.innerHTML = '';
        emis.forEach(emi => {
            const dateStr = emi.startDate ? new Date(emi.startDate).toLocaleDateString() : 'Manual';
            const progressPercent = Math.min(100, (emi.calculatedCompletedMonths / emi.tenureMonths) * 100);

            const card = document.createElement('div');
            card.className = 'emi-card';
            card.innerHTML = `
                <div class="emi-main-info">
                    <h4>${emi.name}</h4>
                    <p>${emi.startDate ? 'Started: ' + dateStr : 'Paid so far: ' + formatCurrency(emi.totalAmountPaid)}</p>
                </div>
                <div class="emi-stat">
                    <span class="label">Remaining</span>
                    <span class="value">${formatCurrency(emi.remainingPrincipal)}</span>
                </div>
                <div class="emi-stat">
                    <span class="label">Monthly EMI</span>
                    <span class="value highlight">${formatCurrency(emi.monthlyEmi)}</span>
                </div>
                <div class="emi-actions">
                    <button class="btn-icon pay-btn" data-id="${emi.id}" title="Mark 1 Month Paid">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </button>
                    <button class="btn-icon delete-btn" data-id="${emi.id}" title="Delete">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
                <div class="emi-progress-container">
                    <div class="progress-header">
                        <span>${emi.calculatedCompletedMonths} completed</span>
                        <span>${emi.remainingMonths} months left</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
    `;

            // Add listeners
            const deleteBtn = card.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteEmi(emi.id));

            const payBtn = card.querySelector('.pay-btn');
            payBtn.addEventListener('click', () => payEmi(emi.id));

            emiListContainer.appendChild(card);
        });
    };

    // API Calls
    const fetchEmis = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                emis = await res.json();
                updateDashboard();
            } else {
                console.error("Failed to fetch. Server might be down. Using local data if available.");
                // Fallback to local storage for demo if server fails
                const localData = localStorage.getItem('demo_emis');
                if (localData) {
                    emis = JSON.parse(localData);
                    updateDashboard();
                }
            }
        } catch (error) {
            console.error('Error fetching EMIs:', error);
            // Fallback for static browser demonstration without java backend running
            const localData = localStorage.getItem('demo_emis');
            if (localData) {
                emis = JSON.parse(localData);
                updateDashboard();
            } else {
                // Pre-populate with a demo item if nothing exists
                emis = [{
                    id: 1,
                    name: "Demo Car Loan (Backend offline)",
                    principal: 800000,
                    interestRate: 8.5,
                    tenureMonths: 60,
                    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString()
                }];
                updateDashboard();
            }
        } finally {
            setLoading(false);
        }
    };

    const addEmi = async (emiData) => {
        setLoading(true);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emiData)
            });

            if (res.ok) {
                const newEmi = await res.json();
                emis.push(newEmi);
                updateDashboard();
            } else {
                throw new Error("Server error");
            }
        } catch (error) {
            console.error('Error adding EMI:', error);
            // Fallback for demo when backend is offline
            emiData.id = Date.now();

            // Calc manually for the fallback
            calculateFallbackMetrics(emiData);

            emis.push(emiData);
            localStorage.setItem('demo_emis', JSON.stringify(emis));
            updateDashboard();

            alert("Saved locally since backend is unreachable.");
        } finally {
            setLoading(false);
            form.reset();
            previewEmi.textContent = '₹0.00 / mo';
        }
    };

    const deleteEmi = async (id) => {
        if (!confirm('Are you sure you want to delete this EMI?')) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                emis = emis.filter(e => e.id !== id);
                updateDashboard();
            } else {
                throw new Error("Server error");
            }
        } catch (error) {
            console.error('Error deleting EMI:', error);
            // Fallback
            emis = emis.filter(e => e.id !== id);
            localStorage.setItem('demo_emis', JSON.stringify(emis));
            updateDashboard();
        } finally {
            setLoading(false);
        }
    };

    const payEmi = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/${id}/pay`, { method: 'POST' });
            if (res.ok) {
                const updatedEmi = await res.json();
                emis = emis.map(e => e.id === id ? updatedEmi : e);
                updateDashboard();
            } else {
                throw new Error("Server error");
            }
        } catch (error) {
            console.error('Error paying EMI:', error);
            // Fallback
            const emi = emis.find(e => e.id === id);
            if (emi && emi.calculatedCompletedMonths < emi.tenureMonths) {
                emi.explicitCompletedMonths = emi.calculatedCompletedMonths + 1;
                calculateFallbackMetrics(emi);
                localStorage.setItem('demo_emis', JSON.stringify(emis));
                updateDashboard();
            }
        } finally {
            setLoading(false);
        }
    };

    const payBulk = async (ids) => {
        if (!ids || ids.length === 0) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/pay-bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ids)
            });
            if (res.ok) {
                await fetchEmis();
            } else {
                throw new Error("Server error");
            }
        } catch (error) {
            console.error('Error bulk paying:', error);
            // Fallback
            ids.forEach(id => {
                const emi = emis.find(e => e.id === id);
                if (emi && emi.calculatedCompletedMonths < emi.tenureMonths) {
                    emi.explicitCompletedMonths = emi.calculatedCompletedMonths + 1;
                    calculateFallbackMetrics(emi);
                }
            });
            localStorage.setItem('demo_emis', JSON.stringify(emis));
            updateDashboard();
        } finally {
            setLoading(false);
        }
    };

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const method = document.querySelector('input[name="trackingMethod"]:checked').value;
        const newEmi = {
            name: document.getElementById('loanName').value,
            principal: parseFloat(document.getElementById('principal').value),
            interestRate: parseFloat(document.getElementById('interestRate').value),
            tenureMonths: parseInt(document.getElementById('tenure').value)
        };

        if (method === 'date') {
            newEmi.startDate = document.getElementById('startDate').value;
        } else {
            newEmi.explicitCompletedMonths = parseInt(document.getElementById('completedMonths').value) || 0;
        }

        addEmi(newEmi);
    });

    // Batch Pay Modal Logic
    const renderBatchModalList = () => {
        batchPayTbody.innerHTML = '';
        emis.forEach(emi => {
            if (emi.calculatedCompletedMonths >= emi.tenureMonths) return; // skip completed

            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
            tr.innerHTML = `
                <td style="padding: 0.75rem;"><input type="checkbox" class="batch-checkbox" data-id="${emi.id}"></td>
                <td style="padding: 0.75rem;">${emi.name}</td>
                <td style="padding: 0.75rem; color: #a78bfa;">${formatCurrency(emi.monthlyEmi)}</td>
                <td style="padding: 0.75rem;">${emi.remainingMonths} mo left</td>
            `;
            batchPayTbody.appendChild(tr);
        });

        const updateBatchSelection = () => {
            const allBoxes = document.querySelectorAll('.batch-checkbox');
            const checked = document.querySelectorAll('.batch-checkbox:checked');
            confirmBatchBtn.textContent = `Pay Selected (${checked.length})`;
            confirmBatchBtn.disabled = checked.length === 0;
            selectAllEmis.checked = checked.length > 0 && checked.length === allBoxes.length;
        };

        const checkboxes = document.querySelectorAll('.batch-checkbox');
        checkboxes.forEach(cb => cb.addEventListener('change', updateBatchSelection));

        selectAllEmis.onchange = (e) => {
            checkboxes.forEach(cb => cb.checked = e.target.checked);
            updateBatchSelection();
        };

        updateBatchSelection();
    };

    if (openBatchModalBtn) {
        openBatchModalBtn.addEventListener('click', () => {
            renderBatchModalList();
            batchPayModal.classList.add('active');
        });
    }

    const closeBatchModal = () => {
        batchPayModal.classList.remove('active');
    };

    if (closeBatchModalBtn) closeBatchModalBtn.addEventListener('click', closeBatchModal);
    if (cancelBatchBtn) cancelBatchBtn.addEventListener('click', closeBatchModal);

    if (confirmBatchBtn) {
        confirmBatchBtn.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.batch-checkbox:checked');
            const ids = Array.from(checkboxes).map(cb => {
                const val = cb.getAttribute('data-id');
                return val.length > 10 ? parseInt(val) : parseFloat(val);
            });
            if (ids.length > 0) {
                payBulk(ids);
                closeBatchModal();
            }
        });
    }

    // Init
    fetchEmis();
});
