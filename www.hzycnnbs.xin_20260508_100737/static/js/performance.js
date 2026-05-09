/**
 * 性能优化模块
 * 处理资源加载和性能相关的功能
 */

import { DOM, Event, Network } from '../../core/utils/utils.js';

/**
 * 初始化性能优化
 */
export function initPerformance() {
    // 优化图片加载
    optimizeImageLoading();
    
    // 优化CSS加载
    optimizeCSSLoading();
    
    // 优化JavaScript加载
    optimizeJSLoading();
    
    // 优化资源缓存
    optimizeResourceCaching();
    
    // 优化页面加载速度
    optimizePageLoad();
    
    // 监控性能指标
    monitorPerformance();
}

/**
 * 优化图片加载
 */
function optimizeImageLoading() {
    // 优化图片尺寸
    optimizeImageSizes();
    
    // 使用适当的图片格式
    optimizeImageFormats();
}

/**
 * 初始化图片懒加载
 */
function initLazyLoad() {
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
        const lazyImages = DOM.getAll('img.lazy');
        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // 降级方案：使用滚动事件
        let lazyImages = [].slice.call(DOM.getAll('img.lazy'));
        let ticking = false;
        
        // 使用节流函数减少滚动事件触发频率
        function throttle(func, delay) {
            let lastCall = 0;
            return function(...args) {
                const now = new Date().getTime();
                if (now - lastCall < delay) {
                    return;
                }
                lastCall = now;
                return func.apply(this, args);
            };
        }
        
        const throttledUpdate = throttle(updateLazyLoad, 100);
        
        if ('requestAnimationFrame' in window) {
            Event.on(window, 'scroll', function() {
                if (!ticking) {
                    requestAnimationFrame(function() {
                        throttledUpdate();
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        } else {
            Event.on(window, 'scroll', throttledUpdate);
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
            lazyImages = lazyImages.filter(image => DOM.hasClass(image, 'lazy'));
            
            // 如果所有图片都已加载，移除滚动事件监听
            if (lazyImages.length === 0) {
                Event.off(window, 'scroll', throttledUpdate);
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
        Event.on(window, 'resize', throttledUpdate);
        
        // 监听页面加载完成事件
        Event.on(window, 'load', throttledUpdate);
    }
}

/**
 * 优化图片尺寸
 */
function optimizeImageSizes() {
    // 为图片添加适当的尺寸属性
    const images = DOM.getAll('img');
    images.forEach(image => {
        if (!image.getAttribute('width') && !image.getAttribute('height')) {
            // 尝试获取图片的自然尺寸
            const naturalWidth = image.naturalWidth;
            const naturalHeight = image.naturalHeight;
            
            if (naturalWidth && naturalHeight) {
                image.setAttribute('width', naturalWidth);
                image.setAttribute('height', naturalHeight);
            }
        }
    });
}

/**
 * 优化图片格式
 */
function optimizeImageFormats() {
    // 检查浏览器是否支持WebP格式
    const webpSupported = checkWebPSupport();
    
    if (webpSupported) {
        // 替换图片为WebP格式
        const images = DOM.getAll('img');
        images.forEach(image => {
            const src = image.getAttribute('src');
            if (src && (src.endsWith('.jpg') || src.endsWith('.jpeg') || src.endsWith('.png'))) {
                const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
                image.setAttribute('src', webpSrc);
                // 添加备用图片
                image.setAttribute('data-fallback', src);
            }
        });
    }
}

/**
 * 检查WebP格式支持
 * @returns {boolean}
 */
function checkWebPSupport() {
    const elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d')) && elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * 优化CSS加载
 */
function optimizeCSSLoading() {
    // 内联关键CSS
    inlineCriticalCSS();
    
    // 延迟加载非关键CSS
    lazyLoadCSS();
    
    // 使用CSS变量
    useCSSVariables();
}

/**
 * 内联关键CSS
 */
function inlineCriticalCSS() {
    // 这里可以添加关键CSS的内联逻辑
    // 例如，将首屏所需的CSS直接内联到HTML中
}

/**
 * 延迟加载非关键CSS
 */
function lazyLoadCSS() {
    // 查找所有带有lazy-load类的link标签
    const lazyCSS = DOM.getAll('link.lazy-load');
    lazyCSS.forEach(link => {
        // 监听页面加载完成事件
        Event.on(window, 'load', function() {
            link.setAttribute('rel', 'stylesheet');
        });
    });
}

/**
 * 使用CSS变量
 */
function useCSSVariables() {
    // 确保CSS变量已定义
    if (!DOM.get('style#css-variables')) {
        const style = DOM.create('style', {
            id: 'css-variables',
            textContent: `
                :root {
                    --primary-color: #667eea;
                    --secondary-color: #764ba2;
                    --bg-color: #ffffff;
                    --text-color: #333333;
                    --link-color: #667eea;
                    --border-color: #e0e0e0;
                    --hover-color: rgba(102, 126, 234, 0.1);
                }
                
                .dark-mode {
                    --bg-color: #1a1a1a;
                    --text-color: #e0e0e0;
                    --border-color: #333333;
                    --hover-color: rgba(102, 126, 234, 0.2);
                }
            `
        });
        DOM.append(document.head, style);
    }
}

/**
 * 优化JavaScript加载
 */
function optimizeJSLoading() {
    // 延迟加载非关键JavaScript
    deferNonCriticalJS();
    
    // 使用模块化加载
    useModuleLoading();
    
    // 压缩JavaScript代码
    // 注意：这通常在构建过程中完成
}

/**
 * 延迟加载非关键JavaScript
 */
function deferNonCriticalJS() {
    // 查找所有带有defer属性的script标签
    const scripts = DOM.getAll('script');
    scripts.forEach(script => {
        if (!script.hasAttribute('defer') && !script.hasAttribute('async') && !script.hasAttribute('type') && !script.src.includes('critical')) {
            script.setAttribute('defer', 'defer');
        }
    });
}

/**
 * 使用模块化加载
 */
function useModuleLoading() {
    // 这里可以添加模块化加载的逻辑
    // 例如，使用动态导入来加载非关键模块
}

/**
 * 优化资源缓存
 */
function optimizeResourceCaching() {
    // 设置适当的缓存头
    // 注意：这通常在服务器端完成
    
    // 使用浏览器缓存
    useBrowserCaching();
    
    // 实现资源版本控制
    implementResourceVersioning();
}

/**
 * 使用浏览器缓存
 */
function useBrowserCaching() {
    // 这里可以添加浏览器缓存的逻辑
    // 例如，设置资源的缓存时间
}

/**
 * 实现资源版本控制
 */
function implementResourceVersioning() {
    // 为静态资源添加版本号
    const resources = DOM.getAll('link[rel="stylesheet"], script[src], img[src]');
    const version = 'v1.0.0';
    
    resources.forEach(resource => {
        let src = resource.getAttribute('href') || resource.getAttribute('src');
        if (src && !src.includes('?v=') && !src.includes('://')) {
            const separator = src.includes('?') ? '&' : '?';
            const newSrc = src + separator + 'v=' + version;
            if (resource.tagName === 'LINK') {
                resource.setAttribute('href', newSrc);
            } else {
                resource.setAttribute('src', newSrc);
            }
        }
    });
}

/**
 * 优化页面加载速度
 */
function optimizePageLoad() {
    // 减少HTTP请求
    reduceHTTPRequests();
    
    // 优化关键渲染路径
    optimizeCriticalRenderingPath();
    
    // 使用预加载和预连接
    usePreloading();
}

/**
 * 减少HTTP请求
 */
function reduceHTTPRequests() {
    // 这里可以添加减少HTTP请求的逻辑
    // 例如，合并CSS和JavaScript文件
}

/**
 * 优化关键渲染路径
 */
function optimizeCriticalRenderingPath() {
    // 这里可以添加优化关键渲染路径的逻辑
    // 例如，内联关键CSS，延迟加载非关键资源
}

/**
 * 使用预加载和预连接
 */
function usePreloading() {
    // 添加预连接
    const preconnect = DOM.create('link', {
        attributes: {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com'
        }
    });
    DOM.append(document.head, preconnect);
    
    // 添加预加载
    const preload = DOM.create('link', {
        attributes: {
            rel: 'preload',
            href: 'static/css/style.css',
            as: 'style'
        }
    });
    DOM.append(document.head, preload);
    
    // 添加预加载字体
    const preloadFont = DOM.create('link', {
        attributes: {
            rel: 'preload',
            href: 'static/fonts/poppins.woff2',
            as: 'font',
            type: 'font/woff2',
            crossorigin: 'anonymous'
        }
    });
    DOM.append(document.head, preloadFont);
}

/**
 * 监控性能指标
 */
function monitorPerformance() {
    // 监听页面加载完成事件
    Event.on(window, 'load', function() {
        // 测量页面加载时间
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log('页面加载时间:', loadTime, 'ms');
        
        // 测量首屏时间
        const firstPaint = window.performance.timing.firstPaint || 0;
        const firstContentfulPaint = window.performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;
        console.log('首屏时间:', firstContentfulPaint, 'ms');
        
        // 测量最大内容绘制
        const largestContentfulPaint = window.performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0;
        console.log('最大内容绘制:', largestContentfulPaint, 'ms');
        
        // 测量累积布局偏移
        const layoutShift = window.performance.getEntriesByType('layout-shift').reduce((total, entry) => total + entry.value, 0);
        console.log('累积布局偏移:', layoutShift);
    });
    
    // 监听性能标记
    if ('performance' in window && 'mark' in window.performance) {
        // 添加性能标记
        window.performance.mark('app-start');
        
        // 监听页面加载完成事件
        Event.on(window, 'load', function() {
            window.performance.mark('app-end');
            window.performance.measure('app-load', 'app-start', 'app-end');
            const measure = window.performance.getEntriesByName('app-load')[0];
            if (measure) {
                console.log('应用加载时间:', measure.duration, 'ms');
            }
        });
    }
}

/**
 * 获取性能指标
 * @returns {Object}
 */
export function getPerformanceMetrics() {
    if (!('performance' in window)) {
        return null;
    }
    
    const timing = window.performance.timing;
    const metrics = {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: window.performance.timing.firstPaint || 0,
        firstContentfulPaint: window.performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        largestContentfulPaint: window.performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0,
        cumulativeLayoutShift: window.performance.getEntriesByType('layout-shift').reduce((total, entry) => total + entry.value, 0)
    };
    
    return metrics;
}

/**
 * 优化网络请求
 */
export function optimizeNetworkRequests() {
    // 检查网络状态
    const networkStatus = Network.getNetworkStatus();
    console.log('网络状态:', networkStatus);
    
    // 根据网络状态调整资源加载
    if (networkStatus === 'slow-2g' || networkStatus === '2g') {
        // 延迟加载非关键资源
        const nonCriticalResources = DOM.getAll('script[data-non-critical], link[data-non-critical]');
        nonCriticalResources.forEach(resource => {
            resource.setAttribute('data-deferred', 'true');
        });
    }
}

export default {
    initPerformance,
    getPerformanceMetrics,
    optimizeNetworkRequests
};