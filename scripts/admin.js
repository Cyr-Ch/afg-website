document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('admin-auth-form');
    const adminKeyInput = document.getElementById('admin-key');
    const authCard = document.getElementById('auth-card');
    const dashboardCard = document.getElementById('dashboard-card');
    const refreshButton = document.getElementById('refresh-applications');
    const statusElement = document.getElementById('admin-status');
    const listElement = document.getElementById('applications-list');

    const KEY_STORAGE = 'munichHubAdminKey';

    function getApiBaseUrl() {
        const configuredUrl = window.APP_CONFIG && window.APP_CONFIG.apiBaseUrl
            ? String(window.APP_CONFIG.apiBaseUrl).trim()
            : '';
        if (!configuredUrl || configuredUrl.includes('YOUR-WORKER-SUBDOMAIN')) {
            return '';
        }
        return configuredUrl.replace(/\/+$/, '');
    }

    function showStatus(type, message) {
        statusElement.className = 'admin-status';
        statusElement.textContent = message;
        statusElement.classList.add(type);
    }

    function clearStatus() {
        statusElement.className = 'admin-status';
        statusElement.textContent = '';
    }

    function formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value || '-';
        }
        return date.toLocaleString();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderApplications(applications) {
        if (!Array.isArray(applications) || applications.length === 0) {
            listElement.innerHTML = '<p class="admin-text">No applications found yet.</p>';
            return;
        }

        listElement.innerHTML = applications.map(application => {
            const applicant = application.applicant || {};
            const answers = application.answers || {};
            const title = `${applicant.name || 'Unknown'} ${applicant.surname || ''}`.trim();
            return `
                <details class="application-item">
                    <summary>
                        <span>${escapeHtml(title || 'Unknown Applicant')}</span>
                        <span>${escapeHtml(formatDate(application.submittedAt || ''))}</span>
                    </summary>
                    <div class="application-meta">
                        <p><strong>Email:</strong> ${escapeHtml(applicant.email || '-')}</p>
                        <p><strong>Birth Date:</strong> ${escapeHtml(applicant.birthDate || '-')}</p>
                        <p><strong>Gender:</strong> ${escapeHtml(applicant.gender || '-')}</p>
                        <p><strong>Record:</strong> ${escapeHtml(application.recordPath || '-')}</p>
                    </div>
                    <div class="application-answer">
                        <h4>Why are you interested in joining the Young AI Leaders Community?</h4>
                        <p>${escapeHtml(answers.motivation || '-')}</p>
                    </div>
                    <div class="application-answer">
                        <h4>What area of AI interests you, and why?</h4>
                        <p>${escapeHtml(answers.aiInterest || '-')}</p>
                    </div>
                    <div class="application-answer">
                        <h4>What can you bring to the community?</h4>
                        <p>${escapeHtml(answers.communityContribution || '-')}</p>
                    </div>
                    <p class="application-cv-link"><strong>CV path:</strong> ${escapeHtml((application.assets || {}).cvFile || '-')}</p>
                </details>
            `;
        }).join('');
    }

    async function fetchApplications(adminKey) {
        const apiBaseUrl = getApiBaseUrl();
        if (!apiBaseUrl) {
            throw new Error('API endpoint is not configured. Set scripts/config.js to your Cloudflare Worker URL.');
        }
        showStatus('info', 'Loading applications...');
        listElement.innerHTML = '';

        const response = await fetch(`${apiBaseUrl}/list-applications?limit=50`, {
            method: 'GET',
            headers: {
                'x-admin-key': adminKey
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Could not load applications.');
        }

        renderApplications(result.applications || []);
        showStatus('info', `Loaded ${result.count || 0} application(s).`);
    }

    async function unlockDashboard(adminKey) {
        try {
            await fetchApplications(adminKey);
            sessionStorage.setItem(KEY_STORAGE, adminKey);
            authCard.classList.add('hidden');
            dashboardCard.classList.remove('hidden');
            clearStatus();
        } catch (error) {
            showStatus('error', error.message);
        }
    }

    authForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const adminKey = adminKeyInput.value.trim();
        if (!adminKey) {
            showStatus('error', 'Please provide an admin key.');
            return;
        }
        await unlockDashboard(adminKey);
    });

    refreshButton.addEventListener('click', async function() {
        const adminKey = sessionStorage.getItem(KEY_STORAGE);
        if (!adminKey) {
            showStatus('error', 'Session expired. Please unlock the dashboard again.');
            dashboardCard.classList.add('hidden');
            authCard.classList.remove('hidden');
            return;
        }
        try {
            await fetchApplications(adminKey);
        } catch (error) {
            showStatus('error', error.message);
        }
    });

    const savedKey = sessionStorage.getItem(KEY_STORAGE);
    if (savedKey) {
        unlockDashboard(savedKey);
    }
});
