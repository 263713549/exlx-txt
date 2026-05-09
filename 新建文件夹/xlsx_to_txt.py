#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
XLSX to TXT Converter
=====================
功能：将 Excel 文件（xlsx/xls/csv）转换为 TXT 格式，支持分块导出和自定义文件名

依赖安装：
----------
pip install openpyxl xlrd

使用方法：
----------
1. 基本用法
python xlsx_to_txt.py your_file.xlsx -o output.txt

2. 分块导出（每100行一个文件）
python xlsx_to_txt.py your_file.xlsx --chunk-size 100 -o "output_{chunk}.txt"

3. 自定义文件名列表
python xlsx_to_txt.py your_file.xlsx --chunk-size 100 --names "河北棋牌,辽宁棋牌,山东棋牌"

4. 从文件读取自定义文件名
python xlsx_to_txt.py your_file.xlsx --chunk-size 100 --names-file names.txt

参数说明：
----------
input:           输入的文件路径（xlsx/xls/csv）
-o/--output:     输出的 TXT 文件路径（支持 {chunk} 占位符）
-s/--sheet:      指定要转换的 Sheet 名称
-d/--delimiter:  列分隔符，默认制表符
-e/--encoding:   输出编码，默认 UTF-8
--no-header:     不输出表头行
--start-row:     起始行号（从1开始，默认1）
--end-row:       结束行号（默认全部）
--chunk-size:    每个输出文件的行数
--names:         自定义文件名列表，用逗号分隔（如 "河北棋牌,辽宁棋牌"）
--names-file:    包含自定义文件名的文本文件（每行一个名称）
--only-numbers:  只导出纯数字行，跳过包含文字的行
--check-duplicates: 检测并报告重复的行内容
"""

import os
import sys
import csv
import glob

try:
    from openpyxl import load_workbook
except ImportError:
    print("错误：未找到 openpyxl 库")
    print("请先安装：pip install openpyxl")
    sys.exit(1)

try:
    import xlrd
    XLRD_AVAILABLE = True
except ImportError:
    XLRD_AVAILABLE = False


def detect_file_format(filename):
    """检测文件格式"""
    if not os.path.exists(filename):
        return None, "文件不存在"
    
    ext = os.path.splitext(filename)[1].lower()
    
    with open(filename, 'rb') as f:
        header = f.read(8)
    
    if header[:2] == b'PK':
        return 'xlsx', None
    
    if header[:4] == b'\xd0\xcf\x11\xe0':
        return 'xls', None
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            f.read(1024)
        return 'csv', None
    except UnicodeDecodeError:
        try:
            with open(filename, 'r', encoding='gbk') as f:
                f.read(1024)
            return 'csv', 'gbk'
        except:
            pass
    
    return None, f"无法识别的文件格式（扩展名: {ext}）"


def is_all_numbers(row):
    """检查一行是否只包含数字（包括空值和数字字符串）"""
    for cell in row:
        if cell is None or str(cell).strip() == '':
            continue
        cell_str = str(cell).strip()
        # 尝试转换为数字
        try:
            float(cell_str)
        except ValueError:
            return False
    return True


def xlsx_to_txt(input_file, output_file=None, sheet_name=None,
               delimiter='\t', encoding='utf-8', header=True,
               start_row=1, end_row=None, chunk_size=None, custom_names=None, only_numbers=False, check_duplicates=False):
    """
    将 Excel/CSV 文件转换为 TXT 文件，支持分块导出和自定义文件名
    """
    try:
        if not os.path.exists(input_file):
            print(f"错误：未找到文件 '{input_file}'")
            return False

        file_format, detected_encoding = detect_file_format(input_file)
        
        if file_format is None:
            print(f"错误：{detected_encoding}")
            print("支持的格式：.xlsx, .xls, .csv")
            return False
        
        print(f"检测到文件格式: {file_format.upper()}")
        
        if file_format == 'xlsx':
            success = process_xlsx(input_file, output_file, sheet_name,
                                  delimiter, encoding, header, start_row, end_row, chunk_size, custom_names, only_numbers, check_duplicates)
        elif file_format == 'xls':
            if not XLRD_AVAILABLE:
                print("错误：读取 .xls 文件需要安装 xlrd 库")
                print("请执行：pip install xlrd")
                return False
            success = process_xls(input_file, output_file, sheet_name,
                                delimiter, encoding, header, start_row, end_row, chunk_size, custom_names, only_numbers, check_duplicates)
        elif file_format == 'csv':
            success = process_csv(input_file, output_file,
                                 delimiter, encoding, header, start_row, end_row, chunk_size, custom_names, only_numbers, check_duplicates)
        else:
            print(f"错误：不支持的格式 {file_format}")
            return False
        
        return success

    except Exception as e:
        print(f"\n发生错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def process_xlsx(input_file, output_file, sheet_name, delimiter, encoding, header, start_row, end_row, chunk_size, custom_names, only_numbers, check_duplicates):
    """处理 XLSX 格式"""
    wb = load_workbook(input_file, read_only=True)
    
    if sheet_name:
        if sheet_name not in wb.sheetnames:
            print(f"错误：未找到Sheet '{sheet_name}'")
            print(f"可用Sheet: {wb.sheetnames}")
            return False
        ws = wb[sheet_name]
    else:
        ws = wb.active
        sheet_name = ws.title
    
    print(f"正在处理Sheet: {sheet_name}")
    
    total_rows = ws.max_row
    if end_row is None:
        end_row = total_rows
    
    print(f"Sheet总行数: {total_rows}")
    print(f"处理行范围: {start_row} - {end_row}")
    
    data_rows = []
    header_row = None
    duplicates = {}
    row_hashes = set()
    
    for row_num, row in enumerate(ws.iter_rows(values_only=True), start=1):
        if row_num < start_row:
            continue
        if row_num > end_row:
            break
        
        is_blank = True
        for cell in row:
            if cell is not None and str(cell).strip():
                is_blank = False
                break
        if is_blank:
            continue
        
        # 如果只导出数字行，跳过包含文字的行（包括表头）
        if only_numbers:
            if not is_all_numbers(row):
                continue
        
        # 生成行哈希用于检测重复
        row_str = delimiter.join(str(cell) if cell is not None else '' for cell in row)
        
        if row_num == start_row and header and not only_numbers:
            header_row = row
        else:
            # 检测重复
            if check_duplicates:
                if row_str in row_hashes:
                    if row_str in duplicates:
                        duplicates[row_str].append(row_num)
                    else:
                        duplicates[row_str] = [row_num]
                row_hashes.add(row_str)
            
            data_rows.append(row)
    
    # 输出重复检测结果
    if check_duplicates and duplicates:
        print(f"\n⚠️  检测到 {len(duplicates)} 组重复行:")
        for content, rows in duplicates.items():
            print(f"  内容: '{content[:50]}...' 出现在行: {rows}")
    
    if not data_rows:
        print("警告：没有找到有效数据，未生成输出文件")
        return False
    
    return write_chunks(data_rows, header_row, input_file, sheet_name, output_file, delimiter, encoding, chunk_size, custom_names)


def process_xls(input_file, output_file, sheet_name, delimiter, encoding, header, start_row, end_row, chunk_size, custom_names, only_numbers, check_duplicates):
    """处理 XLS 格式"""
    rb = xlrd.open_workbook(input_file, encoding_override=encoding)
    
    if sheet_name:
        if sheet_name not in rb.sheet_names():
            print(f"错误：未找到Sheet '{sheet_name}'")
            print(f"可用Sheet: {rb.sheet_names()}")
            return False
        ws = rb.sheet_by_name(sheet_name)
    else:
        ws = rb.sheet_by_index(0)
        sheet_name = ws.name
    
    print(f"正在处理Sheet: {sheet_name}")
    
    total_rows = ws.nrows
    if end_row is None:
        end_row = total_rows
    
    print(f"Sheet总行数: {total_rows}")
    print(f"处理行范围: {start_row} - {end_row}")
    
    data_rows = []
    header_row = None
    duplicates = {}
    row_hashes = set()
    
    for row_num in range(start_row - 1, end_row):
        row = ws.row_values(row_num)
        
        is_blank = True
        for cell in row:
            if cell is not None and str(cell).strip():
                is_blank = False
                break
        if is_blank:
            continue
        
        # 如果只导出数字行，跳过包含文字的行（包括表头）
        if only_numbers:
            if not is_all_numbers(row):
                continue
        
        # 生成行哈希用于检测重复
        row_str = delimiter.join(str(cell) if cell is not None else '' for cell in row)
        
        if row_num == start_row - 1 and header and not only_numbers:
            header_row = row
        else:
            # 检测重复
            if check_duplicates:
                if row_str in row_hashes:
                    if row_str in duplicates:
                        duplicates[row_str].append(row_num + 1)
                    else:
                        duplicates[row_str] = [row_num + 1]
                row_hashes.add(row_str)
            
            data_rows.append(row)
    
    # 输出重复检测结果
    if check_duplicates and duplicates:
        print(f"\n⚠️  检测到 {len(duplicates)} 组重复行:")
        for content, rows in duplicates.items():
            print(f"  内容: '{content[:50]}...' 出现在行: {rows}")
    
    if not data_rows:
        print("警告：没有找到有效数据，未生成输出文件")
        return False
    
    return write_chunks(data_rows, header_row, input_file, sheet_name, output_file, delimiter, encoding, chunk_size, custom_names)


def process_csv(input_file, output_file, delimiter, encoding, header, start_row, end_row, chunk_size, custom_names, only_numbers, check_duplicates):
    """处理 CSV 格式"""
    auto_delimiter = detect_csv_delimiter(input_file, encoding)
    if auto_delimiter and delimiter == '\t':
        print(f"自动检测到CSV分隔符: '{auto_delimiter}'")
        delimiter = auto_delimiter
    
    with open(input_file, 'r', encoding=encoding) as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    total_rows = len(rows)
    if end_row is None:
        end_row = total_rows
    
    print(f"CSV总行数: {total_rows}")
    print(f"处理行范围: {start_row} - {end_row}")
    
    data_rows = []
    header_row = None
    duplicates = {}
    row_hashes = set()
    
    for row_num in range(start_row - 1, end_row):
        row = rows[row_num]
        
        is_blank = True
        for cell in row:
            if cell and str(cell).strip():
                is_blank = False
                break
        if is_blank:
            continue
        
        # 如果只导出数字行，跳过包含文字的行（包括表头）
        if only_numbers:
            if not is_all_numbers(row):
                continue
        
        # 生成行哈希用于检测重复
        row_str = delimiter.join(str(cell) if cell else '' for cell in row)
        
        if row_num == start_row - 1 and header and not only_numbers:
            header_row = row
        else:
            # 检测重复
            if check_duplicates:
                if row_str in row_hashes:
                    if row_str in duplicates:
                        duplicates[row_str].append(row_num + 1)
                    else:
                        duplicates[row_str] = [row_num + 1]
                row_hashes.add(row_str)
            
            data_rows.append(row)
    
    # 输出重复检测结果
    if check_duplicates and duplicates:
        print(f"\n⚠️  检测到 {len(duplicates)} 组重复行:")
        for content, rows in duplicates.items():
            print(f"  内容: '{content[:50]}...' 出现在行: {rows}")
    
    if not data_rows:
        print("警告：没有找到有效数据，未生成输出文件")
        return False
    
    return write_chunks(data_rows, header_row, input_file, None, output_file, delimiter, encoding, chunk_size, custom_names)


def detect_csv_delimiter(filename, encoding):
    """自动检测CSV文件的分隔符"""
    try:
        with open(filename, 'r', encoding=encoding) as f:
            sample = f.read(1024)
        
        first_line = sample.split('\n')[0]
        
        delimiters = {',': 0, '\t': 0, ';': 0, '|': 0}
        for d in delimiters:
            delimiters[d] = first_line.count(d)
        
        best = max(delimiters, key=delimiters.get)
        if delimiters[best] > 0:
            return best
    except:
        pass
    return ','


def write_chunks(data_rows, header_row, input_file, sheet_name, output_file, delimiter, encoding, chunk_size, custom_names):
    """分块写入文件"""
    total_data_rows = len(data_rows)
    
    if chunk_size is None or chunk_size >= total_data_rows:
        if not output_file:
            base_name = os.path.splitext(input_file)[0]
            output_file = f"{base_name}_{sheet_name}.txt" if sheet_name else f"{base_name}.txt"
        else:
            output_file = output_file.replace('{chunk}', '1')
        
        write_file(data_rows, header_row, output_file, delimiter, encoding)
        print(f"\n成功！")
        print(f"输出文件: {output_file}")
        print(f"导出行数: {total_data_rows}" + (f" (含表头)" if header_row else ""))
        return True
    else:
        num_chunks = (total_data_rows + chunk_size - 1) // chunk_size
        print(f"\n分块导出: 共 {total_data_rows} 行，分成 {num_chunks} 个文件，每文件 {chunk_size} 行")
        
        if custom_names:
            if len(custom_names) < num_chunks:
                print(f"警告：提供的自定义文件名数量({len(custom_names)})少于文件数量({num_chunks})，剩余文件将使用默认命名")
        
        for chunk_idx in range(num_chunks):
            start_idx = chunk_idx * chunk_size
            end_idx = min(start_idx + chunk_size, total_data_rows)
            chunk_data = data_rows[start_idx:end_idx]
            
            # 生成文件名
            if custom_names and chunk_idx < len(custom_names):
                chunk_output_file = custom_names[chunk_idx] + ".txt"
            elif output_file:
                chunk_output_file = output_file.replace('{chunk}', str(chunk_idx + 1))
            else:
                base_name = os.path.splitext(input_file)[0]
                chunk_output_file = f"{base_name}_{chunk_idx + 1}.txt"
            
            write_file(chunk_data, header_row if chunk_idx == 0 else None, chunk_output_file, delimiter, encoding)
            print(f"  第 {chunk_idx + 1} 个文件: {chunk_output_file} ({len(chunk_data)} 行)")
        
        print(f"\n成功！已导出 {num_chunks} 个文件")
        return True


def write_file(data_rows, header_row, output_file, delimiter, encoding):
    """写入单个文件"""
    with open(output_file, 'w', encoding=encoding) as f:
        lines = []
        
        if header_row:
            lines.append(delimiter.join(str(cell) if cell is not None else '' for cell in header_row))
        
        for row in data_rows:
            lines.append(delimiter.join(str(cell) if cell is not None else '' for cell in row))
        
        # 使用 join 避免末尾空行
        if lines:
            f.write('\n'.join(lines))


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)
    
    input_files = []
    output_file = None
    sheet_name = None
    delimiter = '\t'
    encoding = 'utf-8'
    header = True
    start_row = 1
    end_row = None
    chunk_size = None
    custom_names = None
    only_numbers = False
    check_duplicates = False

    i = 1
    while i < len(sys.argv):
        # 检查是否是输入文件（不以-开头）
        if not sys.argv[i].startswith('-'):
            # 支持通配符
            expanded = glob.glob(sys.argv[i])
            if expanded:
                input_files.extend(expanded)
            else:
                # 如果通配符没有匹配到，尝试作为普通文件
                if os.path.exists(sys.argv[i]):
                    input_files.append(sys.argv[i])
                else:
                    print(f"错误：未找到文件 '{sys.argv[i]}'")
                    sys.exit(1)
            i += 1
        else:
            break
    
    if not input_files:
        print("错误：没有找到任何输入文件")
        sys.exit(1)
    
    # 解析其他参数
    while i < len(sys.argv):
        if sys.argv[i] == '-o' or sys.argv[i] == '--output':
            output_file = sys.argv[i+1]
            i += 2
        elif sys.argv[i] == '-s' or sys.argv[i] == '--sheet':
            sheet_name = sys.argv[i+1]
            i += 2
        elif sys.argv[i] == '-d' or sys.argv[i] == '--delimiter':
            delimiter = sys.argv[i+1]
            i += 2
        elif sys.argv[i] == '-e' or sys.argv[i] == '--encoding':
            encoding = sys.argv[i+1]
            i += 2
        elif sys.argv[i] == '--no-header':
            header = False
            i += 1
        elif sys.argv[i] == '--start-row':
            start_row = int(sys.argv[i+1])
            i += 2
        elif sys.argv[i] == '--end-row':
            end_row = int(sys.argv[i+1])
            i += 2
        elif sys.argv[i] == '--chunk-size':
            chunk_size = int(sys.argv[i+1])
            i += 2
        elif sys.argv[i] == '--names':
            custom_names = sys.argv[i+1].split(',')
            custom_names = [name.strip() for name in custom_names if name.strip()]
            i += 2
        elif sys.argv[i] == '--names-file':
            names_file = sys.argv[i+1]
            if os.path.exists(names_file):
                with open(names_file, 'r', encoding='utf-8') as f:
                    custom_names = [line.strip() for line in f if line.strip()]
            else:
                print(f"错误：未找到文件名列表文件 '{names_file}'")
                sys.exit(1)
            i += 2
        elif sys.argv[i] == '--only-numbers':
            only_numbers = True
            i += 1
        elif sys.argv[i] == '--check-duplicates':
            check_duplicates = True
            i += 1
        else:
            print(f"警告：未知参数 '{sys.argv[i]}'，已忽略")
            i += 1

    # 批量处理多个文件
    success_count = 0
    total_count = len(input_files)
    
    for idx, input_file in enumerate(input_files, 1):
        print(f"\n{'='*50}")
        print(f"处理文件 {idx}/{total_count}: {os.path.basename(input_file)}")
        print('='*50)
        
        # 为每个文件生成唯一的输出文件名
        base_name = os.path.splitext(os.path.basename(input_file))[0]
        auto_output = f"{base_name}_output.txt"
        
        success = xlsx_to_txt(
            input_file=input_file,
            output_file=output_file if idx == 1 else None,
            sheet_name=sheet_name,
            delimiter=delimiter,
            encoding=encoding,
            header=header,
            start_row=start_row,
            end_row=end_row,
            chunk_size=chunk_size,
            custom_names=custom_names,
            only_numbers=only_numbers,
            check_duplicates=check_duplicates
        )
        
        if success:
            success_count += 1
    
    print(f"\n{'='*50}")
    print(f"批量处理完成！成功: {success_count}/{total_count}")


if __name__ == '__main__':
    main()