/**
 * 主题模块
 * 处理网站主题相关的功能
 */

import { configManager } from '../../core/config/config.js';
import { DOM, Event, Storage } from '../../core/utils/utils.js';

/**
 * 初始化主题
 */
export function initTheme() {
    // 加载主题配置
    const themeConfig = configManager.get('theme');
    
    // 应用主题
    applyTheme(themeConfig);
    
    // 创建主题切换按钮
    createThemeToggle();
    
    // 监听主题变化
    listenForThemeChanges();
}

/**
 * 应用主题
 * @param {Object} config 主题配置
 */
function applyTheme(config) {
    // 设置主题颜色
    setThemeColors(config);
    
    // 设置字体
    setThemeFonts(config);
    
    // 设置深色模式
    if (config.darkMode) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
}

/**
 * 设置主题颜色
 * @param {Object} config 主题配置
 */
function setThemeColors(config) {
    // 创建样式变量
    const style = DOM.create('style');
    style.textContent = `
        :root {
            --primary-color: ${config.primaryColor};
            --secondary-color: ${config.secondaryColor};
            --bg-color: #ffffff;
            --text-color: #333333;
            --link-color: ${config.primaryColor};
            --border-color: #e0e0e0;
            --hover-color: rgba(102, 126, 234, 0.1);
        }
        
        .dark-mode {
            --bg-color: #1a1a1a;
            --text-color: #e0e0e0;
            --border-color: #333333;
            --hover-color: rgba(102, 126, 234, 0.2);
        }
    `;
    
    // 插入到文档头部
    DOM.append(document.head, style);
}

/**
 * 设置主题字体
 * @param {Object} config 主题配置
 */
function setThemeFonts(config) {
    // 设置全局字体
    DOM.setStyle(document.body, {
        fontFamily: config.fontFamily,
        fontSize: config.fontSize
    });
}

/**
 * 启用深色模式
 */
function enableDarkMode() {
    DOM.addClass(document.body, 'dark-mode');
    Storage.set('theme', 'dark');
    configManager.set('theme.darkMode', true);
}

/**
 * 禁用深色模式
 */
function disableDarkMode() {
    DOM.removeClass(document.body, 'dark-mode');
    Storage.set('theme', 'light');
    configManager.set('theme.darkMode', false);
}

/**
 * 切换主题
 */
export function toggleTheme() {
    const isDarkMode = DOM.hasClass(document.body, 'dark-mode');
    if (isDarkMode) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
    
    // 更新主题切换按钮
    updateThemeToggle();
}

/**
 * 创建主题切换按钮
 */
function createThemeToggle() {
    const navUl = DOM.get('nav ul');
    if (!navUl) return;
    
    // 检查是否已存在切换按钮
    if (DOM.get('#theme-toggle')) {
        return;
    }
    
    const li = DOM.create('li');
    const button = DOM.create('button', {
        id: 'theme-toggle',
        className: 'theme-toggle',
        textContent: DOM.hasClass(document.body, 'dark-mode') ? '🌙' : '☀️'
    });
    
    // 添加样式
    DOM.setStyle(button, {
        background: 'none',
        border: 'none',
        color: 'var(--link-color)',
        fontSize: '1.2rem',
        cursor: 'pointer',
        padding: '0 0.5rem',
        transition: 'color 0.3s'
    });
    
    // 添加点击事件
    Event.on(button, 'click', toggleTheme);
    
    li.appendChild(button);
    DOM.append(navUl, li);
}

/**
 * 更新主题切换按钮
 */
function updateThemeToggle() {
    const button = DOM.get('#theme-toggle');
    if (button) {
        button.textContent = DOM.hasClass(document.body, 'dark-mode') ? '🌙' : '☀️';
    }
}

/**
 * 监听主题变化
 */
function listenForThemeChanges() {
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    function handleSystemThemeChange(e) {
        const systemPrefersDark = e.matches;
        const currentTheme = Storage.get('theme');
        
        // 只有当用户没有明确设置主题时，才跟随系统
        if (!currentTheme) {
            if (systemPrefersDark) {
                enableDarkMode();
            } else {
                disableDarkMode();
            }
            updateThemeToggle();
        }
    }
    
    // 初始检查
    handleSystemThemeChange(mediaQuery);
    
    // 添加监听
    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

/**
 * 更新主题
 * @param {Object} newTheme 新主题配置
 */
export function updateTheme(newTheme) {
    const themeConfig = configManager.get('theme');
    const updatedTheme = { ...themeConfig, ...newTheme };
    configManager.set('theme', updatedTheme);
    applyTheme(updatedTheme);
    updateThemeToggle();
}

/**
 * 重置主题为默认值
 */
export function resetTheme() {
    const defaultTheme = {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        darkMode: false,
        fontSize: '16px',
        fontFamily: 'Poppins, sans-serif'
    };
    updateTheme(defaultTheme);
}

/**
 * 获取当前主题
 * @returns {Object} 主题配置
 */
export function getCurrentTheme() {
    return configManager.get('theme');
}

export default {
    initTheme,
    toggleTheme,
    updateTheme,
    resetTheme,
    getCurrentTheme
};