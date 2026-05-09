/**
 * 公共工具函数
 * 包含网站配置加载、页面内容加载等通用功能
 */

// 导入性能优化模块
import { initPerformance } from './performance.js';

/**
 * 加载网站配置
 * @returns {Object} 网站配置对象
 */
export function loadConfig() {
    try {
        // 尝试从localStorage加载配置
        const configStr = localStorage.getItem('siteConfig');
        const config = configStr ? JSON.parse(configStr) : {
            siteTitle: '个人网站',
            siteDescription: '这是一个个人网站',
            menuItems: [
                { name: '首页', url: 'index.html' },
                { name: '关于我', url: 'apps/home/views/about.html' },
                { name: '我的项目', url: 'apps/home/views/projects.html' },
                { name: '联系方式', url: 'apps/home/views/contact.html' }
            ],
            themeColor: '#4facfe',
            contact: {
                email: '',
                phone: '',
                wechat: ''
            },
            pages: {}
        };
        
        // 更新页面标题
        if (config.siteTitle) {
            document.title = config.siteTitle;
        }
        
        // 生成导航菜单
        const navUl = document.querySelector('nav ul');
        if (navUl) {
            // 使用文档片段提高性能
            const fragment = document.createDocumentFragment();
            
            // 添加菜单项
            config.menuItems.forEach(item => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = item.url;
                a.textContent = item.name;
                li.appendChild(a);
                fragment.appendChild(li);
            });
            
            // 检查登录状态，只对登录用户显示管理链接
            if (checkLoginStatus()) {
                const adminLi = document.createElement('li');
                const adminA = document.createElement('a');
                adminA.href = 'apps/admin/views/admin.html';
                adminA.textContent = '管理';
                adminLi.appendChild(adminA);
                fragment.appendChild(adminLi);
            } else {
                // 未登录用户显示登录链接
                const loginLi = document.createElement('li');
                const loginA = document.createElement('a');
                loginA.href = 'apps/home/views/login.html';
                loginA.textContent = '登录';
                loginLi.appendChild(loginA);
                fragment.appendChild(loginLi);
            }
            
            // 一次性添加所有元素
            navUl.innerHTML = '';
            navUl.appendChild(fragment);
        }
        
        return config;
    } catch (error) {
        console.error('加载配置失败:', error);
        // 返回默认配置
        return {
            siteTitle: '个人网站',
            siteDescription: '这是一个个人网站',
            menuItems: [
                { name: '首页', url: 'index.html' },
                { name: '关于我', url: 'apps/home/views/about.html' },
                { name: '我的项目', url: 'apps/home/views/projects.html' },
                { name: '联系方式', url: 'apps/home/views/contact.html' }
            ],
            themeColor: '#4facfe',
            contact: {
                email: '',
                phone: '',
                wechat: ''
            },
            pages: {}
        };
    }
}

/**
 * 加载页面内容
 * @param {string} pageName 页面名称
 * @returns {Object} 页面内容对象
 */
export function loadPageContent(pageName) {
    try {
        // 尝试从localStorage加载配置
        const configStr = localStorage.getItem('siteConfig');
        const config = configStr ? JSON.parse(configStr) : { pages: {} };
        
        const defaultContent = {
            index: {
                title: '你好，我是 <span>开发者</span>',
                content: '专注于前端开发和设计，创造美观、响应式的网站'
            },
            about: {
                title: '关于我',
                content: '你好，我是一名热爱编程和设计的开发者，拥有多年的前端开发经验。我擅长使用HTML、CSS、JavaScript等技术栈，致力于创建美观、响应式的网站。\n\n我热爱学习新技术，不断提升自己的技能水平，以适应快速发展的技术环境。我相信技术的力量可以改变世界，因此我始终保持着对技术的热情和探索精神。\n\n在工作中，我注重代码质量和用户体验，追求完美的细节。我喜欢与团队合作，共同解决问题，创造出优秀的产品。\n\n除了编程，我还喜欢阅读、旅行和运动。这些爱好让我保持身心健康，也为我的创作提供了灵感。'
            },
            projects: {
                title: '我的项目',
                content: '这里展示了我近期完成的一些项目，涵盖了前端开发、设计和全栈开发等多个领域。'
            },
            contact: {
                title: '联系信息',
                content: ''
            }
        };
        
        // 获取页面内容，优先使用配置中的内容，其次使用默认内容
        const page = config.pages && config.pages[pageName] ? config.pages[pageName] : defaultContent[pageName] || {
            title: '',
            content: ''
        };
        
        // 更新页面标题元素
        const titleElement = document.getElementById(`${pageName}-title`);
        if (titleElement && page.title) {
            titleElement.innerHTML = page.title;
        }
        
        // 更新页面内容元素
        if (page.content) {
            if (pageName === 'about') {
                const contentElement = document.getElementById(`${pageName}-content`);
                if (contentElement) {
                    // 处理about页面的内容，按换行符分割成段落
                    const paragraphs = page.content.split('\n\n');
                    // 使用文档片段提高性能
                    const fragment = document.createDocumentFragment();
                    
                    paragraphs.forEach(paragraph => {
                        if (paragraph.trim()) {
                            const p = document.createElement('p');
                            p.textContent = paragraph;
                            fragment.appendChild(p);
                        }
                    });
                    
                    contentElement.innerHTML = '';
                    contentElement.appendChild(fragment);
                }
            } else if (pageName === 'index') {
                // 处理首页的描述
                const descriptionElement = document.getElementById('hero-description');
                if (descriptionElement) {
                    descriptionElement.textContent = page.content;
                }
            } else if (pageName === 'projects') {
                // 处理项目页面的描述
                const descriptionElement = document.getElementById('projects-description');
                if (descriptionElement) {
                    descriptionElement.textContent = page.content;
                }
            }
        }
        
        return page;
    } catch (error) {
        console.error('加载页面内容失败:', error);
        // 返回默认内容
        return {
            title: '',
            content: ''
        };
    }
}

/**
 * 保存网站配置
 * @param {Object} config 配置对象
 * @returns {boolean} 是否保存成功
 */
export function saveConfig(config) {
    try {
        // 确保配置对象完整
        const completeConfig = {
            siteTitle: config.siteTitle || '个人网站',
            siteDescription: config.siteDescription || '这是一个个人网站',
            menuItems: config.menuItems || [
                { name: '首页', url: 'index.html' },
                { name: '关于我', url: 'apps/home/views/about.html' },
                { name: '我的项目', url: 'apps/home/views/projects.html' },
                { name: '联系方式', url: 'apps/home/views/contact.html' }
            ],
            themeColor: config.themeColor || '#4facfe',
            contact: config.contact || {
                email: '',
                phone: '',
                wechat: ''
            },
            pages: config.pages || {}
        };
        
        // 尝试保存配置
        localStorage.setItem('siteConfig', JSON.stringify(completeConfig));
        return true;
    } catch (error) {
        console.error('保存配置失败:', error);
        // 处理存储限制错误
        if (error.name === 'QuotaExceededError') {
            console.error('存储容量不足，无法保存配置');
            // 可以尝试清理一些不必要的数据
            try {
                localStorage.removeItem('siteVisits');
                localStorage.removeItem('userActivity');
                // 再次尝试保存
                localStorage.setItem('siteConfig', JSON.stringify(config));
                return true;
            } catch (e) {
                console.error('清理数据后仍然无法保存:', e);
            }
        }
        return false;
    }
}

/**
 * 检查登录状态
 * @returns {boolean} 是否已登录
 */
export function checkLoginStatus() {
    try {
        const userLoggedIn = localStorage.getItem('userLoggedIn');
        return userLoggedIn && atob(userLoggedIn) === 'true';
    } catch (error) {
        console.error('检查登录状态失败:', error);
        return false;
    }
}

/**
 * 登出用户
 */
export function logout() {
    try {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('loginTime');
        window.location.href = 'apps/home/views/login.html';
    } catch (error) {
        console.error('登出失败:', error);
        window.location.href = 'apps/home/views/login.html';
    }
}

/**
 * 显示成功消息
 * @param {string} message 消息内容
 * @param {number} duration 显示时长（毫秒）
 */
export function showSuccessMessage(message = '操作成功！', duration = 3000) {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, duration);
    }
}

/**
 * 显示错误消息
 * @param {string} message 消息内容
 * @param {number} duration 显示时长（毫秒）
 */
export function showErrorMessage(message = '操作失败！', duration = 3000) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, duration);
    }
}

/**
 * 初始化图片懒加载
 */
export function initLazyLoad() {
    // 检查浏览器是否支持IntersectionObserver
    if ('IntersectionObserver' in window) {
        // 配置观察器选项
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px 200px 0px', // 提前200px开始加载
            threshold: 0.01
        };
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    const src = image.getAttribute('data-src');
                    if (src) {
                        // 预加载图片
                        const preloadImage = new Image();
                        preloadImage.src = src;
                        preloadImage.onload = function() {
                            // 图片加载完成后再设置src，避免闪烁
                            image.src = src;
                            image.classList.remove('lazy');
                            image.classList.add('loaded');
                        };
                        
                        // 加载失败时的处理
                        preloadImage.onerror = function() {
                            // 尝试使用备用图片
                            const fallbackSrc = image.getAttribute('data-fallback');
                            if (fallbackSrc) {
                                image.src = fallbackSrc;
                                image.classList.remove('lazy');
                                image.classList.add('loaded');
                            }
                        };
                        
                        // 停止观察已处理的图片
                        imageObserver.unobserve(image);
                    }
                }
            });
        }, observerOptions);

        // 观察所有带有lazy类的图片
        const lazyImages = document.querySelectorAll('img.lazy');
        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // 降级方案：使用滚动事件
        let lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));
        let ticking = false;
        
        // 使用节流函数减少滚动事件触发频率
        function throttle(fn, delay) {
            let lastCall = 0;
            return function() {
                const now = new Date().getTime();
                if (now - lastCall < delay) {
                    return;
                }
                lastCall = now;
                return fn.apply(this, arguments);
            };
        }
        
        const throttledUpdate = throttle(updateLazyLoad, 100);
        
        if ('requestAnimationFrame' in window) {
            window.addEventListener('scroll', function() {
                if (!ticking) {
                    requestAnimationFrame(function() {
                        throttledUpdate();
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        } else {
            window.addEventListener('scroll', throttledUpdate);
        }
        
        function updateLazyLoad() {
            lazyImages.forEach(image => {
                if (isInViewport(image)) {
                    const src = image.getAttribute('data-src');
                    if (src) {
                        // 预加载图片
                        const preloadImage = new Image();
                        preloadImage.src = src;
                        preloadImage.onload = function() {
                            image.src = src;
                            image.classList.remove('lazy');
                            image.classList.add('loaded');
                        };
                        
                        preloadImage.onerror = function() {
                            const fallbackSrc = image.getAttribute('data-fallback');
                            if (fallbackSrc) {
                                image.src = fallbackSrc;
                                image.classList.remove('lazy');
                                image.classList.add('loaded');
                            }
                        };
                    }
                }
            });
            
            // 清理已加载的图片
            lazyImages = lazyImages.filter(image => image.classList.contains('lazy'));
            
            // 如果所有图片都已加载，移除滚动事件监听
            if (lazyImages.length === 0) {
                window.removeEventListener('scroll', throttledUpdate);
            }
        }
        
        function isInViewport(element) {
            const rect = element.getBoundingClientRect();
            const viewHeight = window.innerHeight || document.documentElement.clientHeight;
            const viewWidth = window.innerWidth || document.documentElement.clientWidth;
            
            return (
                rect.top <= viewHeight + 200 && // 提前200px
                rect.left <= viewWidth &&
                rect.bottom >= 0 &&
                rect.right >= 0
            );
        }
        
        // 初始检查
        updateLazyLoad();
        
        // 监听窗口 resize 事件
        window.addEventListener('resize', throttledUpdate);
        
        // 监听页面加载完成事件
        window.addEventListener('load', throttledUpdate);
    }
}

/**
 * 初始化导航栏滚动效果
 */
export function initNavbarScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function handleScroll() {
        const currentScrollY = window.scrollY;
        
        // 避免不必要的DOM操作
        if (currentScrollY > 50 && !header.classList.contains('scrolled')) {
            header.classList.add('scrolled');
        } else if (currentScrollY <= 50 && header.classList.contains('scrolled')) {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }

    // 使用requestAnimationFrame优化滚动事件
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }

    // 初始检查
    handleScroll();

    // 添加滚动事件监听
    window.addEventListener('scroll', requestTick);

    // 返回一个清理函数，用于移除事件监听器
    return function cleanup() {
        window.removeEventListener('scroll', requestTick);
    };
}

/**
 * 初始化深色模式
 */
export function initDarkMode() {
    // 检查用户的主题偏好
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 确定初始主题
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    // 应用主题
    if (initialTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // 创建主题切换按钮
    createThemeToggle();
}

/**
 * 创建主题切换按钮
 */
function createThemeToggle() {
    const navUl = document.querySelector('nav ul');
    if (!navUl) return;
    
    // 检查是否已存在切换按钮
    if (document.getElementById('theme-toggle')) {
        return;
    }
    
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
    button.style.background = 'none';
    button.style.border = 'none';
    button.style.color = 'var(--link-color)';
    button.style.fontSize = '1.2rem';
    button.style.cursor = 'pointer';
    button.style.padding = '0 0.5rem';
    button.style.transition = 'color 0.3s';
    
    // 添加点击事件
    button.addEventListener('click', toggleTheme);
    
    li.appendChild(button);
    navUl.appendChild(li);
}

/**
 * 切换主题
 */
export function toggleTheme() {
    const body = document.body;
    const button = document.getElementById('theme-toggle');
    
    // 切换主题类
    body.classList.toggle('dark-mode');
    
    // 更新按钮图标
    if (body.classList.contains('dark-mode')) {
        button.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        button.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }
}

/**
 * 初始化页面加载动画
 */
export function initPageLoader() {
    // 创建加载器元素
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = '<div class="loader-spinner"></div>';
    document.body.appendChild(loader);
    
    // 页面加载完成后隐藏加载器
    window.addEventListener('load', function() {
        setTimeout(() => {
            loader.classList.add('hidden');
            // 完全移除加载器
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 500);
        }, 300);
    });
}

/**
 * 初始化滚动显示动画
 */
export function initScrollReveal() {
    // 检查浏览器是否支持IntersectionObserver
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // 观察所有带有scroll-reveal类的元素
        document.querySelectorAll('.scroll-reveal').forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // 降级方案：直接显示所有元素
        document.querySelectorAll('.scroll-reveal').forEach(element => {
            element.classList.add('revealed');
        });
    }
}

/**
 * 添加动画类到元素
 * @param {string} selector CSS选择器
 * @param {string} animationClass 动画类名
 * @param {number} delay 延迟时间（毫秒）
 */
export function addAnimation(selector, animationClass, delay = 0) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add(animationClass);
        }, delay + (index * 100));
    });
}

/**
 * 表单验证类
 */
export class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.errors = {};
        if (this.form) {
            this.init();
        }
    }

    init() {
        // 为所有输入字段添加实时验证
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });

        // 表单提交验证
        this.form.addEventListener('submit', (e) => {
            if (!this.validate()) {
                e.preventDefault();
            }
        });
    }

    /**
     * 验证单个字段
     * @param {HTMLElement} field 表单字段
     * @returns {boolean} 是否验证通过
     */
    validateField(field) {
        let value = field.value.trim();
        const fieldName = field.name || field.id;
        const rules = this.getValidationRules(field);

        this.errors[fieldName] = [];

        // 对输入值进行转义，防止XSS攻击
        if (field.type !== 'password') {
            value = this.escapeHtml(value);
            field.value = value;
        }

        // 必填验证
        if (rules.required && !value) {
            this.errors[fieldName].push(rules.requiredMessage || '此字段为必填项');
        }

        // 最小长度验证
        if (rules.minLength && value.length < rules.minLength) {
            this.errors[fieldName].push(`最少需要 ${rules.minLength} 个字符`);
        }

        // 最大长度验证
        if (rules.maxLength && value.length > rules.maxLength) {
            this.errors[fieldName].push(`最多允许 ${rules.maxLength} 个字符`);
        }

        // 邮箱格式验证
        if (rules.email && value && !this.isValidEmail(value)) {
            this.errors[fieldName].push('请输入有效的邮箱地址');
        }

        // 手机号验证
        if (rules.phone && value && !this.isValidPhone(value)) {
            this.errors[fieldName].push('请输入有效的手机号码');
        }

        // 密码强度验证
        if (rules.password && value) {
            const passwordResult = this.validatePasswordStrength(value);
            if (passwordResult !== true) {
                this.errors[fieldName].push(passwordResult);
            }
        }

        // 自定义验证规则
        if (rules.custom && typeof rules.custom === 'function') {
            const customResult = rules.custom(value);
            if (customResult !== true) {
                this.errors[fieldName].push(customResult);
            }
        }

        // 显示错误信息
        if (this.errors[fieldName].length > 0) {
            this.showError(field, this.errors[fieldName][0]);
            return false;
        } else {
            this.clearError(field);
            return true;
        }
    }

    /**
     * 验证整个表单
     * @returns {boolean} 是否验证通过
     */
    validate() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * 获取字段的验证规则
     * @param {HTMLElement} field 表单字段
     * @returns {Object} 验证规则对象
     */
    getValidationRules(field) {
        const rules = {};

        // 从 data 属性获取验证规则
        if (field.dataset.required !== undefined) {
            rules.required = true;
            rules.requiredMessage = field.dataset.requiredMessage;
        }

        if (field.dataset.minLength) {
            rules.minLength = parseInt(field.dataset.minLength);
        }

        if (field.dataset.maxLength) {
            rules.maxLength = parseInt(field.dataset.maxLength);
        }

        if (field.dataset.email !== undefined) {
            rules.email = true;
        }

        if (field.dataset.phone !== undefined) {
            rules.phone = true;
        }

        if (field.dataset.password !== undefined) {
            rules.password = true;
        }

        return rules;
    }

    /**
     * 显示错误信息
     * @param {HTMLElement} field 表单字段
     * @param {string} message 错误信息
     */
    showError(field, message) {
        this.clearError(field);

        // 添加错误样式
        field.classList.add('error');

        // 创建错误提示元素
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;

        // 插入错误提示
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    /**
     * 清除错误信息
     * @param {HTMLElement} field 表单字段
     */
    clearError(field) {
        field.classList.remove('error');

        // 移除错误提示元素
        const parent = field.parentNode;
        const errorElement = parent.querySelector('.field-error');
        if (errorElement) {
            parent.removeChild(errorElement);
        }
    }

    /**
     * 验证邮箱格式
     * @param {string} email 邮箱地址
     * @returns {boolean} 是否有效
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 验证手机号格式
     * @param {string} phone 手机号码
     * @returns {boolean} 是否有效
     */
    isValidPhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }
    
    /**
     * 防XSS函数
     * @param {string} text 输入文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * 验证密码强度
     * @param {string} password 密码
     * @returns {string} 强度等级或错误信息
     */
    validatePasswordStrength(password) {
        if (password.length < 6) {
            return '密码长度至少为6个字符';
        }
        if (!/[A-Z]/.test(password)) {
            return '密码应包含至少一个大写字母';
        }
        if (!/[a-z]/.test(password)) {
            return '密码应包含至少一个小写字母';
        }
        if (!/\d/.test(password)) {
            return '密码应包含至少一个数字';
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return '密码应包含至少一个特殊字符';
        }
        return true;
    }
}

/**
 * 初始化表单验证
 * @param {string} formId 表单ID
 * @returns {FormValidator} 表单验证器实例
 */
export function initFormValidation(formId) {
    return new FormValidator(formId);
}

/**
 * 显示表单错误提示
 * @param {string} message 错误信息
 * @param {string} containerId 容器ID
 */
export function showFormError(message, containerId = 'form-error') {
    let container = document.getElementById(containerId);
    
    // 如果容器不存在，创建一个
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'form-error-container';
        document.body.appendChild(container);
    }

    container.innerHTML = `
        <div class="form-error-message">
            <i class="error-icon">⚠️</i>
            <span>${message}</span>
            <button class="error-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
        </div>
    `;
    container.style.display = 'block';

    // 3秒后自动隐藏
    setTimeout(() => {
        if (container) {
            container.style.display = 'none';
        }
    }, 3000);
}

/**
 * 显示表单成功提示
 * @param {string} message 成功信息
 * @param {string} containerId 容器ID
 */
export function showFormSuccess(message, containerId = 'form-success') {
    let container = document.getElementById(containerId);
    
    // 如果容器不存在，创建一个
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'form-success-container';
        document.body.appendChild(container);
    }

    container.innerHTML = `
        <div class="form-success-message">
            <i class="success-icon">✅</i>
            <span>${message}</span>
            <button class="success-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
        </div>
    `;
    container.style.display = 'block';

    // 3秒后自动隐藏
    setTimeout(() => {
        if (container) {
            container.style.display = 'none';
        }
    }, 3000);
}

/**
 * 初始化所有工具函数
 */
export function initUtils() {
    // 加载配置
    loadConfig();
    
    // 初始化导航栏滚动效果
    initNavbarScroll();
    
    // 初始化深色模式
    initDarkMode();
    
    // 初始化页面加载动画
    initPageLoader();
    
    // 初始化滚动显示动画
    initScrollReveal();
    
    // 初始化性能优化
    initPerformance();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUtils);
} else {
    initUtils();
}
