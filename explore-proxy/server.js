const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 3010;
const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const MODEL_NAME = 'doubao-seedream-5-0-260128';
const SITE_BASE_URL = process.env.SITE_BASE_URL || 'https://jeremykong.club';
const DOUYIN_CLIENT_KEY = process.env.DOUYIN_CLIENT_KEY || '';
const DOUYIN_CLIENT_SECRET = process.env.DOUYIN_CLIENT_SECRET || '';
const DOUYIN_REDIRECT_URI = process.env.DOUYIN_REDIRECT_URI || `${SITE_BASE_URL}/hepai/api/douyin/callback`;
const DOUYIN_SCOPE = process.env.DOUYIN_SCOPE || 'user_info';
const MYSQL_HOST = process.env.MYSQL_HOST || '127.0.0.1';
const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3306);
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'hepai';
const SESSION_COOKIE = 'hepai_sid';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const ADVANCED_GENERATION_WHITELIST = new Set([
    '_000gDJCJvtlSHn_VVsJMX2fzfsj3h52zLKV'
]);

const uploadsRoot = path.join(__dirname, 'uploads');
const originalUploadsDir = path.join(uploadsRoot, 'original');
const generatedUploadsDir = path.join(uploadsRoot, 'generated');

const sessionStore = new Map();
const oauthStateStore = new Map();

const DOUYIN_AUTHORIZE_URL = 'https://open.douyin.com/platform/oauth/connect/';
const DOUYIN_TOKEN_URL = 'https://open.douyin.com/oauth/access_token/';
const DOUYIN_REFRESH_URL = 'https://open.douyin.com/oauth/renew_refresh_token/';
const DOUYIN_USERINFO_URL = 'https://open.douyin.com/oauth/userinfo/';

const pool = mysql.createPool({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    charset: 'utf8mb4'
});

function nowSql() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function randomId() {
    return crypto.randomBytes(24).toString('hex');
}

function parseCookies(req) {
    const cookieHeader = req.headers.cookie || '';
    return cookieHeader.split(';').reduce((acc, chunk) => {
        const [rawKey, ...rest] = chunk.trim().split('=');
        if (!rawKey) {
            return acc;
        }
        acc[rawKey] = decodeURIComponent(rest.join('='));
        return acc;
    }, {});
}

function parseUrl(req) {
    return new URL(req.url, 'http://localhost');
}

function formEncode(payload) {
    return new URLSearchParams(payload).toString();
}

function sendRedirect(res, location, extraHeaders = {}) {
    res.writeHead(302, {
        Location: location,
        ...extraHeaders
    });
    res.end();
}

function getMimeExtension(mimeType) {
    if (mimeType === 'image/jpeg') return 'jpg';
    if (mimeType === 'image/webp') return 'webp';
    return 'png';
}

function dataUrlToBuffer(dataUrl) {
    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || '');
    if (!match) {
        throw new Error('图片数据格式不正确');
    }

    return {
        mimeType: match[1],
        buffer: Buffer.from(match[2], 'base64')
    };
}

function publicFileUrl(relativePath) {
    return `${SITE_BASE_URL}/hepai/api/files/${relativePath.replace(/\\/g, '/')}`;
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': SITE_BASE_URL,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        ...extraHeaders
    });
    res.end(JSON.stringify(payload));
}

async function readRequestBody(req) {
    return new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', (chunk) => {
            raw += chunk;
            if (raw.length > 20 * 1024 * 1024) {
                reject(new Error('请求体过大'));
                req.destroy();
            }
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(raw || '{}'));
            } catch (error) {
                reject(new Error('请求格式不是合法 JSON'));
            }
        });
        req.on('error', reject);
    });
}

async function ensureSetup() {
    await fsp.mkdir(originalUploadsDir, { recursive: true });
    await fsp.mkdir(generatedUploadsDir, { recursive: true });

    await pool.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS hepai_user (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            douyin_openid VARCHAR(128) NOT NULL,
            douyin_token_info JSON NOT NULL,
            token_expires_at DATETIME NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uniq_openid (douyin_openid)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS hepai_user_image (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NOT NULL,
            photo_url VARCHAR(255) NOT NULL,
            generated_image_url VARCHAR(255) DEFAULT NULL,
            kong_style VARCHAR(64) DEFAULT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uniq_user_once (user_id),
            CONSTRAINT fk_hepai_user_image_user FOREIGN KEY (user_id) REFERENCES hepai_user(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
}

function getSession(req) {
    const cookies = parseCookies(req);
    const sid = cookies[SESSION_COOKIE];
    if (!sid || !sessionStore.has(sid)) {
        return null;
    }

    const session = sessionStore.get(sid);
    if (Date.now() > session.expiresAt) {
        sessionStore.delete(sid);
        return null;
    }

    session.expiresAt = Date.now() + SESSION_TTL_MS;
    return { sid, ...session };
}

function createSession(userId) {
    const sid = randomId();
    sessionStore.set(sid, {
        userId,
        expiresAt: Date.now() + SESSION_TTL_MS
    });
    return sid;
}

async function getUserById(userId) {
    const [rows] = await pool.query('SELECT * FROM hepai_user WHERE id = ?', [userId]);
    return rows[0] || null;
}

async function upsertDouyinUser(openId, tokenInfo) {
    const timestamp = nowSql();
    const expiresAt = new Date(Date.now() + (Number(tokenInfo.expires_in || 0) * 1000 || TOKEN_TTL_MS)).toISOString().slice(0, 19).replace('T', ' ');

    await pool.query(
        `INSERT INTO hepai_user (douyin_openid, douyin_token_info, token_expires_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE douyin_token_info = VALUES(douyin_token_info), token_expires_at = VALUES(token_expires_at), updated_at = VALUES(updated_at)`,
        [openId, JSON.stringify(tokenInfo), expiresAt, timestamp, timestamp]
    );

    const [rows] = await pool.query('SELECT * FROM hepai_user WHERE douyin_openid = ?', [openId]);
    return rows[0] || null;
}

async function requestDouyinToken(code) {
    const response = await fetch(DOUYIN_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formEncode({
            client_key: DOUYIN_CLIENT_KEY,
            client_secret: DOUYIN_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code'
        })
    });

    const data = await response.json().catch(() => ({}));
    console.log('Douyin token response:', JSON.stringify(data));
    if (!response.ok || (data.message && data.message !== 'success')) {
        throw new Error((data.data && data.data.description) || data.description || data.message || '抖音 token 获取失败');
    }

    return data.data || {};
}

async function requestDouyinUserInfo(accessToken, openId) {
    const response = await fetch(DOUYIN_USERINFO_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formEncode({
            access_token: accessToken,
            open_id: openId
        })
    });

    const data = await response.json().catch(() => ({}));
    console.log('Douyin userinfo response:', JSON.stringify(data));
    if (!response.ok || (typeof data.err_no !== 'undefined' && Number(data.err_no) !== 0)) {
        throw new Error((data.data && data.data.description) || data.err_msg || '抖音用户信息获取失败');
    }

    return data.data || {};
}

async function getUserImage(userId) {
    const [rows] = await pool.query('SELECT * FROM hepai_user_image WHERE user_id = ?', [userId]);
    return rows[0] || null;
}

function isAdvancedGenerationWhitelisted(user) {
    return Boolean(user && ADVANCED_GENERATION_WHITELIST.has(user.douyin_openid));
}

async function getAuthedUser(req) {
    const session = getSession(req);
    if (!session) {
        return null;
    }

    const user = await getUserById(session.userId);
    if (!user) {
        return null;
    }

    if (new Date(user.token_expires_at).getTime() < Date.now()) {
        return null;
    }

    return user;
}

async function handleSession(req, res) {
    const user = await getAuthedUser(req);
    if (!user) {
        sendJson(res, 200, { loggedIn: false });
        return;
    }

    const imageRecord = isAdvancedGenerationWhitelisted(user) ? null : await getUserImage(user.id);
    const tokenInfo = typeof user.douyin_token_info === 'string'
        ? JSON.parse(user.douyin_token_info)
        : user.douyin_token_info;
    sendJson(res, 200, {
        loggedIn: true,
        user: {
            id: user.id,
            openId: user.douyin_openid,
            nickname: tokenInfo.nickname,
            avatar: tokenInfo.avatar
        },
        advancedUsed: Boolean(imageRecord && imageRecord.generated_image_url),
        generatedImageUrl: imageRecord ? imageRecord.generated_image_url : null,
        photoUrl: imageRecord ? imageRecord.photo_url : null,
        message: imageRecord && imageRecord.generated_image_url ? '继续探险，可加v<jeremy——kong>' : null
    });
}

async function handleMockLogin(req, res) {
    const body = await readRequestBody(req).catch(() => ({}));
    const openId = body.openId || `mock_douyin_${Date.now()}`;
    const tokenInfo = {
        access_token: randomId(),
        refresh_token: randomId(),
        nickname: body.nickname || `抖音用户${String(Date.now()).slice(-4)}`,
        avatar: body.avatar || 'images/user-avatar.svg'
    };
    const createdAt = nowSql();
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString().slice(0, 19).replace('T', ' ');

    await pool.query(
        `INSERT INTO hepai_user (douyin_openid, douyin_token_info, token_expires_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE douyin_token_info = VALUES(douyin_token_info), token_expires_at = VALUES(token_expires_at), updated_at = VALUES(updated_at)`,
        [openId, JSON.stringify(tokenInfo), expiresAt, createdAt, createdAt]
    );

    const [rows] = await pool.query('SELECT * FROM hepai_user WHERE douyin_openid = ?', [openId]);
    const user = rows[0];
    const sid = createSession(user.id);
    const imageRecord = await getUserImage(user.id);

    sendJson(res, 200, {
        loggedIn: true,
        user: {
            id: user.id,
            openId,
            nickname: tokenInfo.nickname,
            avatar: tokenInfo.avatar
        },
        advancedUsed: Boolean(imageRecord && imageRecord.generated_image_url),
        generatedImageUrl: imageRecord ? imageRecord.generated_image_url : null,
        photoUrl: imageRecord ? imageRecord.photo_url : null,
        message: imageRecord && imageRecord.generated_image_url ? '继续探险，可加v<jeremy——kong>' : null
    }, {
        'Set-Cookie': `${SESSION_COOKIE}=${sid}; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}; Path=/; HttpOnly; SameSite=Lax`
    });
}

function handleDouyinLogin(req, res) {
    if (!DOUYIN_CLIENT_KEY || !DOUYIN_CLIENT_SECRET) {
        sendJson(res, 500, { error: '服务器未配置抖音开放平台凭据' });
        return;
    }

    const state = randomId();
    oauthStateStore.set(state, Date.now() + 1000 * 60 * 10);
    const authorizeUrl = `${DOUYIN_AUTHORIZE_URL}?${formEncode({
        client_key: DOUYIN_CLIENT_KEY,
        response_type: 'code',
        scope: DOUYIN_SCOPE,
        redirect_uri: DOUYIN_REDIRECT_URI,
        state
    })}`;

    sendRedirect(res, authorizeUrl);
}

async function handleDouyinCallback(req, res) {
    const requestUrl = parseUrl(req);
    const code = requestUrl.searchParams.get('code');
    const state = requestUrl.searchParams.get('state');
    const errorCode = requestUrl.searchParams.get('error_code');

    if (errorCode) {
        sendRedirect(res, `${SITE_BASE_URL}/hepai/?login=failed`);
        return;
    }

    if (!code || !state || !oauthStateStore.has(state)) {
        sendRedirect(res, `${SITE_BASE_URL}/hepai/?login=invalid_state`);
        return;
    }

    oauthStateStore.delete(state);

    try {
        const tokenData = await requestDouyinToken(code);
        const openId = tokenData.open_id;
        const profile = await requestDouyinUserInfo(tokenData.access_token, openId);
        const user = await upsertDouyinUser(openId, {
            ...tokenData,
            nickname: profile.nickname || '抖音用户',
            avatar: profile.avatar || 'images/user-avatar.svg'
        });
        const sid = createSession(user.id);

        sendRedirect(res, `${SITE_BASE_URL}/hepai/?login=success`, {
            'Set-Cookie': `${SESSION_COOKIE}=${sid}; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}; Path=/; HttpOnly; SameSite=Lax`
        });
    } catch (error) {
        console.error('Douyin callback failed:', error);
        sendRedirect(res, `${SITE_BASE_URL}/hepai/?login=failed&reason=${encodeURIComponent(error.message || 'oauth_failed')}`);
    }
}

function clearSession(req, res) {
    const cookies = parseCookies(req);
    const sid = cookies[SESSION_COOKIE];
    if (sid) {
        sessionStore.delete(sid);
    }
    sendJson(res, 200, { ok: true }, {
        'Set-Cookie': `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`
    });
}

async function saveOriginalPhoto(userId, imageDataUrl) {
    const { mimeType, buffer } = dataUrlToBuffer(imageDataUrl);
    const ext = getMimeExtension(mimeType);
    const relativePath = path.posix.join('original', `${userId}-${Date.now()}-${randomId().slice(0, 8)}.${ext}`);
    const absolutePath = path.join(uploadsRoot, relativePath);
    await fsp.writeFile(absolutePath, buffer);
    return publicFileUrl(relativePath);
}

async function downloadToFile(url, targetDir, prefix) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('生成图片下载失败');
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const ext = getMimeExtension(contentType.split(';')[0]);
    const fileName = `${prefix}-${Date.now()}-${randomId().slice(0, 8)}.${ext}`;
    const relativePath = path.posix.join(path.basename(targetDir), fileName);
    const absolutePath = path.join(targetDir, fileName);
    const buffer = Buffer.from(await response.arrayBuffer());
    await fsp.writeFile(absolutePath, buffer);
    return publicFileUrl(relativePath);
}

async function callArk(prompt, image, kongStyle, kongName, userId) {
    const upstreamResponse = await fetch(ARK_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ARK_API_KEY}`
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            prompt,
            image,
            response_format: 'url',
            watermark: false,
            size: '2K',
            output_format: 'png',
            user: `${kongStyle || 'kong'}-${userId}`,
            metadata: {
                kongName: kongName || '',
                kongStyle: kongStyle || '',
                userId: String(userId)
            }
        })
    });

    const upstreamData = await upstreamResponse.json().catch(() => ({}));
    if (!upstreamResponse.ok) {
        throw new Error(upstreamData.error && upstreamData.error.message ? upstreamData.error.message : upstreamData.message || '豆包图片接口调用失败');
    }

    const firstImage = Array.isArray(upstreamData.data) ? upstreamData.data[0] : null;
    if (!firstImage || (!firstImage.url && !firstImage.b64_json)) {
        throw new Error('豆包接口未返回可用图片');
    }

    if (firstImage.url) {
        return {
            imageUrl: firstImage.url,
            imageBase64: null
        };
    }

    const fileName = `${userId}-${Date.now()}-${randomId().slice(0, 8)}.png`;
    const relativePath = path.posix.join('generated', fileName);
    await fsp.writeFile(path.join(uploadsRoot, relativePath), Buffer.from(firstImage.b64_json, 'base64'));
    return {
        imageUrl: publicFileUrl(relativePath),
        imageBase64: firstImage.b64_json
    };
}

async function handleExplore(req, res) {
    if (!ARK_API_KEY) {
        sendJson(res, 500, { error: '服务器未配置 ARK_API_KEY' });
        return;
    }

    const user = await getAuthedUser(req);
    if (!user) {
        sendJson(res, 401, { error: '请先登录抖音账号' });
        return;
    }

    let body;
    try {
        body = await readRequestBody(req);
    } catch (error) {
        sendJson(res, 400, { error: error.message });
        return;
    }

    const { image, prompt, kongStyle, kongName } = body;
    if (!image || !prompt) {
        sendJson(res, 400, { error: '缺少 image 或 prompt' });
        return;
    }

    const whitelistBypass = isAdvancedGenerationWhitelisted(user);
    const existingImage = whitelistBypass ? null : await getUserImage(user.id);
    if (!whitelistBypass && existingImage && existingImage.generated_image_url) {
        sendJson(res, 409, {
            reused: true,
            imageUrl: existingImage.generated_image_url,
            generated_image_url: existingImage.generated_image_url,
            photoUrl: existingImage.photo_url,
            message: '继续冒险，加v<jeremykong----kong>'
        });
        return;
    }

    try {
        const photoUrl = await saveOriginalPhoto(user.id, image);
        const arkResult = await callArk(prompt, image, kongStyle, kongName, user.id);
        const persistedGeneratedUrl = arkResult.imageUrl.startsWith(SITE_BASE_URL)
            ? arkResult.imageUrl
            : await downloadToFile(arkResult.imageUrl, generatedUploadsDir, String(user.id));
        const timestamp = nowSql();

        if (!whitelistBypass) {
            await pool.query(
                `INSERT INTO hepai_user_image (user_id, photo_url, generated_image_url, kong_style, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE photo_url = VALUES(photo_url), generated_image_url = VALUES(generated_image_url), kong_style = VALUES(kong_style), updated_at = VALUES(updated_at)`,
                [user.id, photoUrl, persistedGeneratedUrl, kongStyle || null, timestamp, timestamp]
            );
        }

        sendJson(res, 200, {
            imageUrl: persistedGeneratedUrl,
            generated_image_url: persistedGeneratedUrl,
            photoUrl,
            reused: false,
            whitelisted: whitelistBypass
        });
    } catch (error) {
        sendJson(res, 500, { error: error.message || '服务器调用失败' });
    }
}

async function handleFileServe(req, res) {
    const relative = decodeURIComponent(req.url.replace('/files/', ''));
    const safePath = path.normalize(relative).replace(/^\.\.(\/|\\|$)/, '');
    const filePath = path.join(uploadsRoot, safePath);
    if (!filePath.startsWith(uploadsRoot) || !fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000' });
    fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
    const requestUrl = parseUrl(req);

    if (req.method === 'OPTIONS') {
        sendJson(res, 200, { ok: true });
        return;
    }

    if (requestUrl.pathname === '/session' && req.method === 'GET') {
        await handleSession(req, res);
        return;
    }

    if (requestUrl.pathname === '/mock-login' && req.method === 'POST') {
        await handleMockLogin(req, res);
        return;
    }

    if (requestUrl.pathname === '/douyin/login' && req.method === 'GET') {
        handleDouyinLogin(req, res);
        return;
    }

    if (requestUrl.pathname === '/douyin/callback' && req.method === 'GET') {
        await handleDouyinCallback(req, res);
        return;
    }

    if (requestUrl.pathname === '/logout' && req.method === 'POST') {
        clearSession(req, res);
        return;
    }

    if (requestUrl.pathname === '/explore' && req.method === 'POST') {
        await handleExplore(req, res);
        return;
    }

    if (requestUrl.pathname.startsWith('/files/') && req.method === 'GET') {
        await handleFileServe(req, res);
        return;
    }

    sendJson(res, 404, { error: 'Not found' });
});

ensureSetup()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Explore proxy listening on ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Server bootstrap failed:', error);
        process.exit(1);
    });
