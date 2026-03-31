// 全局状态
let isLoggedIn = false;
let userInfo = null;
let selectedPhoto = null;
let selectedKong = 'astronaut';
let generatedImage = null;
let advancedGeneratedImage = null;
let isAdvancedGenerating = false;

// DOM 元素
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const wechatLoginModal = document.getElementById('wechatLoginModal');
const closeWechatLoginModal = document.getElementById('closeWechatLoginModal');
const openDouyinAppBtn = document.getElementById('openDouyinAppBtn');
const copyOpenLinkBtn = document.getElementById('copyOpenLinkBtn');
const publishGuideModal = document.getElementById('publishGuideModal');
const closePublishGuideModal = document.getElementById('closePublishGuideModal');
const publishOpenDouyinBtn = document.getElementById('publishOpenDouyinBtn');
const publishDownloadBtn = document.getElementById('publishDownloadBtn');
const publishCopyTagBtn = document.getElementById('publishCopyTagBtn');
const publishBrowserBtn = document.getElementById('publishBrowserBtn');
const userAvatar = document.getElementById('userAvatar');
const userSection = document.getElementById('userSection');

const uploadBox = document.getElementById('uploadBox');
const photoInput = document.getElementById('photoInput');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const previewImage = document.getElementById('previewImage');
const uploadActionPanel = document.getElementById('uploadActionPanel');

const kongItems = document.querySelectorAll('.kong-item');
const adventureBtn = document.getElementById('adventureBtn');
const resultSection = document.getElementById('resultSection');
const resultCanvas = document.getElementById('resultCanvas');
const resultImage = document.getElementById('resultImage');
const simpleCard = document.getElementById('simpleCard');
const publishBtn = document.getElementById('publishBtn');
const exploreBtn = document.getElementById('exploreBtn');
const advancedCard = document.getElementById('advancedCard');
const advancedStatus = document.getElementById('advancedStatus');
const advancedLoadingCard = document.getElementById('advancedLoadingCard');
const advancedImageFrame = document.getElementById('advancedImageFrame');
const advancedResultImage = document.getElementById('advancedResultImage');
const publishAdvancedBtn = document.getElementById('publishAdvancedBtn');
const advancedActions = document.getElementById('advancedActions');
const loadingOverlay = document.getElementById('loadingOverlay');
const toast = document.getElementById('toast');

const kongAssetMap = {
    astronaut: 'images/kong-astronaut.png',
    cyberpunk: 'images/kong-cyberpunk.png',
    pilot: 'images/kong-village.png',
    polar: 'images/kong-polar.png',
    steampunk: 'images/kong-steampunk.png',
    village: 'images/kong-pilot.png',
    coolboy: 'images/kong-coolboy.png',
    fashion: 'images/kong-fashion.png'
};

const kongNames = {
    astronaut: '宇航员小孔',
    cyberpunk: '赛博朋克小孔',
    polar: '极地小孔',
    steampunk: '蒸汽朋克小孔',
    village: '乡土小孔',
    pilot: '飞行员小孔',
    coolboy: '酷boy小孔',
    fashion: '时尚先锋小孔'
};

const kongScenePrompts = {
    astronaut: '浩瀚宇宙舷窗、星云、太空站、漂浮彩带、庆祝胜利的探险氛围',
    cyberpunk: '霓虹未来都市、赛博街区、全息灯牌、能量轨道、热烈庆祝场景',
    pilot: '高空驾驶舱、云海、跑道灯光、飞行庆典、自由翱翔的氛围',
    polar: '极地雪原、极光、冰晶反光、雪地庆典、温暖陪伴冒险氛围',
    steampunk: '蒸汽飞艇码头、齿轮机械城、铜色烟雾、庆功派对、奇幻探险氛围',
    village: '田园乡野、稻田、晴朗天空、丰收庆祝、温暖快乐的冒险时刻',
    coolboy: '潮流街区、运动光影、都市舞台、欢呼庆贺、青春冒险氛围',
    fashion: '时尚秀场、艺术装置、镜面灯光、闪耀庆典、先锋冒险氛围'
};

const kongAdvancedDirectives = {
    astronaut: {
        scene: '背景要体现太空冒险：飞船舷窗、宇宙星云、空间站结构、悬浮灯光与庆祝彩带。',
        interaction: '主人物和小孔可以一起站在飞船舱内看向宇宙，也可以一起漂浮庆祝，或主人物轻摸小孔头部。'
    },
    cyberpunk: {
        scene: '背景要体现赛博未来都市：霓虹街区、全息屏幕、机械装置、未来交通与潮流灯牌。',
        interaction: '主人物和小孔可以并肩走在赛博街头、一起奔跑穿过霓虹巷道，或在全息广告前开心互动。'
    },
    pilot: {
        scene: '背景要体现飞行员冒险：复古或现代飞机、驾驶舱、云海、跑道灯、空中飞行氛围。',
        interaction: '主人物和小孔最好与飞机形成明确互动，例如一起坐在飞机前后座、一起准备起飞、或落地后开心庆祝。'
    },
    polar: {
        scene: '背景要体现极地探索：雪原、冰川、极光、雪地反光、探险营地、冰晶空气感。',
        interaction: '主人物和小孔可以在雪地中一起奔跑、互相依偎取暖、或站在极光下开心庆祝冒险成功。'
    },
    steampunk: {
        scene: '背景要体现蒸汽朋克探险：飞艇码头、铜质齿轮机械、蒸汽烟雾、复古仪表盘、奇幻工业场景。',
        interaction: '主人物和小孔可以一起站在飞艇甲板上庆祝、一起观察机械装置、或主人物弯腰摸摸小孔。'
    },
    village: {
        scene: '背景要体现温暖田园冒险：乡野稻田、晴朗天空、木屋、田埂、小路、丰收和庆祝感。',
        interaction: '主人物和小孔可以一起在田野里奔跑、一起坐在乡间小路边休息、或在丰收场景里快乐互动。'
    },
    coolboy: {
        scene: '背景要体现都市潮流冒险：街区运动场、滑板坡道、舞台灯光、动感城市空间和欢呼气氛。',
        interaction: '主人物和小孔可以一起跑动、跳跃庆祝、摆出潮流姿态，呈现年轻热烈的伙伴关系。'
    },
    fashion: {
        scene: '背景要体现先锋时尚冒险：秀场、艺术装置、镜面空间、时尚灯光、杂志大片般的高级氛围。',
        interaction: '主人物和小孔可以像时尚搭档一样并肩走秀、停下拍照庆祝，或在艺术场景中自然互动。'
    }
};

const advancedEndpoint = '/hepai/api/explore';
const sessionEndpoint = '/hepai/api/session';
const logoutEndpoint = '/hepai/api/logout';
const douyinLoginEndpoint = '/hepai/api/douyin/login';
const douyinAppDeepLink = 'snssdk1128://';
const douyinAdventureTag = '#和小孔一起去冒险';

// 显示提示
function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`图片加载失败: ${src}`));
        img.src = src;
    });
}

function setAdvancedStatus(message, state = '') {
    advancedStatus.textContent = message;
    advancedStatus.classList.remove('is-loading', 'is-error', 'is-success');
    if (state) {
        advancedStatus.classList.add(state);
    }
}

function setUiBusy(isBusy) {
    document.body.classList.toggle('is-busy', isBusy);
    adventureBtn.disabled = isBusy;
    exploreBtn.disabled = isBusy;
    adventureBtn.classList.toggle('is-disabled', isBusy);
    exploreBtn.classList.toggle('is-disabled', isBusy);
}

function applyLoginUI() {
    if (isLoggedIn && userInfo) {
        userAvatar.src = userInfo.avatar || 'images/user-avatar.svg';
        loginBtn.textContent = '退出登录';
        loginBtn.classList.remove('btn-login');
        loginBtn.classList.add('btn-logout');
        return;
    }

    userAvatar.src = 'images/avatar-default.svg';
    loginBtn.textContent = '登录抖音账号';
    loginBtn.classList.remove('btn-logout');
    loginBtn.classList.add('btn-login');
}

function showAdvancedImageResult(imageUrl, message = '') {
    advancedGeneratedImage = imageUrl;
    advancedResultImage.src = advancedGeneratedImage;
    advancedResultImage.hidden = false;
    advancedLoadingCard.hidden = true;
    advancedImageFrame.hidden = false;
    advancedActions.hidden = false;
    setAdvancedStatus(message || '', message ? 'is-success' : '');
    showResultMode('advanced');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function restoreSession() {
    try {
        const response = await fetch(sessionEndpoint, {
            credentials: 'include'
        });
        const data = await response.json();
        if (!data.loggedIn) {
            isLoggedIn = false;
            userInfo = null;
            applyLoginUI();
            return;
        }

        isLoggedIn = true;
        userInfo = data.user;
        applyLoginUI();

        if (data.generatedImageUrl) {
            showAdvancedImageResult(data.generatedImageUrl, '');
            advancedGeneratedImage = data.generatedImageUrl;
        }
    } catch (error) {
        console.error(error);
    }
}

async function fetchSessionState() {
    const response = await fetch(sessionEndpoint, {
        credentials: 'include'
    });
    return response.json();
}

function resetAdvancedResult() {
    advancedLoadingCard.hidden = true;
    if (!advancedGeneratedImage) {
        advancedResultImage.removeAttribute('src');
        advancedResultImage.hidden = true;
        advancedImageFrame.hidden = true;
        advancedActions.hidden = true;
        setAdvancedStatus('正在待命');
    }
}

function revealUploadActions() {
    uploadActionPanel.hidden = false;
}

function showResultMode(mode) {
    resultSection.hidden = false;
    simpleCard.hidden = mode !== 'simple';
    advancedCard.hidden = mode !== 'advanced';
}

function buildAdventurePrompt() {
    const kongName = kongNames[selectedKong];
    const scenePrompt = kongScenePrompts[selectedKong];
    const advancedDirective = kongAdvancedDirectives[selectedKong];

    return [
        '生成一张高质量、电影感、真实细腻又温暖欢乐的冒险合影。',
        `主角是用户上传照片中的真实人物，需要尽可能提取并保留照片中人物的面部特征、基础身形、发型、穿着和整体气质。`,
        `陪伴角色是${kongName}，必须严格保持与所选小狗匹配图中的形象一模一样。需要完整保留小狗在匹配图里的脸部结构、嘴鼻比例、眼睛形状、毛发颜色、毛发分布、耳朵形状、耳朵位置、体型比例、服装造型、配饰细节和整体气质。`,
        `绝对不要把小孔改画成黄色柴犬、秋田犬、柯基、博美或任何其他常见宠物狗形象；也不要替换毛色、犬种感、脸型、耳型或服饰。`,
        `小孔是一只肩高约40到50厘米的小狗，和人类主角同框时请严格注意比例关系，不要把小孔画得过大或接近成人体型。`,
        `${kongName}要与主人物自然同框，像真实冒险伙伴一样一起行动，不要做成简单贴图拼接感，但必须优先保证小狗形象和匹配图片完全一致。即使场景变化，也不能改变小孔原本的样子。`,
        `背景场景要求：${scenePrompt}。`,
        advancedDirective.scene,
        `画面中主人物和${kongName}必须有明确互动，不要各自站立割裂。`,
        advancedDirective.interaction,
        '画面主题是一起开启冒险后的愉快、开心、庆祝、充满陪伴感的瞬间。',
        '人物表情自然生动，构图完整，光影统一，色彩高级，适合抖音分享封面。',
        '优先生成全身或大半身双主体构图，让主人物和小孔都清晰完整地出现在画面中。',
        '避免畸形手指、重复五官、错位肢体、模糊脸部、裁切主体，同时禁止把小狗生成成与匹配图不一致的其他造型。',
        '如果匹配图里已经同时出现了主人物和小孔，请优先以匹配图中的小孔外观作为绝对标准，不要对小孔进行二次设计。'
    ].join(' ');
}

async function buildAdvancedReferenceImage() {
    await generateAdventureImage({ silent: true, bypassBusyCheck: true });
    if (!generatedImage) {
        throw new Error('匹配失败');
    }

    if (resultCanvas.width && resultCanvas.height) {
        return resultCanvas.toDataURL('image/jpeg', 0.82);
    }

    return generatedImage;
}

async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('图片读取失败'));
        reader.readAsDataURL(file);
    });
}

async function generateAdvancedAdventureImage() {
    if (isAdvancedGenerating) {
        showToast('探索引擎启动中...', 2000);
        return;
    }

    if (!selectedPhoto) {
        showToast('请先上传照片！', 3000);
        return;
    }

    if (!isLoggedIn) {
        showToast('出发去冒险前，请先登录抖音账号！', 3000);
        openDouyinLogin();
        return;
    }

    try {
        const sessionData = await fetchSessionState();
        if (sessionData && sessionData.generatedImageUrl) {
            advancedGeneratedImage = sessionData.generatedImageUrl;
            showAdvancedImageResult(sessionData.generatedImageUrl, '');
            showToast('继续冒险，加v<jeremykong----kong>', 3000);
            return;
        }
    } catch (error) {
        console.error(error);
    }

    const selectedFile = photoInput.files && photoInput.files[0];
    if (!selectedFile) {
        showToast('请重新上传原始照片后再探索！', 3000);
        return;
    }

    showResultMode('advanced');

    isAdvancedGenerating = true;
    loadingOverlay.hidden = false;
    loadingOverlay.querySelector('p').textContent = '探索引擎启动中...';
    setUiBusy(true);
    setAdvancedStatus('正在生成 AI 冒险画面...', 'is-loading');
    advancedLoadingCard.hidden = false;
    advancedImageFrame.hidden = true;
    advancedActions.hidden = true;

    try {
        const photoDataUrl = await fileToDataUrl(selectedFile);
        const referenceComposite = await buildAdvancedReferenceImage();
        const response = await fetch(advancedEndpoint, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'doubao-seedream-5-0-260128',
                kongStyle: selectedKong,
                kongName: kongNames[selectedKong],
                prompt: buildAdventurePrompt(),
                image: referenceComposite,
                originalPhoto: photoDataUrl
            })
        });

        const data = await response.json().catch(() => ({}));
        console.log('Advanced explore response status:', response.status);
        console.log('Advanced explore response data:', data);
        const imageUrl = data.imageUrl || data.generated_image_url || data.url || null;
        const imageBase64 = data.image_base64 || null;

        if (!response.ok) {
            if (response.status === 409 && imageUrl) {
                showAdvancedImageResult(imageUrl, '');
                showToast('继续冒险，加v<jeremykong----kong>', 3000);
                return;
            }

            if (imageUrl || imageBase64) {
                const recoveredImageUrl = imageUrl || `data:image/png;base64,${imageBase64}`;
                showAdvancedImageResult(recoveredImageUrl, '');
                showToast('高阶冒险图生成完成！', 3000);
                return;
            }

            throw new Error(data.error || data.message || '高阶探索暂时失败');
        }

        if (!imageUrl && !imageBase64) {
            throw new Error('高阶探索接口未返回图片');
        }

        const finalImageUrl = imageUrl || `data:image/png;base64,${imageBase64}`;
        showAdvancedImageResult(finalImageUrl, '');
        if (data.reused) {
            showToast('继续冒险，加v<jeremykong----kong>', 3000);
        } else {
            showToast('高阶冒险图生成完成！', 3000);
        }
    } catch (error) {
        console.error(error);
        advancedLoadingCard.hidden = true;
        const detailedMessage = error && error.message ? error.message : '高阶探索失败，请稍后重试';
        console.error('Advanced explore final error:', detailedMessage);
        try {
            const sessionData = await fetchSessionState();
            console.log('Advanced explore fallback session data:', sessionData);
            if (sessionData && sessionData.generatedImageUrl) {
                advancedGeneratedImage = sessionData.generatedImageUrl;
                showAdvancedImageResult(sessionData.generatedImageUrl, '');
                showToast('继续冒险，加v<jeremykong----kong>', 3000);
                return;
            }
        } catch (sessionError) {
            console.error(sessionError);
        }

        if (advancedGeneratedImage) {
            showAdvancedImageResult(advancedGeneratedImage, '');
            showToast('继续冒险，加v<jeremykong----kong>', 3000);
        } else {
            setAdvancedStatus(detailedMessage, 'is-error');
            showToast(detailedMessage, 4000);
        }
    } finally {
        isAdvancedGenerating = false;
        loadingOverlay.hidden = true;
        loadingOverlay.querySelector('p').textContent = 'AI正在生成中...';
        setUiBusy(false);
    }
}

// 抖音登录功能
function isWechatBrowser() {
    return /MicroMessenger/i.test(navigator.userAgent || '');
}

async function copyCurrentLink() {
    const currentUrl = window.location.origin + window.location.pathname;
    try {
        await navigator.clipboard.writeText(currentUrl);
        showToast('链接已复制，请在系统浏览器打开', 3000);
    } catch (error) {
        showToast('复制失败，请手动复制当前页面链接', 3000);
    }
}

async function copyAdventureTag() {
    try {
        await navigator.clipboard.writeText(douyinAdventureTag);
        showToast('话题已复制，可直接粘贴到抖音', 3000);
    } catch (error) {
        showToast(`请手动复制：${douyinAdventureTag}`, 3000);
    }
}

function downloadImage(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function tryOpenDouyinApp() {
    showToast('正在尝试唤起抖音...', 2000);
    const start = Date.now();
    window.location.href = douyinAppDeepLink;
    setTimeout(() => {
        if (Date.now() - start < 2200) {
            showToast('若未成功唤起，请在浏览器中打开', 3000);
        }
    }, 1800);
}

function openPublishGuide(targetImage) {
    if (!targetImage) {
        showToast('请先生成图片后再发布', 3000);
        return;
    }

    publishGuideModal.dataset.image = targetImage;
    publishGuideModal.hidden = false;
}

function openDouyinLogin() {
    if (isWechatBrowser()) {
        wechatLoginModal.hidden = false;
        return;
    }

    showToast('正在跳转抖音授权...', 1500);
    setTimeout(() => {
        window.location.href = douyinLoginEndpoint;
    }, 120);
}

async function handleLogout() {
    try {
        await fetch(logoutEndpoint, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error(error);
    }

    isLoggedIn = false;
    userInfo = null;
    applyLoginUI();
    showToast('已退出登录');
}

revealUploadActions();

loginBtn.addEventListener('click', () => {
    if (isLoggedIn) {
        handleLogout();
    } else {
        openDouyinLogin();
    }
});

closeLoginModal.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.hidden = true;
});

closeWechatLoginModal.addEventListener('click', (e) => {
    e.preventDefault();
    wechatLoginModal.hidden = true;
});

openDouyinAppBtn.addEventListener('click', () => {
    tryOpenDouyinApp();
});

copyOpenLinkBtn.addEventListener('click', async () => {
    await copyCurrentLink();
});

// 点击模态框外部关闭
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.hidden = true;
    }
});

wechatLoginModal.addEventListener('click', (e) => {
    if (e.target === wechatLoginModal) {
        wechatLoginModal.hidden = true;
    }
});

closePublishGuideModal.addEventListener('click', (e) => {
    e.preventDefault();
    publishGuideModal.hidden = true;
});

publishGuideModal.addEventListener('click', (e) => {
    if (e.target === publishGuideModal) {
        publishGuideModal.hidden = true;
    }
});

publishOpenDouyinBtn.addEventListener('click', () => {
    tryOpenDouyinApp();
});

publishDownloadBtn.addEventListener('click', () => {
    const targetImage = publishGuideModal.dataset.image;
    if (!targetImage) {
        showToast('当前没有可保存的图片', 3000);
        return;
    }
    downloadImage(targetImage, 'xiaokong-adventure.png');
    showToast('图片已开始下载，请保存后前往抖音发布', 3000);
});

publishCopyTagBtn.addEventListener('click', async () => {
    await copyAdventureTag();
});

publishBrowserBtn.addEventListener('click', async () => {
    await copyCurrentLink();
});

// 上传照片功能
uploadBox.addEventListener('click', () => {
    photoInput.click();
});

photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        resetAdvancedResult();
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedPhoto = event.target.result;
            previewImage.src = selectedPhoto;
            previewImage.hidden = false;
            uploadPlaceholder.hidden = true;
            revealUploadActions();
            showToast('照片上传成功！');
        };
        reader.readAsDataURL(file);
    }
});

// 拖拽上传
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#764ba2';
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.borderColor = '#667eea';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#667eea';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        resetAdvancedResult();
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedPhoto = event.target.result;
            previewImage.src = selectedPhoto;
            previewImage.hidden = false;
            uploadPlaceholder.hidden = true;
            revealUploadActions();
            showToast('照片上传成功！');
        };
        reader.readAsDataURL(file);
    }
});

// 选择小孔装扮
kongItems.forEach(item => {
    item.addEventListener('click', () => {
        // 移除其他选中状态
        kongItems.forEach(k => k.classList.remove('active'));
        // 添加当前选中状态
        item.classList.add('active');
        selectedKong = item.dataset.kong;
        resetAdvancedResult();
        showToast(`已选择：${item.querySelector('span').textContent}`);
    });
});

// AI 生成合成图
async function generateAdventureImage(options = {}) {
    const { silent = false, bypassBusyCheck = false } = options;

    if (isAdvancedGenerating && !bypassBusyCheck) {
        showToast('探索引擎启动中...', 2000);
        return;
    }

    if (!selectedPhoto) {
        showToast('请先上传照片！', 3000);
        return;
    }

    if (!silent) {
        showResultMode('simple');
    }
    
    loadingOverlay.hidden = false;
    setUiBusy(true);
    
    // 模拟 AI 生成延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
        const [userImg, kongImg] = await Promise.all([
            loadImage(selectedPhoto),
            loadImage(kongAssetMap[selectedKong])
        ]);

        // 使用 Canvas 生成合成图
        const canvas = resultCanvas;
        const ctx = canvas.getContext('2d');

        const userWidth = userImg.naturalWidth || userImg.width;
        const userHeight = userImg.naturalHeight || userImg.height;
        const maxMainWidth = 1200;
        const maxMainHeight = 1600;
        const mainScale = Math.min(maxMainWidth / userWidth, maxMainHeight / userHeight, 1);
        const mainW = Math.max(320, Math.round(userWidth * mainScale));
        const mainH = Math.max(320, Math.round(userHeight * mainScale));
        const padding = Math.max(28, Math.round(Math.min(mainW, mainH) * 0.05));
        const frameInset = Math.max(6, Math.round(padding * 0.16));
        const canvasWidth = mainW + padding * 2;
        const canvasHeight = mainH + padding * 2;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // === 第1层：背景 ===
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0b1120');
        gradient.addColorStop(0.6, '#1e3a8a');
        gradient.addColorStop(1, '#312e81');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // === 第2层：用户照片（主图）===
        const mainX = padding;
        const mainY = padding;
        const frameRadius = Math.max(20, Math.round(Math.min(mainW, mainH) * 0.04));
        const imageRadius = Math.max(14, Math.round(frameRadius * 0.7));
        
        // 绘制圆角矩形外框
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        roundRect(ctx, mainX - frameInset, mainY - frameInset, mainW + frameInset * 2, mainH + frameInset * 2, frameRadius);
        ctx.fill();
        
        // 保存上下文并绘制圆角clip的用户照片
        ctx.save();
        ctx.beginPath();
        roundRect(ctx, mainX, mainY, mainW, mainH, imageRadius);
        ctx.clip();
        ctx.drawImage(userImg, mainX, mainY, mainW, mainH);
        ctx.restore();
        
        // 底部渐变遮罩（让底部文字可读）
        const fadeHeight = Math.max(120, Math.round(mainH * 0.24));
        const bottomFade = ctx.createLinearGradient(0, mainY + mainH - fadeHeight, 0, mainY + mainH);
        bottomFade.addColorStop(0, 'rgba(11, 17, 32, 0)');
        bottomFade.addColorStop(0.5, 'rgba(11, 17, 32, 0.4)');
        bottomFade.addColorStop(1, 'rgba(11, 17, 32, 0.75)');
        ctx.fillStyle = bottomFade;
        ctx.fillRect(mainX, mainY + mainH - fadeHeight, mainW, fadeHeight);

        // === 第3层：小孔（圆形，右下角）===
        const kongSize = Math.max(96, Math.round(Math.min(mainW, mainH) * 0.22));
        const kongOffset = Math.max(18, Math.round(padding * 0.75));
        const kongX = mainX + mainW - kongSize - kongOffset;
        const kongY = mainY + mainH - kongSize - kongOffset;
        
        // 圆形clip绘制小孔
        ctx.save();
        ctx.beginPath();
        ctx.arc(kongX + kongSize/2, kongY + kongSize/2, kongSize/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(kongImg, kongX, kongY, kongSize, kongSize);
        ctx.restore();
        
        // 圆形边框
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = Math.max(3, Math.round(kongSize * 0.02));
        ctx.beginPath();
        ctx.arc(kongX + kongSize/2, kongY + kongSize/2, kongSize/2, 0, Math.PI * 2);
        ctx.stroke();

        // === 第4层：文字信息（左下角）===
        ctx.textAlign = 'left';
        const textInset = Math.max(20, Math.round(mainW * 0.035));
        const brandFontSize = Math.max(14, Math.round(mainW * 0.022));
        const titleFontSize = Math.max(28, Math.round(mainW * 0.05));
        const subtitleFontSize = Math.max(16, Math.round(mainW * 0.028));
        const textBaseY = mainY + mainH - Math.max(18, Math.round(mainH * 0.03));
        const titleGap = Math.max(18, Math.round(mainH * 0.035));
        const brandGap = Math.max(14, Math.round(mainH * 0.028));
        
        // 品牌
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.font = `${brandFontSize}px Arial, sans-serif`;
        ctx.fillText('JEREMY·KONG STUDIO', mainX + textInset, textBaseY - titleFontSize - subtitleFontSize - titleGap - brandGap);
        
        // 主标题
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${titleFontSize}px Arial, sans-serif`;
        ctx.fillText('和小孔一起去冒险', mainX + textInset, textBaseY - subtitleFontSize - titleGap);
        
        // 副标题
        ctx.font = `${subtitleFontSize}px Arial, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(`${kongNames[selectedKong]} · #和小孔一起去冒险`, mainX + textInset, textBaseY);

        // === 导出结果 ===
        generatedImage = canvas.toDataURL('image/png');
        resultImage.src = generatedImage;
        
        resultImage.hidden = false;
        publishBtn.hidden = false;
        loadingOverlay.hidden = true;

        if (!silent) {
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (error) {
        loadingOverlay.hidden = true;
        if (!silent) {
            showToast('合成失败，请重试', 3000);
        }
        console.error(error);
    } finally {
        setUiBusy(false);
    }
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

adventureBtn.addEventListener('click', generateAdventureImage);
exploreBtn.addEventListener('click', generateAdvancedAdventureImage);

// 发布抖音
async function publishToDouyin(targetType = 'simple') {
    const targetImage = targetType === 'advanced' ? advancedGeneratedImage : generatedImage;

    if (!isLoggedIn) {
        showToast('请先登录抖音账号！', 3000);
        openDouyinLogin();
        return;
    }
    
    if (!targetImage) {
        showToast(targetType === 'advanced' ? '请先生成高阶冒险图！' : '请先生成冒险图！', 3000);
        return;
    }

    await copyAdventureTag();

    if (isWechatBrowser()) {
        openPublishGuide(targetImage);
        return;
    }

    tryOpenDouyinApp();
    showToast('已尝试打开抖音，请先保存图片并粘贴话题发布', 3500);
}

publishBtn.addEventListener('click', () => publishToDouyin('simple'));
publishAdvancedBtn.addEventListener('click', () => publishToDouyin('advanced'));

// 初始化
showToast('👋 欢迎来到小孔的冒险之旅！');
applyLoginUI();

// 添加一些动画效果
document.addEventListener('DOMContentLoaded', () => {
    // 为所有小孔选项添加延迟动画
    kongItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // 图片懒加载优化
    const lazyImages = document.querySelectorAll('.kong-image');

    function markLoaded(img) {
        img.classList.add('loaded');
    }

    function assignImageSource(img) {
        if (!img.dataset.src || img.getAttribute('src')) {
            return;
        }

        img.addEventListener('load', () => markLoaded(img), { once: true });
        img.addEventListener('error', () => markLoaded(img), { once: true });
        img.src = img.dataset.src;
    }

    lazyImages.forEach(img => {
        if (img.getAttribute('loading') === 'eager') {
            if (img.complete && img.currentSrc) {
                markLoaded(img);
            } else {
                img.addEventListener('load', () => markLoaded(img), { once: true });
                img.addEventListener('error', () => markLoaded(img), { once: true });
            }
            return;
        }

        if (!('IntersectionObserver' in window)) {
            assignImageSource(img);
        }
    });

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                }

                const img = entry.target;
                assignImageSource(img);
                imageObserver.unobserve(img);
            });
        }, {
            rootMargin: '220px 0px',
            threshold: 0.01
        });

        lazyImages.forEach(img => {
            if (img.getAttribute('loading') !== 'eager') {
                imageObserver.observe(img);
            }
        });
    }
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        loginModal.hidden = true;
    }
});

restoreSession();
