// API服务类
class ApiService {
  constructor() {
    this.baseUrl = '/api';  // 使用相对路
//this.baseUrl = 'http://localhost:3000/api';
 //this.baseUrl = 'https://www.hzycnnbs.xin/api';
    this.token = localStorage.getItem('token');
  }

  // 设置认证令牌
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // 清除认证令牌
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // 构建请求头
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '请求失败');
      }

      return await response.json();
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // 认证相关API
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async register(username, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  // 内容管理API
  async getContent(page) {
    return await this.request(`/content/${page}`);
  }

  async updateContent(page, title, content) {
    return await this.request(`/content/${page}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content })
    });
  }

  async getAllContent() {
    return await this.request('/content');
  }

  // 图片管理API
  async uploadImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${this.baseUrl}/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '上传失败');
      }

      return await response.json();
    } catch (error) {
      console.error('图片上传错误:', error);
      throw error;
    }
  }

  async getImages() {
    return await this.request('/images');
  }

  async deleteImage(id) {
    return await this.request(`/images/${id}`, {
      method: 'DELETE'
    });
  }

  // 统计相关API
  async recordVisit(page) {
    return await this.request('/stats/record', {
      method: 'POST',
      body: JSON.stringify({ page })
    });
  }

  async getVisits() {
    return await this.request('/stats/visits');
  }

  async getLogs() {
    return await this.request('/stats/logs');
  }
}

// 导出API服务实例
export default new ApiService();
