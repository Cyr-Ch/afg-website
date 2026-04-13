function getCorsHeaders(request, env) {
    const allowedOrigin = (env.ALLOWED_ORIGIN || '*').trim();
    const requestOrigin = request.headers.get('Origin') || '';
    const origin = allowedOrigin === '*' ? '*' : (requestOrigin === allowedOrigin ? requestOrigin : '');
    return {
        'Access-Control-Allow-Origin': origin || allowedOrigin,
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,x-admin-key'
    };
}

function jsonResponse(request, env, status, body) {
    const headers = getCorsHeaders(request, env);
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...headers,
            'Content-Type': 'application/json'
        }
    });
}

function sanitizeName(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'applicant';
}

function sanitizeFileName(fileName) {
    return String(fileName || 'cv.pdf')
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function countWords(text) {
    return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function normalizeBase64(base64Value) {
    return String(base64Value || '').replace(/\s+/g, '');
}

function encodeUtf8ToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decodeBase64ToUtf8(base64Value) {
    const binary = atob(normalizeBase64(base64Value));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
}

function validateSubmitPayload(payload) {
    const requiredFields = ['name', 'surname', 'birthDate', 'gender', 'email', 'motivation', 'aiInterest', 'communityContribution'];
    for (const field of requiredFields) {
        if (!String(payload[field] || '').trim()) {
            return `Missing required field: ${field}`;
        }
    }

    if (!payload.cv || !payload.cv.base64 || !payload.cv.fileName || payload.cv.mimeType !== 'application/pdf') {
        return 'CV must be provided as a PDF.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        return 'Please provide a valid email address.';
    }

    const longAnswers = ['motivation', 'aiInterest', 'communityContribution'];
    for (const field of longAnswers) {
        if (countWords(payload[field]) < 300) {
            return `Answer for "${field}" must be at least 300 words.`;
        }
    }

    return null;
}

async function githubRequest(env, path, method = 'GET', body) {
    const encodedPath = path
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
    const branch = encodeURIComponent(env.GITHUB_BRANCH || 'main');
    const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodedPath}?ref=${branch}`;

    const response = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'afg-munich-applications-api',
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`GitHub request failed for ${path}: ${text}`);
    }
    return response.json();
}

async function uploadToGithub(env, path, contentBase64, message) {
    const payload = {
        message,
        content: normalizeBase64(contentBase64),
        branch: env.GITHUB_BRANCH || 'main'
    };

    await fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/')}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'afg-munich-applications-api',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(async response => {
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`GitHub upload failed for ${path}: ${text}`);
        }
    });
}

async function handleSubmit(request, env) {
    let payload;
    try {
        payload = await request.json();
    } catch (_error) {
        return jsonResponse(request, env, 400, { error: 'Invalid JSON body.' });
    }

    const validationError = validateSubmitPayload(payload);
    if (validationError) {
        return jsonResponse(request, env, 400, { error: validationError });
    }

    const applicantSlug = `${sanitizeName(payload.name)}-${sanitizeName(payload.surname)}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uniqueId = `${timestamp}-${Math.random().toString(36).slice(2, 8)}`;

    const safeCvFileName = sanitizeFileName(payload.cv.fileName);
    const pdfPath = `applications/cv/${uniqueId}-${safeCvFileName}`;
    const applicationPath = `applications/submissions/${uniqueId}-${applicantSlug}.json`;

    const applicationRecord = {
        submittedAt: new Date().toISOString(),
        applicant: {
            name: payload.name,
            surname: payload.surname,
            birthDate: payload.birthDate,
            gender: payload.gender,
            email: payload.email
        },
        answers: {
            motivation: payload.motivation,
            aiInterest: payload.aiInterest,
            communityContribution: payload.communityContribution
        },
        assets: {
            cvFile: pdfPath
        }
    };

    try {
        await uploadToGithub(
            env,
            pdfPath,
            payload.cv.base64,
            `Store Munich hub CV for ${payload.name} ${payload.surname}`
        );
        await uploadToGithub(
            env,
            applicationPath,
            encodeUtf8ToBase64(JSON.stringify(applicationRecord, null, 2)),
            `Store Munich hub application for ${payload.name} ${payload.surname}`
        );
    } catch (error) {
        return jsonResponse(request, env, 500, { error: error.message });
    }

    return jsonResponse(request, env, 200, {
        ok: true,
        message: 'Application stored successfully.',
        applicationPath
    });
}

async function handleListApplications(request, env) {
    const providedAdminKey = String(request.headers.get('x-admin-key') || '').trim();
    if (!providedAdminKey || providedAdminKey !== env.ADMIN_DASHBOARD_KEY) {
        return jsonResponse(request, env, 401, { error: 'Unauthorized: invalid admin key.' });
    }

    const url = new URL(request.url);
    const rawLimit = Number(url.searchParams.get('limit') || 25);
    const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 25, 1), 100);

    try {
        const entries = await githubRequest(env, 'applications/submissions', 'GET');
        const files = Array.isArray(entries)
            ? entries
                .filter(entry => entry.type === 'file' && entry.name.endsWith('.json'))
                .sort((a, b) => b.name.localeCompare(a.name))
                .slice(0, limit)
            : [];

        const applications = await Promise.all(files.map(async file => {
            const fileData = await githubRequest(env, file.path, 'GET');
            const rawContent = decodeBase64ToUtf8(fileData.content || '');
            const parsed = JSON.parse(rawContent);
            return {
                ...parsed,
                recordPath: file.path
            };
        }));

        return jsonResponse(request, env, 200, {
            count: applications.length,
            applications
        });
    } catch (error) {
        return jsonResponse(request, env, 500, { error: error.message });
    }
}

export default {
    async fetch(request, env) {
        const corsHeaders = getCorsHeaders(request, env);
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
            return jsonResponse(request, env, 500, {
                error: 'Server is missing repository configuration. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO.'
            });
        }

        if (!env.ADMIN_DASHBOARD_KEY) {
            return jsonResponse(request, env, 500, {
                error: 'Admin dashboard key is not configured. Set ADMIN_DASHBOARD_KEY.'
            });
        }

        const url = new URL(request.url);

        if (request.method === 'POST' && url.pathname === '/submit-application') {
            return handleSubmit(request, env);
        }

        if (request.method === 'GET' && url.pathname === '/list-applications') {
            return handleListApplications(request, env);
        }

        return jsonResponse(request, env, 404, { error: 'Not found.' });
    }
};
