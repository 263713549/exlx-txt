/**
 * 模块化JavaScript管理
 * 用于加载和管理不同的JavaScript模块
 */

// 模块列表
const modules = {
    // 工具模块
    utils: {
        path: 'static/js/utils.js',
        loaded: false
    },
    
    // 分析模块
    analytics: {
        path: 'static/js/analytics.js',
        loaded: false
    },
    
    // 导航模块
    navigation: {
        path: 'static/js/navigation.js',
        loaded: false
    },
    
    // 主题模块
    theme: {
        path: 'static/js/theme.js',
        loaded: false
    },
    
    // 表单模块
    form: {
        path: 'static/js/form.js',
        loaded: false
    },
    
    // 图片模块
    image: {
        path: 'static/js/image.js',
        loaded: false
    },
    
    // 动画模块
    animation: {
        path: 'static/js/animation.js',
        loaded: false
    },
    
    // 响应式模块
    responsive: {
        path: 'static/js/responsive.js',
        loaded: false
    }
};

/**
 * 模块管理类
 */
class ModuleManager {
    constructor() {
        this.modules = modules;
        this.loadedModules = {};
    }
    
    /**
     * 加载模块
     * @param {string} name 模块名称
     * @returns {Promise}
     */
    async loadModule(name) {
        // 检查模块是否存在
        if (!this.modules[name]) {
            console.error(`模块 ${name} 不存在`);
            return Promise.reject(new Error(`模块 ${name} 不存在`));
        }
        
        // 检查模块是否已加载
        if (this.modules[name].loaded) {
            return this.loadedModules[name];
        }
        
        try {
            // 动态导入模块
            const module = await import(`./${this.modules[name].path}`);
            
            // 标记模块为已加载
            this.modules[name].loaded = true;
            this.loadedModules[name] = module;
            
            console.log(`模块 ${name} 加载成功`);
            return module;
        } catch (error) {
            console.error(`模块 ${name} 加载失败:`, error);
            return Promise.reject(error);
        }
    }
    
    /**
     * 批量加载模块
     * @param {string[]} names 模块名称数组
     * @returns {Promise<Object>}
     */
    async loadModules(names) {
        const promises = names.map(name => this.loadModule(name));
        const results = await Promise.all(promises);
        
        const modules = {};
        names.forEach((name, index) => {
            modules[name] = results[index];
        });
        
        return modules;
    }
    
    /**
     * 加载所有模块
     * @returns {Promise<Object>}
     */
    async loadAllModules() {
        const names = Object.keys(this.modules);
        return this.loadModules(names);
    }
    
    /**
     * 检查模块是否已加载
     * @param {string} name 模块名称
     * @returns {boolean}
     */
    isModuleLoaded(name) {
        return this.modules[name] && this.modules[name].loaded;
    }
    
    /**
     * 获取已加载的模块
     * @param {string} name 模块名称
     * @returns {Object|null}
     */
    getModule(name) {
        return this.loadedModules[name] || null;
    }
    
    /**
     * 重新加载模块
     * @param {string} name 模块名称
     * @returns {Promise}
     */
    async reloadModule(name) {
        // 标记模块为未加载
        if (this.modules[name]) {
            this.modules[name].loaded = false;
            delete this.loadedModules[name];
        }
        
        // 重新加载模块
        return this.loadModule(name);
    }
    
    /**
     * 卸载模块
     * @param {string} name 模块名称
     * @returns {boolean}
     */
    unloadModule(name) {
        if (this.modules[name]) {
            this.modules[name].loaded = false;
            delete this.loadedModules[name];
            console.log(`模块 ${name} 卸载成功`);
            return true;
        }
        return false;
    }
    
    /**
     * 卸载所有模块
     */
    unloadAllModules() {
        Object.keys(this.modules).forEach(name => {
            this.unloadModule(name);
        });
    }
    
    /**
     * 获取模块状态
     * @returns {Object}
     */
    getModulesStatus() {
        const status = {};
        Object.keys(this.modules).forEach(name => {
            status[name] = {
                loaded: this.modules[name].loaded,
                path: this.modules[name].path
            };
        });
        return status;
    }
}

// 导出模块管理器实例
export const moduleManager = new ModuleManager();

// 导出模块管理类
export default ModuleManager;