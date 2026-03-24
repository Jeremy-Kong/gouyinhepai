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

// 显示提示
function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
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
    
    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制标题
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('小孔的冒险之旅', canvas.width / 2, 50);
    
    // 加载用户照片
    const userImg = new Image();
    userImg.crossOrigin = 'anonymous';
    userImg.onload = () => {
        // 绘制用户照片（左侧）
        const userSize = 250;
        const userX = 100;
        const userY = 150;
        ctx.save();
        ctx.beginPath();
        ctx.arc(userX + userSize/2, userY + userSize/2, userSize/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(userImg, userX, userY, userSize, userSize);
        ctx.restore();
        
        // 绘制标签
        ctx.font = '20px Arial, sans-serif';
        ctx.fillText('冒险家', userX + userSize/2, userY + userSize + 40);
    };
    userImg.src = selectedPhoto;
    
    // 加载小孔图片
    const kongImg = new Image();
    kongImg.crossOrigin = 'anonymous';
    kongImg.onload = () => {
        // 绘制小孔照片（右侧）
        const kongSize = 250;
        const kongX = 450;
        const kongY = 150;
        ctx.save();
        ctx.beginPath();
        ctx.arc(kongX + kongSize/2, kongY + kongSize/2, kongSize/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(kongImg, kongX, kongY, kongSize, kongSize);
        ctx.restore();
        
        // 绘制标签
        const kongNames = {
            'astronaut': '宇航员小孔',
            'cyberpunk': '赛博朋克小孔',
            'polar': '极地小孔',
            'steampunk': '蒸汽朋克小孔',
            'village': '乡土小孔',
            'pilot': '飞行员小孔',
            'coolboy': '酷boy小孔',
            'fashion': '时尚先锋小孔'
        };
        ctx.fillText(kongNames[selectedKong], kongX + kongSize/2, kongY + kongSize + 40);
        
        // 绘制装饰性元素
        ctx.font = '60px Arial';
        ctx.fillText('🌟', canvas.width / 2, 200);
        ctx.fillText('🚀', canvas.width / 2, 280);
        ctx.fillText('🌈', canvas.width / 2, 360);
        
        // 绘制底部文字
        ctx.font = '24px Arial, sans-serif';
        ctx.fillText('#和小孔一起去冒险', canvas.width / 2, canvas.height - 50);
        
        // 显示结果
        loadingOverlay.hidden = true;
        resultSection.hidden = false;
        generatedImage = canvas.toDataURL('image/png');
        resultImage.src = generatedImage;
        resultImage.hidden = false;
        
        // 滚动到结果区域
        resultSection.scrollIntoView({ behavior: 'smooth' });
    };
    kongImg.src = `images/kong-${selectedKong}.png`;
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
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    lazyImages.forEach(img => {
        // 如果图片已经缓存，直接添加loaded类
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            // 监听图片加载完成
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
            
            // 加载失败时也要移除骨架屏
            img.addEventListener('error', () => {
                img.classList.add('loaded');
            });
        }
    });
    
    // 使用 Intersection Observer 优化图片加载
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        loginModal.hidden = true;
    }
});
