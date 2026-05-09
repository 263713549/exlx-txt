// 简单的语法检查脚本
const fs = require('fs');

// 读取admin.html文件
const content = fs.readFileSync('admin.html', 'utf8');

// 提取JavaScript代码
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/g);

if (scriptMatch) {
    scriptMatch.forEach((script, index) => {
        // 移除<script>标签
        const jsCode = script.replace(/<script>|<\/script>/g, '');
        
        try {
            // 尝试解析JavaScript代码
            new Function(jsCode);
            console.log(`Script block ${index + 1}: Syntax OK`);
        } catch (error) {
            console.error(`Script block ${index + 1}: Syntax Error`);
            console.error(error.message);
        }
    });
}

// 检查常见的JavaScript错误模式
const errors = [];

// 检查未闭合的括号
const openBraces = (content.match(/{/g) || []).length;
const closeBraces = (content.match(/}/g) || []).length;
if (openBraces !== closeBraces) {
    errors.push(`Unbalanced braces: ${openBraces} opening, ${closeBraces} closing`);
}

const openParens = (content.match(/\(/g) || []).length;
const closeParens = (content.match(/\)/g) || []).length;
if (openParens !== closeParens) {
    errors.push(`Unbalanced parentheses: ${openParens} opening, ${closeParens} closing`);
}

// 检查未闭合的方括号
const openBrackets = (content.match(/\[/g) || []).length;
const closeBrackets = (content.match(/\]/g) || []).length;
if (openBrackets !== closeBrackets) {
    errors.push(`Unbalanced brackets: ${openBrackets} opening, ${closeBrackets} closing`);
}

if (errors.length > 0) {
    console.log('\nPotential issues found:');
    errors.forEach(error => console.log(`- ${error}`));
} else {
    console.log('\nNo obvious syntax errors found!');
}

console.log('\nFile statistics:');
console.log(`- Total lines: ${content.split('\n').length}`);
console.log(`- File size: ${(content.length / 1024).toFixed(2)} KB`);
console.log(`- Script blocks: ${scriptMatch ? scriptMatch.length : 0}`);