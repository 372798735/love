const { createApp, ref, computed, onMounted } = Vue;

// 注册 Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('Service Worker 注册成功:', registration.scope);
                })
                .catch(error => {
                    console.log('Service Worker 注册失败:', error);
                });
        });
    }
}

// 检测屏幕方向
function checkOrientation() {
    const orientationTip = document.getElementById('orientation-tip');
    
    // 只在移动设备上检测屏幕方向
    if (window.innerWidth <= 768) {
        if (window.innerWidth > window.innerHeight) {
            // 横屏
            orientationTip.style.display = 'flex';
        } else {
            // 竖屏
            orientationTip.style.display = 'none';
        }
    } else {
        // 在桌面设备上不显示提示
        orientationTip.style.display = 'none';
    }
}

// 监听屏幕方向变化
window.addEventListener('resize', checkOrientation);
// 初始检测
window.addEventListener('load', checkOrientation);

// 页面加载完成后注册Service Worker
if (document.readyState === 'complete') {
    registerServiceWorker();
} else {
    window.addEventListener('load', registerServiceWorker);
}

const app = createApp({
    setup() {
        // 音乐播放控制
        const bgMusic = ref(null);
        // 从本地存储中获取音乐播放状态，默认为false
        const isPlaying = ref(localStorage.getItem('musicPlaying') === 'true');
        const musicLoaded = ref(false);
        const musicError = ref(false);
        
        const toggleMusic = () => {
            if (bgMusic.value) {
                if (isPlaying.value) {
                    bgMusic.value.pause();
                    isPlaying.value = false;
                    localStorage.setItem('musicPlaying', 'false');
                } else {
                    // 尝试播放音乐
                    const playPromise = bgMusic.value.play();
                    
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            // 播放成功
                            isPlaying.value = true;
                            musicError.value = false;
                            localStorage.setItem('musicPlaying', 'true');
                        }).catch(e => {
                            // 播放失败
                            console.error('音乐播放失败:', e);
                            isPlaying.value = false;
                            musicError.value = true;
                            
                            // 显示错误提示（可选）
                            alert('音乐播放失败，请检查网络连接或尝试使用其他浏览器。');
                        });
                    }
                }
            }
        };
        
        // 音频加载事件处理
        const handleMusicLoaded = () => {
            musicLoaded.value = true;
            musicError.value = false;
            console.log('音乐加载成功');
        };
        
        // 音频错误事件处理
        const handleMusicError = (e) => {
            musicError.value = true;
            console.error('音乐加载失败:', e);
        };
        // 设置恋爱开始的日期：2025年05月03日
        const startDateObj = new Date('2025-05-03');
        const startDate = ref(formatDate(startDateObj));
        const days = ref(0);

        // 计算在一起的天数
        const calculateDays = () => {
            const today = new Date();
            const timeDiff = today - startDateObj;
            // 如果还没到开始日期，显示0天
            if (timeDiff < 0) {
                days.value = 0;
                return;
            }
            // 计算天数（向下取整）
            days.value = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        };

        // 格式化日期为 YYYY年MM月DD日 的格式
        function formatDate(date) {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${year}年${month}月${day}日`;
        }

        // 添加点击爱心效果
        const createHeartEffect = (event) => {
            const heart = document.createElement('div');
            heart.className = 'click-heart';
            
            // 获取点击或触摸位置
            let x, y;
            if (event.type === 'touchstart' || event.type === 'touchend') {
                // 触摸事件
                const touch = event.changedTouches[0];
                x = touch.clientX;
                y = touch.clientY;
            } else {
                // 鼠标点击事件
                x = event.clientX;
                y = event.clientY;
            }
            
            // 设置爱心位置
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';
            
            document.body.appendChild(heart);
            
            // 动画结束后移除爱心元素
            setTimeout(() => {
                heart.remove();
            }, 1000);
        };

        // 隐藏加载动画，显示主内容
        const hideLoading = () => {
            const loading = document.getElementById('loading');
            const appDiv = document.getElementById('app');
            
            if (loading && appDiv) {
                // 淡出加载动画
                loading.style.opacity = '0';
                loading.style.transition = 'opacity 0.5s ease';
                
                // 显示主内容
                setTimeout(() => {
                    loading.style.display = 'none';
                    appDiv.style.display = 'block';
                    appDiv.style.opacity = '0';
                    appDiv.style.transition = 'opacity 0.5s ease';
                    
                    setTimeout(() => {
                        appDiv.style.opacity = '1';
                    }, 50);
                }, 500);
            }
        };
        

        
        // 组件挂载时计算天数
        onMounted(() => {
            calculateDays();
            // 每天凌晨更新一次天数
            setInterval(() => {
                calculateDays();
            }, 1000 * 60 * 60); // 每小时检查一次
            
            // 根据保存的状态自动播放音乐
            if (isPlaying.value) {
                // 延迟一点时间，确保音频元素已经加载
                setTimeout(() => {
                    if (bgMusic.value) {
                        bgMusic.value.play().catch(e => {
                            console.error('自动播放失败:', e);
                            isPlaying.value = false;
                            localStorage.setItem('musicPlaying', 'false');
                        });
                    }
                }, 2000);  // 延迟2秒
            }
            
            // 添加点击和触摸事件监听器
            document.addEventListener('click', createHeartEffect);
            document.addEventListener('touchstart', createHeartEffect, { passive: true });
            
            // 优化移动端滚动体验
            document.addEventListener('touchmove', function(e) {
                // 允许页面正常滚动
            }, { passive: true });
            
            // 页面加载完成后，隐藏加载动画
            window.addEventListener('load', hideLoading);
            
            // 如果页面已经加载完成，立即隐藏加载动画
            if (document.readyState === 'complete') {
                hideLoading();
            } else {
                // 设置一个超时，确保加载动画不会一直显示
                setTimeout(hideLoading, 2000);
            }
        });

        return {
            startDate,
            days,
            bgMusic,
            isPlaying,
            musicLoaded,
            musicError,
            toggleMusic,
            handleMusicLoaded,
            handleMusicError
        };
    }
});

app.mount('#app');