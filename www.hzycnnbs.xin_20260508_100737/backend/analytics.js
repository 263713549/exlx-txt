// 访问统计系统
(function() {
    'use strict';

    const Analytics = {
        // 存储键名
        STORAGE_KEY: 'website_analytics',
        SESSION_KEY: 'session_id',
        API_URL: 'http://localhost:3000/api/analytics',

        // 获取或创建会话ID
        getSessionId: function() {
            let sessionId = localStorage.getItem(this.SESSION_KEY);
            if (!sessionId) {
                sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem(this.SESSION_KEY, sessionId);
            }
            return sessionId;
        },

        // 记录访问
        trackVisit: function() {
            const sessionId = this.getSessionId();
            const page = this.getCurrentPage();

            const visitRecord = {
                sessionId: sessionId,
                page: page,
                referrer: document.referrer || '直接访问',
                userAgent: navigator.userAgent,
                screen: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language
            };

            // 发送到后端
            this.sendToServer(visitRecord);

            console.log('[Analytics] 访问已记录:', visitRecord);
        },

        // 发送数据到后端
        sendToServer: async function(visitData) {
            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(visitData)
                });
                return await response.json();
            } catch (error) {
                // 静默处理错误，只在开发环境显示
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log('Analytics API unavailable, using local storage');
                }
                // 降级到本地存储
                this.saveToLocal(visitData);
            }
        },

        // 降级到本地存储
        saveToLocal: function(visitData) {
            const data = this.getData();
            data.recentVisits.unshift({
                ...visitData,
                timestamp: new Date().toISOString()
            });
            if (data.recentVisits.length > 100) {
                data.recentVisits = data.recentVisits.slice(0, 100);
            }
            this.saveData(data);
        },

        // 获取当前页面
        getCurrentPage: function() {
            const path = window.location.pathname;
            const filename = path.split('/').pop();

            const pageMap = {
                'index.html': 'index',
                'about.html': 'about',
                'projects.html': 'projects',
                'contact.html': 'contact',
                'gomoku.html': 'gomoku'
            };

            return pageMap[filename] || 'other';
        },

        // 获取统计数据
        getStats: async function() {
            try {
                const response = await fetch(`${this.API_URL}/stats`);
                if (!response.ok) throw new Error('Failed to get stats');
                return await response.json();
            } catch (error) {
                // 静默处理错误，只在开发环境显示
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log('Analytics API unavailable, using local data');
                }
                // 降级到本地数据
                return this.getLocalStats();
            }
        },

        // 降级获取本地统计
        getLocalStats: function() {
            const data = this.getData();
            return {
                totalVisits: data.totalVisits || 0,
                uniqueVisitors: data.uniqueVisitors || 0,
                pageViews: data.pageViews || {},
                last7Days: data.last7Days || [],
                growthRate: 0,
                weeklyVisits: 0
            };
        },

        // 获取本地数据
        getData: function() {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : this.getInitialData();
        },

        // 获取初始数据
        getInitialData: function() {
            return {
                totalVisits: 0,
                uniqueVisitors: 0,
                pageViews: {},
                last7Days: [],
                recentVisits: []
            };
        },

        // 保存数据
        saveData: function(data) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        },

        // 清除数据
        clearData: async function() {
            try {
                await fetch(this.API_URL, {
                    method: 'DELETE'
                });
                localStorage.removeItem(this.STORAGE_KEY);
                localStorage.removeItem(this.SESSION_KEY);
            } catch (error) {
                console.error('Error clearing data:', error);
                localStorage.removeItem(this.STORAGE_KEY);
                localStorage.removeItem(this.SESSION_KEY);
            }
        },

        // 初始化
        init: function() {
            this.trackVisit();
        }
    };

    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            Analytics.init();
        });
    } else {
        Analytics.init();
    }

    // 导出到全局
    window.WebsiteAnalytics = Analytics;
})();