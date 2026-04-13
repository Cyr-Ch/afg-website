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

function getHeader(event, name) {
    if (!event.headers) {
        return undefined;
    }
    return event.headers[name] || event.headers[name.toLowerCase()] || event.headers[name.toUpperCase()];
}

async function githubRequest({ owner, repo, path, token, branch }) {
    const encodedPath = path
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
    const branchQuery = branch ? `?ref=${encodeURIComponent(branch)}` : '';
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}${branchQuery}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub request failed for ${path}: ${errorText}`);
    }

    return response.json();
}

exports.handler = async function handler(event) {
    if (event.httpMethod !== 'GET') {
        return jsonResponse(405, { error: 'Method not allowed. Use GET.' });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const dashboardKey = process.env.ADMIN_DASHBOARD_KEY;

    if (!token || !owner || !repo) {
        return jsonResponse(500, {
            error: 'Server is missing repository configuration. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO.'
        });
    }

    if (!dashboardKey) {
        return jsonResponse(500, {
            error: 'Admin dashboard key is not configured. Set ADMIN_DASHBOARD_KEY.'
        });
    }

    const providedKey = String(getHeader(event, 'x-admin-key') || '').trim();
    if (!providedKey || providedKey !== dashboardKey) {
        return jsonResponse(401, { error: 'Unauthorized: invalid admin key.' });
    }

    const params = new URLSearchParams(event.queryStringParameters || {});
    const rawLimit = Number(params.get('limit') || 25);
    const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 25, 1), 100);

    try {
        const entries = await githubRequest({
            owner,
            repo,
            path: 'applications/submissions',
            token,
            branch
        });

        const files = Array.isArray(entries)
            ? entries
                .filter(entry => entry.type === 'file' && entry.name.endsWith('.json'))
                .sort((a, b) => b.name.localeCompare(a.name))
                .slice(0, limit)
            : [];

        const applications = await Promise.all(files.map(async file => {
            const fileData = await githubRequest({
                owner,
                repo,
                path: file.path,
                token,
                branch
            });
            const rawContent = Buffer.from(fileData.content || '', 'base64').toString('utf8');
            const parsed = JSON.parse(rawContent);
            return {
                ...parsed,
                recordPath: file.path
            };
        }));

        return jsonResponse(200, {
            count: applications.length,
            applications
        });
    } catch (error) {
        return jsonResponse(500, { error: error.message });
    }
};
