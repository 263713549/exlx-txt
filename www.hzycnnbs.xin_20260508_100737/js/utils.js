/**
 * 公共工具函数
 * 包含网站配置加载、页面内容加载等通用功能
 */

/**
 * 加载网站配置
 * @returns {Object} 网站配置对象
 */
export function loadConfig() {
    try {
        console.log('开始加载配置');
        const config = JSON.parse(localStorage.getItem('siteConfig')) || {
            siteTitle: '个人网站',
            siteDescription: '这是一个个人网站',
            menuItems: [
                { name: '首页', url: 'index.html' },
                { name: '关于我', url: 'about.html' },
                { name: '我的项目', url: 'projects.html' },
                { name: '联系方式', url: 'contact.html' }
            ],
            themeColor: '#4facfe',
            contact: {
                email: '',
                phone: '',
                wechat: ''
            }
        };
        console.log('配置加载成功:', config);
        
        // 更新页面标题
        document.title = config.siteTitle;
        
        // 生成导航菜单
        const navUl = document.querySelector('nav ul');
        console.log('找到导航容器:', navUl);
        if (navUl) {
            navUl.innerHTML = '';
            console.log('开始生成导航菜单，菜单项数量:', config.menuItems.length);
            
            config.menuItems.forEach(item => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = item.url;
                a.textContent = item.name;
                li.appendChild(a);
                navUl.appendChild(li);
                console.log('添加菜单项:', item.name, item.url);
            });
            
            // 检查登录状态，只对登录用户显示管理链接
            if (localStorage.getItem('userLoggedIn') === 'true') {
                const adminLi = document.createElement('li');
                const adminA = document.createElement('a');
                adminA.href = 'admin.html';
                adminA.textContent = '管理';
                adminLi.appendChild(adminA);
                navUl.appendChild(adminLi);
            } else {
                // 未登录用户显示登录链接
                const loginLi = document.createElement('li');
                const loginA = document.createElement('a');
                loginA.href = 'login.html';
                loginA.textContent = '登录';
                loginLi.appendChild(loginA);
                navUl.appendChild(loginLi);
            }
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
                { name: '关于我', url: 'about.html' },
                { name: '我的项目', url: 'projects.html' },
                { name: '联系方式', url: 'contact.html' }
            ],
            themeColor: '#4facfe',
            contact: {
                email: '',
                phone: '',
                wechat: ''
            }
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
        const config = JSON.parse(localStorage.getItem('siteConfig')) || { pages: {} };
        
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
        
        const page = config.pages[pageName] || defaultContent[pageName] || {
            title: '',
            content: ''
        };
        
        // 更新页面标题元素
        const titleElement = document.getElementById(`${pageName}-title`);
        if (titleElement) {
            titleElement.innerHTML = page.title;
        }
        
        // 更新页面内容元素
        const contentElement = document.getElementById(`${pageName}-content`);
        if (contentElement && page.content) {
            if (pageName === 'about') {
                // 处理about页面的内容，按换行符分割成段落
                const paragraphs = page.content.split('\n\n');
                contentElement.innerHTML = '';
                
                paragraphs.forEach(paragraph => {
                    if (paragraph.trim()) {
                        const p = document.createElement('p');
                        p.textContent = paragraph;
                        contentElement.appendChild(p);
                    }
                });
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
 */
export function saveConfig(config) {
    try {
        localStorage.setItem('siteConfig', JSON.stringify(config));
        return true;
    } catch (error) {
        console.error('保存配置失败:', error);
        return false;
    }
}

/**
 * 检查登录状态
 * @returns {boolean} 是否已登录
 */
export function checkLoginStatus() {
    return localStorage.getItem('userLoggedIn') === 'true';
}

/**
 * 登出用户
 */
export function logout() {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
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
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    const src = image.getAttribute('data-src');
                    if (src) {
                        image.src = src;
                        image.classList.remove('lazy');
                        imageObserver.unobserve(image);
                    }
                }
            });
        });

        // 观察所有带有lazy类的图片
        document.querySelectorAll('img.lazy').forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // 降级方案：使用滚动事件
        let lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));
        
        if ('requestAnimationFrame' in window) {
            window.addEventListener('scroll', function() {
                requestAnimationFrame(updateLazyLoad);
            });
        } else {
            window.addEventListener('scroll', updateLazyLoad);
        }
        
        function updateLazyLoad() {
            lazyImages.forEach(image => {
                if (isInViewport(image)) {
                    const src = image.getAttribute('data-src');
                    if (src) {
                        image.src = src;
                        image.classList.remove('lazy');
                    }
                }
            });
            
            // 清理已加载的图片
            lazyImages = lazyImages.filter(image => image.classList.contains('lazy'));
        }
        
        function isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
        
        // 初始检查
        updateLazyLoad();
    }
}

/**
 * 初始化导航栏滚动效果
 */
export function initNavbarScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // 初始检查
    handleScroll();

    // 添加滚动事件监听
    window.addEventListener('scroll', handleScroll);
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
        const value = field.value.trim();
        const fieldName = field.name || field.id;
        const rules = this.getValidationRules(field);

        this.errors[fieldName] = [];

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
