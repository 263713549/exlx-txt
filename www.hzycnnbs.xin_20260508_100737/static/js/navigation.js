/**
 * 导航模块
 * 处理网站导航相关的功能
 */

import { configManager } from '../../core/config/config.js';
import { DOM, Event } from '../../core/utils/utils.js';

/**
 * 初始化导航
 */
export function initNavigation() {
    // 加载配置
    const menuConfig = configManager.get('menu');
    
    // 生成导航菜单
    generateNavigation(menuConfig);
    
    // 初始化导航滚动效果
    initNavbarScroll();
    
    // 初始化导航响应式
    initResponsiveNavigation();
}

/**
 * 生成导航菜单
 * @param {Object} config 菜单配置
 */
function generateNavigation(config) {
    const navUl = DOM.get('nav ul');
    if (!navUl) return;
    
    // 使用文档片段提高性能
    const fragment = document.createDocumentFragment();
    
    // 添加菜单项
    config.items.forEach(item => {
        const li = DOM.create('li');
        const a = DOM.create('a', {
            attributes: {
                href: item.url
            },
            textContent: item.name
        });
        
        // 添加图标
        if (item.icon) {
            const icon = DOM.create('i', {
                className: `fa fa-${item.icon}`
            });
            a.insertBefore(icon, a.firstChild);
            icon.style.marginRight = '8px';
        }
        
        li.appendChild(a);
        fragment.appendChild(li);
    });
    
    // 检查登录状态，添加管理或登录链接
    if (localStorage.getItem('userLoggedIn') === 'true') {
        // 添加管理链接
        const adminLi = DOM.create('li');
        const adminA = DOM.create('a', {
            attributes: {
                href: config.admin.url
            },
            textContent: config.admin.name
        });
        
        if (config.admin.icon) {
            const icon = DOM.create('i', {
                className: `fa fa-${config.admin.icon}`
            });
            adminA.insertBefore(icon, adminA.firstChild);
            icon.style.marginRight = '8px';
        }
        
        adminLi.appendChild(adminA);
        fragment.appendChild(adminLi);
    } else {
        // 添加登录链接
        const loginLi = DOM.create('li');
        const loginA = DOM.create('a', {
            attributes: {
                href: config.login.url
            },
            textContent: config.login.name
        });
        
        if (config.login.icon) {
            const icon = DOM.create('i', {
                className: `fa fa-${config.login.icon}`
            });
            loginA.insertBefore(icon, loginA.firstChild);
            icon.style.marginRight = '8px';
        }
        
        loginLi.appendChild(loginA);
        fragment.appendChild(loginLi);
    }
    
    // 一次性添加所有元素
    DOM.empty(navUl);
    DOM.append(navUl, fragment);
}

/**
 * 初始化导航栏滚动效果
 */
function initNavbarScroll() {
    const header = DOM.get('header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function handleScroll() {
        const currentScrollY = window.scrollY;
        
        // 避免不必要的DOM操作
        if (currentScrollY > 50 && !DOM.hasClass(header, 'scrolled')) {
            DOM.addClass(header, 'scrolled');
        } else if (currentScrollY <= 50 && DOM.hasClass(header, 'scrolled')) {
            DOM.removeClass(header, 'scrolled');
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
    Event.on(window, 'scroll', requestTick);
}

/**
 * 初始化响应式导航
 */
function initResponsiveNavigation() {
    const nav = DOM.get('nav');
    if (!nav) return;
    
    // 创建汉堡菜单按钮
    const menuButton = DOM.create('button', {
        className: 'menu-toggle',
        attributes: {
            'aria-label': '菜单'
        },
        innerHTML: '<i class="fa fa-bars"></i>'
    });
    
    // 添加样式
    DOM.setStyle(menuButton, {
        display: 'none',
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        color: 'var(--link-color)',
        cursor: 'pointer',
        padding: '0.5rem',
        zIndex: '1000'
    });
    
    // 插入到导航栏
    nav.insertBefore(menuButton, nav.firstChild);
    
    // 获取导航菜单
    const navUl = DOM.get('nav ul');
    if (!navUl) return;
    
    // 添加响应式样式
    const style = DOM.create('style');
    style.textContent = `
        @media (max-width: 768px) {
            .menu-toggle {
                display: block !important;
            }
            
            nav ul {
                position: fixed;
                top: 0;
                right: -100%;
                width: 250px;
                height: 100vh;
                background: var(--bg-color);
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: right 0.3s ease;
                box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
                z-index: 999;
            }
            
            nav ul.active {
                right: 0;
            }
            
            nav ul li {
                margin: 1rem 0;
            }
            
            nav ul li a {
                font-size: 1.2rem;
            }
        }
    `;
    DOM.append(document.head, style);
    
    // 添加点击事件
    Event.on(menuButton, 'click', function() {
        DOM.toggleClass(navUl, 'active');
        
        // 切换图标
        const icon = this.querySelector('i');
        if (DOM.hasClass(navUl, 'active')) {
            icon.className = 'fa fa-times';
        } else {
            icon.className = 'fa fa-bars';
        }
    });
    
    // 点击菜单外部关闭菜单
    Event.on(document, 'click', function(e) {
        if (!nav.contains(e.target) && DOM.hasClass(navUl, 'active')) {
            DOM.removeClass(navUl, 'active');
            const icon = menuButton.querySelector('i');
            icon.className = 'fa fa-bars';
        }
    });
    
    // 窗口大小变化时关闭菜单
    Event.on(window, 'resize', function() {
        if (window.innerWidth > 768) {
            DOM.removeClass(navUl, 'active');
            const icon = menuButton.querySelector('i');
            icon.className = 'fa fa-bars';
        }
    });
}

/**
 * 更新导航菜单
 */
export function updateNavigation() {
    const menuConfig = configManager.get('menu');
    generateNavigation(menuConfig);
}

/**
 * 添加导航项
 * @param {Object} item 导航项
 */
export function addNavItem(item) {
    const menuConfig = configManager.get('menu');
    menuConfig.items.push(item);
    configManager.set('menu', menuConfig);
    updateNavigation();
}

/**
 * 删除导航项
 * @param {number} index 索引
 */
export function removeNavItem(index) {
    const menuConfig = configManager.get('menu');
    if (index >= 0 && index < menuConfig.items.length) {
        menuConfig.items.splice(index, 1);
        configManager.set('menu', menuConfig);
        updateNavigation();
    }
}

export default {
    initNavigation,
    updateNavigation,
    addNavItem,
    removeNavItem
};