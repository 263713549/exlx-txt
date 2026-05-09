// 更新导航菜单配置
function updateNavigation() {
    // 获取当前配置
    const config = JSON.parse(localStorage.getItem('siteConfig')) || {
        siteTitle: '个人网站',
        siteDescription: '这是一个个人网站',
        menuItems: [
            { name: '首页', url: 'index.html' },
            { name: '关于我', url: 'about.html' },
            { name: '博客', url: 'blog.html' },
            { name: '联系方式', url: 'contact.html' }
        ],
        themeColor: '#4facfe',
        contact: {
            email: '',
            phone: '',
            wechat: ''
        }
    };
    
    // 查找并替换博客菜单项
    const blogIndex = config.menuItems.findIndex(item => item.name === '博客');
    if (blogIndex !== -1) {
        config.menuItems[blogIndex] = { name: '我的项目', url: 'projects.html' };
    } else {
        // 如果没有博客菜单项，添加我的项目
        config.menuItems.push({ name: '我的项目', url: 'projects.html' });
    }
    
    // 保存更新后的配置
    localStorage.setItem('siteConfig', JSON.stringify(config));
    console.log('导航菜单已更新：博客 -> 我的项目');
    console.log('新的导航菜单：', config.menuItems);
}

// 执行更新
updateNavigation();

// 提示用户
alert('导航菜单已更新：博客 -> 我的项目');
