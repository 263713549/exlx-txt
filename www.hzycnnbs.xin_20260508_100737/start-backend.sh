#!/bin/bash

# 使用正确的Node.js v20.20.1路径
NODE_PATH="/www/server/nodejs/v20.20.1"
NPM="$NODE_PATH/bin/npm"
NODE="$NODE_PATH/bin/node"

# 进入backend目录
cd "$(dirname "$0")/backend"

echo "正在安装依赖..."
$NPM install --registry=https://registry.npmmirror.com/ --cache=/www/server/nodejs/cache/

if [ $? -eq 0 ]; then
    echo "依赖安装成功！"
    echo "正在启动后端服务..."
    $NODE app.js
else
    echo "依赖安装失败！"
    read -p "按Enter键退出..."
fi
