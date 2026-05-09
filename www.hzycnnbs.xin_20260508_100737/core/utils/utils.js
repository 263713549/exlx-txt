/**
 * 通用工具函数
 * 提供DOM操作、事件处理等通用功能
 */

/**
 * DOM操作工具
 */
export const DOM = {
    /**
     * 根据选择器获取元素
     * @param {string} selector CSS选择器
     * @param {HTMLElement} parent 父元素
     * @returns {HTMLElement|null}
     */
    get(selector, parent = document) {
        return parent.querySelector(selector);
    },
    
    /**
     * 根据选择器获取多个元素
     * @param {string} selector CSS选择器
     * @param {HTMLElement} parent 父元素
     * @returns {NodeList}
     */
    getAll(selector, parent = document) {
        return parent.querySelectorAll(selector);
    },
    
    /**
     * 创建元素
     * @param {string} tag 标签名
     * @param {Object} options 选项
     * @returns {HTMLElement}
     */
    create(tag, options = {}) {
        const element = document.createElement(tag);
        
        // 设置属性
        if (options.attributes) {
            Object.keys(options.attributes).forEach(key => {
                element.setAttribute(key, options.attributes[key]);
            });
        }
        
        // 设置样式
        if (options.style) {
            Object.assign(element.style, options.style);
        }
        
        // 设置类名
        if (options.className) {
            element.className = options.className;
        }
        
        // 设置文本内容
        if (options.textContent) {
            element.textContent = options.textContent;
        }
        
        // 设置HTML内容
        if (options.innerHTML) {
            element.innerHTML = options.innerHTML;
        }
        
        return element;
    },
    
    /**
     * 追加元素
     * @param {HTMLElement} parent 父元素
     * @param {HTMLElement} child 子元素
     */
    append(parent, child) {
        parent.appendChild(child);
    },
    
    /**
     * 插入元素
     * @param {HTMLElement} parent 父元素
     * @param {HTMLElement} child 子元素
     * @param {HTMLElement} reference 参考元素
     */
    insertBefore(parent, child, reference) {
        parent.insertBefore(child, reference);
    },
    
    /**
     * 移除元素
     * @param {HTMLElement} element 元素
     */
    remove(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    },
    
    /**
     * 清空元素内容
     * @param {HTMLElement} element 元素
     */
    empty(element) {
        element.innerHTML = '';
    },
    
    /**
     * 克隆元素
     * @param {HTMLElement} element 元素
     * @param {boolean} deep 是否深度克隆
     * @returns {HTMLElement}
     */
    clone(element, deep = true) {
        return element.cloneNode(deep);
    },
    
    /**
     * 检查元素是否包含类名
     * @param {HTMLElement} element 元素
     * @param {string} className 类名
     * @returns {boolean}
     */
    hasClass(element, className) {
        return element.classList.contains(className);
    },
    
    /**
     * 添加类名
     * @param {HTMLElement} element 元素
     * @param {string} className 类名
     */
    addClass(element, className) {
        element.classList.add(className);
    },
    
    /**
     * 移除类名
     * @param {HTMLElement} element 元素
     * @param {string} className 类名
     */
    removeClass(element, className) {
        element.classList.remove(className);
    },
    
    /**
     * 切换类名
     * @param {HTMLElement} element 元素
     * @param {string} className 类名
     * @returns {boolean}
     */
    toggleClass(element, className) {
        return element.classList.toggle(className);
    },
    
    /**
     * 设置元素样式
     * @param {HTMLElement} element 元素
     * @param {Object} styles 样式对象
     */
    setStyle(element, styles) {
        Object.assign(element.style, styles);
    },
    
    /**
     * 获取元素样式
     * @param {HTMLElement} element 元素
     * @param {string} property 样式属性
     * @returns {string}
     */
    getStyle(element, property) {
        return window.getComputedStyle(element)[property];
    },
    
    /**
     * 获取元素位置
     * @param {HTMLElement} element 元素
     * @returns {Object} 位置对象
     */
    getPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            bottom: rect.bottom + window.scrollY,
            right: rect.right + window.scrollX,
            width: rect.width,
            height: rect.height
        };
    },
    
    /**
     * 检查元素是否在视口中
     * @param {HTMLElement} element 元素
     * @param {Object} options 选项
     * @returns {boolean}
     */
    isInViewport(element, options = {}) {
        const { top = 0, left = 0, bottom = 0, right = 0 } = options;
        const rect = element.getBoundingClientRect();
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.top <= viewHeight + top &&
            rect.left <= viewWidth + left &&
            rect.bottom >= 0 - bottom &&
            rect.right >= 0 - right
        );
    }
};

/**
 * 事件处理工具
 */
export const Event = {
    /**
     * 添加事件监听器
     * @param {HTMLElement|Window|Document} element 元素
     * @param {string} type 事件类型
     * @param {Function} handler 事件处理函数
     * @param {Object} options 选项
     */
    on(element, type, handler, options = {}) {
        element.addEventListener(type, handler, options);
    },
    
    /**
     * 移除事件监听器
     * @param {HTMLElement|Window|Document} element 元素
     * @param {string} type 事件类型
     * @param {Function} handler 事件处理函数
     * @param {Object} options 选项
     */
    off(element, type, handler, options = {}) {
        element.removeEventListener(type, handler, options);
    },
    
    /**
     * 添加一次性事件监听器
     * @param {HTMLElement|Window|Document} element 元素
     * @param {string} type 事件类型
     * @param {Function} handler 事件处理函数
     * @param {Object} options 选项
     */
    once(element, type, handler, options = {}) {
        const onceHandler = (e) => {
            handler(e);
            this.off(element, type, onceHandler, options);
        };
        this.on(element, type, onceHandler, options);
    },
    
    /**
     * 触发事件
     * @param {HTMLElement} element 元素
     * @param {string} type 事件类型
     * @param {Object} detail 事件详情
     * @returns {boolean}
     */
    trigger(element, type, detail = {}) {
        const event = new CustomEvent(type, {
            bubbles: true,
            cancelable: true,
            detail
        });
        return element.dispatchEvent(event);
    },
    
    /**
     * 阻止事件默认行为
     * @param {Event} e 事件对象
     */
    preventDefault(e) {
        e.preventDefault();
    },
    
    /**
     * 停止事件冒泡
     * @param {Event} e 事件对象
     */
    stopPropagation(e) {
        e.stopPropagation();
    },
    
    /**
     * 停止事件传播
     * @param {Event} e 事件对象
     */
    stop(e) {
        e.preventDefault();
        e.stopPropagation();
    },
    
    /**
     * 节流函数
     * @param {Function} func 函数
     * @param {number} delay 延迟时间
     * @returns {Function}
     */
    throttle(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = new Date().getTime();
            if (now - lastCall < delay) {
                return;
            }
            lastCall = now;
            return func.apply(this, args);
        };
    },
    
    /**
     * 防抖函数
     * @param {Function} func 函数
     * @param {number} delay 延迟时间
     * @returns {Function}
     */
    debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
};

/**
 * 存储工具
 */
export const Storage = {
    /**
     * 存储数据
     * @param {string} key 键
     * @param {any} value 值
     * @returns {boolean}
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('存储数据失败:', error);
            return false;
        }
    },
    
    /**
     * 获取数据
     * @param {string} key 键
     * @param {any} defaultValue 默认值
     * @returns {any}
     */
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('获取数据失败:', error);
            return defaultValue;
        }
    },
    
    /**
     * 删除数据
     * @param {string} key 键
     * @returns {boolean}
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    },
    
    /**
     * 清空所有数据
     * @returns {boolean}
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    },
    
    /**
     * 检查键是否存在
     * @param {string} key 键
     * @returns {boolean}
     */
    has(key) {
        return localStorage.getItem(key) !== null;
    },
    
    /**
     * 获取所有键
     * @returns {string[]}
     */
    keys() {
        return Object.keys(localStorage);
    },
    
    /**
     * 获取存储大小
     * @returns {number}
     */
    size() {
        return localStorage.length;
    }
};

/**
 * 网络工具
 */
export const Network = {
    /**
     * 检查网络连接
     * @returns {boolean}
     */
    isOnline() {
        return navigator.onLine;
    },
    
    /**
     * 获取网络状态
     * @returns {string}
     */
    getNetworkStatus() {
        if (!navigator.onLine) return 'offline';
        
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            return connection.effectiveType || 'unknown';
        }
        
        return 'online';
    },
    
    /**
     * 发送GET请求
     * @param {string} url URL
     * @param {Object} options 选项
     * @returns {Promise}
     */
    get(url, options = {}) {
        return fetch(url, {
            method: 'GET',
            ...options
        }).then(response => response.json());
    },
    
    /**
     * 发送POST请求
     * @param {string} url URL
     * @param {Object} data 数据
     * @param {Object} options 选项
     * @returns {Promise}
     */
    post(url, data = {}, options = {}) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(data),
            ...options
        }).then(response => response.json());
    }
};

/**
 * 工具函数
 */
export const Utils = {
    /**
     * 生成随机ID
     * @param {number} length 长度
     * @returns {string}
     */
    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    /**
     * 格式化日期
     * @param {Date} date 日期
     * @param {string} format 格式
     * @returns {string}
     */
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },
    
    /**
     * 深拷贝对象
     * @param {Object} obj 对象
     * @returns {Object}
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * 合并对象
     * @param {Object} target 目标对象
     * @param {...Object} sources 源对象
     * @returns {Object}
     */
    merge(target, ...sources) {
        return Object.assign({}, target, ...sources);
    },
    
    /**
     * 检查对象是否为空
     * @param {Object} obj 对象
     * @returns {boolean}
     */
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    },
    
    /**
     * 检查值是否为undefined或null
     * @param {any} value 值
     * @returns {boolean}
     */
    isNil(value) {
        return value === undefined || value === null;
    },
    
    /**
     * 检查值是否为字符串
     * @param {any} value 值
     * @returns {boolean}
     */
    isString(value) {
        return typeof value === 'string';
    },
    
    /**
     * 检查值是否为数字
     * @param {any} value 值
     * @returns {boolean}
     */
    isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    },
    
    /**
     * 检查值是否为布尔值
     * @param {any} value 值
     * @returns {boolean}
     */
    isBoolean(value) {
        return typeof value === 'boolean';
    },
    
    /**
     * 检查值是否为对象
     * @param {any} value 值
     * @returns {boolean}
     */
    isObject(value) {
        return value !== null && typeof value === 'object';
    },
    
    /**
     * 检查值是否为数组
     * @param {any} value 值
     * @returns {boolean}
     */
    isArray(value) {
        return Array.isArray(value);
    },
    
    /**
     * 检查值是否为函数
     * @param {any} value 值
     * @returns {boolean}
     */
    isFunction(value) {
        return typeof value === 'function';
    },
    
    /**
     * 延迟函数
     * @param {number} ms 延迟时间
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    /**
     * 随机数
     * @param {number} min 最小值
     * @param {number} max 最大值
     * @returns {number}
     */
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * 限制数字范围
     * @param {number} value 值
     * @param {number} min 最小值
     * @param {number} max 最大值
     * @returns {number}
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * 格式化文件大小
     * @param {number} bytes 字节数
     * @returns {string}
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * 检查浏览器
     * @returns {Object}
     */
    getBrowser() {
        const userAgent = navigator.userAgent;
        let browser = 'unknown';
        
        if (userAgent.includes('Chrome')) {
            browser = 'chrome';
        } else if (userAgent.includes('Firefox')) {
            browser = 'firefox';
        } else if (userAgent.includes('Safari')) {
            browser = 'safari';
        } else if (userAgent.includes('Edge')) {
            browser = 'edge';
        } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
            browser = 'ie';
        }
        
        return {
            name: browser,
            version: navigator.appVersion,
            userAgent
        };
    },
    
    /**
     * 检查设备
     * @returns {Object}
     */
    getDevice() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
        const isDesktop = !isMobile && !isTablet;
        
        return {
            isMobile,
            isTablet,
            isDesktop,
            type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
        };
    },
    
    /**
     * 获取屏幕信息
     * @returns {Object}
     */
    getScreenInfo() {
        return {
            width: window.screen.width,
            height: window.screen.height,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth
        };
    }
};

// 导出所有工具
export default {
    DOM,
    Event,
    Storage,
    Network,
    Utils
};