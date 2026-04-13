const GITHUB_API_BASE = 'https://api.github.com';

function jsonResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}

function countWords(text) {
    return String(text || '').trim().split(/\s+/).filter(Boolean).length;
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

function validatePayload(payload) {
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

async function uploadFileToGitHub({ owner, repo, branch, token, path, contentBase64, message }) {
    const encodedPath = path
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message,
            content: contentBase64,
            branch
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub upload failed for ${path}: ${errorText}`);
    }
}

exports.handler = async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed. Use POST.' });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';

    if (!token || !owner || !repo) {
        return jsonResponse(500, {
            error: 'Server is missing repository configuration. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO.'
        });
    }

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (_error) {
        return jsonResponse(400, { error: 'Invalid JSON body.' });
    }

    const validationError = validatePayload(payload);
    if (validationError) {
        return jsonResponse(400, { error: validationError });
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
        await uploadFileToGitHub({
            owner,
            repo,
            branch,
            token,
            path: pdfPath,
            contentBase64: payload.cv.base64,
            message: `Store Munich hub CV for ${payload.name} ${payload.surname}`
        });

        await uploadFileToGitHub({
            owner,
            repo,
            branch,
            token,
            path: applicationPath,
            contentBase64: Buffer.from(JSON.stringify(applicationRecord, null, 2), 'utf8').toString('base64'),
            message: `Store Munich hub application for ${payload.name} ${payload.surname}`
        });
    } catch (error) {
        return jsonResponse(500, { error: error.message });
    }

    return jsonResponse(200, {
        ok: true,
        message: 'Application stored successfully.',
        applicationPath
    });
};
