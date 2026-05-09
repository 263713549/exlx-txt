/**
 * 配置管理系统
 * 用于集中管理网站的所有配置信息
 */

// 默认配置
const defaultConfig = {
    // 网站基本信息
    site: {
        title: '个人网站',
        description: '这是一个个人网站',
        keywords: '个人网站,前端开发,设计',
        author: '开发者',
        version: '1.0.0'
    },
    
    // 导航菜单
    menu: {
        items: [
            { name: '首页', url: 'index.html', icon: 'home' },
            { name: '关于我', url: 'apps/home/views/about.html', icon: 'user' },
            { name: '我的项目', url: 'apps/home/views/projects.html', icon: 'folder' },
            { name: '联系方式', url: 'apps/home/views/contact.html', icon: 'envelope' }
        ],
        admin: {
            name: '管理',
            url: 'apps/admin/views/admin.html',
            icon: 'cog'
        },
        login: {
            name: '登录',
            url: 'apps/home/views/login.html',
            icon: 'sign-in'
        }
    },
    
    // 主题设置
    theme: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        darkMode: false,
        fontSize: '16px',
        fontFamily: 'Poppins, sans-serif'
    },
    
    // 联系信息
    contact: {
        email: '',
        phone: '',
        wechat: '',
        qq: '',
        github: '',
        linkedin: '',
        facebook: '',
        twitter: '',
        instagram: ''
    },
    
    // 页面内容
    pages: {
        index: {
            title: '你好，我是 <span>开发者</span>',
            content: '专注于前端开发和设计，创造美观、响应式的网站',
            heroImage: 'static/images/hero-bg.jpg'
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
    },
    
    // 功能设置
    features: {
        lazyLoad: true,
        darkMode: true,
        scrollReveal: true,
        pageLoader: true,
        analytics: true
    },
    
    // 性能设置
    performance: {
        imageCompression: true,
        minifyCSS: true,
        minifyJS: true,
        cacheEnabled: true
    },
    
    // 安全设置
    security: {
        xssProtection: true,
        csrfProtection: true,
        contentSecurityPolicy: true
    }
};

/**
 * 配置管理类
 */
class ConfigManager {
    constructor() {
        this.config = this.loadConfig();
    }
    
    /**
     * 从localStorage加载配置
     * @returns {Object} 配置对象
     */
    loadConfig() {
        try {
            const storedConfig = localStorage.getItem('siteConfig');
            return storedConfig ? JSON.parse(storedConfig) : defaultConfig;
        } catch (error) {
            console.error('加载配置失败:', error);
            return defaultConfig;
        }
    }
    
    /**
     * 保存配置到localStorage
     * @returns {boolean} 是否保存成功
     */
    saveConfig() {
        try {
            localStorage.setItem('siteConfig', JSON.stringify(this.config));
            return true;
        } catch (error) {
            console.error('保存配置失败:', error);
            // 处理存储限制错误
            if (error.name === 'QuotaExceededError') {
                console.error('存储容量不足，无法保存配置');
                // 尝试清理一些不必要的数据
                try {
                    localStorage.removeItem('siteVisits');
                    localStorage.removeItem('userActivity');
                    // 再次尝试保存
                    localStorage.setItem('siteConfig', JSON.stringify(this.config));
                    return true;
                } catch (e) {
                    console.error('清理数据后仍然无法保存:', e);
                }
            }
            return false;
        }
    }
    
    /**
     * 获取配置
     * @param {string} path 配置路径，如 'site.title'
     * @returns {any} 配置值
     */
    get(path) {
        if (!path) return this.config;
        
        const keys = path.split('.');
        let value = this.config;
        
        for (const key of keys) {
            if (value === undefined || value === null) {
                return undefined;
            }
            value = value[key];
        }
        
        return value;
    }
    
    /**
     * 设置配置
     * @param {string} path 配置路径，如 'site.title'
     * @param {any} value 配置值
     * @returns {boolean} 是否设置成功
     */
    set(path, value) {
        if (!path) return false;
        
        const keys = path.split('.');
        let current = this.config;
        
        // 遍历到倒数第二个键
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key]) {
                current[key] = {};
            }
            current = current[key];
        }
        
        // 设置最后一个键的值
        current[keys[keys.length - 1]] = value;
        
        // 保存配置
        return this.saveConfig();
    }
    
    /**
     * 重置配置为默认值
     * @returns {boolean} 是否重置成功
     */
    reset() {
        this.config = JSON.parse(JSON.stringify(defaultConfig));
        return this.saveConfig();
    }
    
    /**
     * 导出配置
     * @returns {string} 配置的JSON字符串
     */
    export() {
        return JSON.stringify(this.config, null, 2);
    }
    
    /**
     * 导入配置
     * @param {string} configStr 配置的JSON字符串
     * @returns {boolean} 是否导入成功
     */
    import(configStr) {
        try {
            const importedConfig = JSON.parse(configStr);
            this.config = importedConfig;
            return this.saveConfig();
        } catch (error) {
            console.error('导入配置失败:', error);
            return false;
        }
    }
    
    /**
     * 合并配置
     * @param {Object} newConfig 新配置
     * @returns {boolean} 是否合并成功
     */
    merge(newConfig) {
        try {
            this.config = { ...this.config, ...newConfig };
            return this.saveConfig();
        } catch (error) {
            console.error('合并配置失败:', error);
            return false;
        }
    }
}

// 导出配置管理器实例
export const configManager = new ConfigManager();

// 导出默认配置
export { defaultConfig };

// 导出配置管理类
export default ConfigManager;