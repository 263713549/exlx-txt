const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Image, Log } = require('../models');
const { authenticateToken, authorizeAdmin } = require('./auth');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传JPG、PNG和GIF格式的图片'), false);
  }
};

// 配置multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 上传图片（需要管理员权限）
router.post('/upload', authenticateToken, authorizeAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' });
    }
    
    // 保存图片信息到数据库
    const image = await Image.create({
      filename: req.file.filename,
      path: `/static/images/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
    
    // 记录操作日志
    await Log.create({
      userId: req.user.userId,
      action: '上传图片',
      details: `上传了图片 ${req.file.filename}`,
      ip: req.ip
    });
    
    res.json(image);
  } catch (error) {
    console.error('上传图片失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取图片列表（需要管理员权限）
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const images = await Image.findAll();
    res.json(images);
  } catch (error) {
    console.error('获取图片列表失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 删除图片（需要管理员权限）
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找图片
    const image = await Image.findByPk(id);
    if (!image) {
      return res.status(404).json({ error: '图片不存在' });
    }
    
    // 删除文件
    const filePath = path.join(uploadDir, image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // 删除数据库记录
    await image.destroy();
    
    // 记录操作日志
    await Log.create({
      userId: req.user.userId,
      action: '删除图片',
      details: `删除了图片 ${image.filename}`,
      ip: req.ip
    });
    
    res.json({ message: '图片删除成功' });
  } catch (error) {
    console.error('删除图片失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;