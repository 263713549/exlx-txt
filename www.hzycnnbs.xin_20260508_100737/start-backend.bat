@echo off

REM 使用正确的Node.js v20.20.1路径
SET NODE_PATH=/www/server/nodejs/v20.20.1
SET NPM=/www/server/nodejs/v20.20.1/bin/npm
SET NODE=/www/server/nodejs/v20.20.1/bin/node

REM 进入backend目录
cd "%~dp0\backend"

echo 正在安装依赖...
%NPM% install --registry=https://registry.npmmirror.com/ --cache=/www/server/nodejs/cache/

if %ERRORLEVEL% equ 0 (
    echo 依赖安装成功！
    echo 正在启动后端服务...
    %NODE% app.js
) else (
    echo 依赖安装失败！
    pause
)
