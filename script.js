// 全局状态
let isLoggedIn = false;
let userInfo = null;
let selectedPhoto = null;
let selectedKong = 'astronaut';
let generatedImage = null;

// DOM 元素
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const simulateLoginBtn = document.getElementById('simulateLoginBtn');
const userAvatar = document.getElementById('userAvatar');
const userSection = document.getElementById('userSection');

const uploadBox = document.getElementById('uploadBox');
const photoInput = document.getElementById('photoInput');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const previewImage = document.getElementById('previewImage');

const kongItems = document.querySelectorAll('.kong-item');
const adventureBtn = document.getElementById('adventureBtn');
const resultSection = document.getElementById('resultSection');
const resultCanvas = document.getElementById('resultCanvas');
const resultImage = document.getElementById('resultImage');
const publishBtn = document.getElementById('publishBtn');
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

// 抖音登录功能
function openDouyinLogin() {
    // 在实际环境中，这里应该调用抖音的 SDK
    // window.douyin.authorize({...})
    loginModal.hidden = false;
}

function handleLoginSuccess() {
    isLoggedIn = true;
    // 模拟用户数据
    userInfo = {
        avatar: 'images/user-avatar.svg',
        nickname: '抖音用户' + Math.floor(Math.random() * 10000),
        openId: 'douyin_' + Date.now()
    };
    
    // 更新 UI
    userAvatar.src = userInfo.avatar;
    loginBtn.textContent = '退出登录';
    loginBtn.classList.remove('btn-login');
    loginBtn.classList.add('btn-logout');
    
    loginModal.hidden = true;
    showToast('登录成功！欢迎回来');
}

function handleLogout() {
    isLoggedIn = false;
    userInfo = null;
    
    // 更新 UI
    userAvatar.src = 'images/avatar-default.svg';
    loginBtn.textContent = '登录抖音账号';
    loginBtn.classList.remove('btn-logout');
    loginBtn.classList.add('btn-login');
    
    showToast('已退出登录');
}

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

simulateLoginBtn.addEventListener('click', () => {
    handleLoginSuccess();
});

// 点击模态框外部关闭
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.hidden = true;
    }
});

// 上传照片功能
uploadBox.addEventListener('click', () => {
    photoInput.click();
});

photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedPhoto = event.target.result;
            previewImage.src = selectedPhoto;
            previewImage.hidden = false;
            uploadPlaceholder.hidden = true;
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
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedPhoto = event.target.result;
            previewImage.src = selectedPhoto;
            previewImage.hidden = false;
            uploadPlaceholder.hidden = true;
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
        showToast(`已选择：${item.querySelector('span').textContent}`);
    });
});

// AI 生成合成图
async function generateAdventureImage() {
    if (!selectedPhoto) {
        showToast('请先上传照片！', 3000);
        return;
    }
    
    loadingOverlay.hidden = false;
    
    // 模拟 AI 生成延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 使用 Canvas 生成合成图
    const canvas = resultCanvas;
    const ctx = canvas.getContext('2d');
    
    // 设置画布大小
    canvas.width = 800;
    canvas.height = 600;

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
    
    try {
        const [userImg, kongImg] = await Promise.all([
            loadImage(selectedPhoto),
            loadImage(kongAssetMap[selectedKong])
        ]);

        // 绘制海报背景
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0b1120');
        gradient.addColorStop(0.62, '#172554');
        gradient.addColorStop(1, '#312e81');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 单主画面边框
        const frameX = 48;
        const frameY = 48;
        const frameW = 704;
        const frameH = 504;
        const frameRadius = 30;

        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        roundRect(ctx, frameX - 8, frameY - 8, frameW + 16, frameH + 16, 36);
        ctx.fill();
        roundRect(ctx, frameX, frameY, frameW, frameH, frameRadius);
        ctx.clip();
        ctx.drawImage(userImg, frameX, frameY, frameW, frameH);

        // 统一暗角和底部压暗，避免上下分段重复感
        const overlay = ctx.createLinearGradient(frameX, frameY, frameX, frameY + frameH);
        overlay.addColorStop(0, 'rgba(8, 15, 32, 0.10)');
        overlay.addColorStop(0.55, 'rgba(8, 15, 32, 0.05)');
        overlay.addColorStop(1, 'rgba(8, 15, 32, 0.65)');
        ctx.fillStyle = overlay;
        ctx.fillRect(frameX, frameY, frameW, frameH);

        // 小孔融合到主画面右下区域，不形成第二张独立画面
        const kongW = 188;
        const kongH = 188;
        const kongX = 516;
        const kongY = 292;
        ctx.save();
        ctx.globalAlpha = 0.96;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
        ctx.shadowBlur = 16;
        roundRect(ctx, kongX, kongY, kongW, kongH, 20);
        ctx.clip();
        ctx.drawImage(kongImg, kongX, kongY, kongW, kongH);
        ctx.restore();

        // 用柔边把小孔过渡进同一张画面
        const blend = ctx.createLinearGradient(kongX - 56, kongY, kongX + 40, kongY);
        blend.addColorStop(0, 'rgba(8, 15, 32, 0.42)');
        blend.addColorStop(1, 'rgba(8, 15, 32, 0)');
        ctx.fillStyle = blend;
        ctx.fillRect(kongX - 56, kongY, 96, kongH);
        ctx.restore();

        // 单底部信息条
        ctx.fillStyle = 'rgba(7, 12, 24, 0.55)';
        roundRect(ctx, 78, 426, 408, 96, 22);
        ctx.fill();

        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.78)';
        ctx.font = '15px Arial, sans-serif';
        ctx.fillText('JEREMY·KONG STUDIO', 102, 456);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 34px Arial, sans-serif';
        ctx.fillText('和小孔一起去冒险', 102, 494);
        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.fillText(`${kongNames[selectedKong]} · #和小孔一起去冒险`, 102, 526);
        ctx.restore();

        // 显示结果
        generatedImage = canvas.toDataURL('image/png');
        resultImage.src = generatedImage;
        resultImage.hidden = false;
        resultCanvas.hidden = true;
        resultSection.hidden = false;
        loadingOverlay.hidden = true;

        // 滚动到结果区域
        resultSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        loadingOverlay.hidden = true;
        showToast('合成失败，请重试', 3000);
        console.error(error);
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

// 发布抖音
async function publishToDouyin() {
    if (!isLoggedIn) {
        showToast('请先登录抖音账号！', 3000);
        loginModal.hidden = false;
        return;
    }
    
    if (!generatedImage) {
        showToast('请先生成冒险图！', 3000);
        return;
    }
    
    loadingOverlay.hidden = false;
    loadingOverlay.querySelector('p').textContent = '正在发布到抖音...';
    
    // 模拟发布过程
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 实际环境中调用抖音 SDK
    // window.douyin.publish({
    //     image: generatedImage,
    //     title: '和小孔一起去冒险',
    //     hashtags: ['#和小孔一起去冒险']
    // });
    
    loadingOverlay.hidden = true;
    loadingOverlay.querySelector('p').textContent = 'AI正在生成中...';
    showToast('✅ 发布成功！快来抖音查看吧~', 4000);
}

publishBtn.addEventListener('click', publishToDouyin);

// 初始化
showToast('👋 欢迎来到小孔的冒险之旅！');

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
        if (!img.dataset.src || img.src) {
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
