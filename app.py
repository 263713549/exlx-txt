from flask import Flask, render_template, request, redirect, url_for, send_from_directory
import os
import subprocess
import shutil

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['OUTPUT_FOLDER'] = 'outputs'
app.config['ALLOWED_EXTENSIONS'] = {'xlsx', 'xls', 'csv'}

# 创建目录
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    # 获取参数
    chunk_size = request.form.get('chunk_size', '1000')
    only_numbers = 'only_numbers' in request.form
    check_duplicates = 'check_duplicates' in request.form
    custom_names = request.form.get('custom_names', '').strip()
    
    # 获取上传的文件
    files = request.files.getlist('files')
    if not files:
        return "请选择要上传的文件", 400
    
    # 清空之前的输出
    for f in os.listdir(app.config['OUTPUT_FOLDER']):
        os.remove(os.path.join(app.config['OUTPUT_FOLDER'], f))
    
    # 保存上传的文件
    uploaded_files = []
    for file in files:
        if file and allowed_file(file.filename):
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(filepath)
            uploaded_files.append(filepath)
    
    # 构建命令
    cmd = ['python', 'xlsx_to_txt.py']
    
    # 添加输入文件
    cmd.extend(uploaded_files)
    
    # 添加参数
    if chunk_size:
        cmd.extend(['--chunk-size', chunk_size])
    
    if only_numbers:
        cmd.append('--only-numbers')
    
    if check_duplicates:
        cmd.append('--check-duplicates')
    
    if custom_names:
        cmd.extend(['--names', custom_names])
    
    # 添加输出目录
    cmd.extend(['--output-dir', app.config['OUTPUT_FOLDER']])
    
    # 执行脚本
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=os.getcwd())
        output = result.stdout
        if result.returncode != 0:
            output += "\n错误: " + result.stderr
    except Exception as e:
        output = f"执行出错: {str(e)}"
    
    # 获取生成的文件列表
    output_files = [f for f in os.listdir(app.config['OUTPUT_FOLDER']) if f.endswith('.txt')]
    
    return render_template('result.html', output=output, files=output_files)

@app.route('/download/<filename>')
def download(filename):
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename, as_attachment=True)

@app.route('/download_all')
def download_all():
    # 创建压缩包
    import zipfile
    zip_path = os.path.join(app.config['OUTPUT_FOLDER'], 'all_output.zip')
    
    with zipfile.ZipFile(zip_path, 'w') as zf:
        for f in os.listdir(app.config['OUTPUT_FOLDER']):
            if f.endswith('.txt'):
                zf.write(os.path.join(app.config['OUTPUT_FOLDER'], f), f)
    
    return send_from_directory(app.config['OUTPUT_FOLDER'], 'all_output.zip', as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)