#!/usr/bin/env python3
"""
Script pentru fixarea variabilelor neutilizate
Prefixează cu underscore variabilele neutilizate dar necesare (parametri de funcții)
"""
import re
import sys
from pathlib import Path

def fix_unused_req_params(file_path):
    """Fix unused 'req' parameters in API routes"""
    content = Path(file_path).read_text()
    original = content
    
    # Pattern: export async function GET(req: NextRequest)
    # Replace with: export async function GET(_req: NextRequest)
    patterns = [
        (r'\bfunction\s+GET\(req:', 'function GET(_req:'),
        (r'\bfunction\s+POST\(req:', 'function POST(_req:'),
        (r'\bfunction\s+PUT\(req:', 'function PUT(_req:'),
        (r'\bfunction\s+PATCH\(req:', 'function PATCH(_req:'),
        (r'\bfunction\s+DELETE\(req:', 'function DELETE(_req:'),
    ]
    
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
    
    if content != original:
        Path(file_path).write_text(content)
        return True
    return False

def fix_unused_request_params(file_path):
    """Fix unused 'request' parameters"""
    content = Path(file_path).read_text()
    original = content
    
    # Similar patterns for 'request'
    patterns = [
        (r'\bfunction\s+GET\(request:', 'function GET(_request:'),
        (r'\bfunction\s+POST\(request:', 'function POST(_request:'),
        (r'\bfunction\s+PUT\(request:', 'function PUT(_request:'),
        (r'\bfunction\s+PATCH\(request:', 'function PATCH(_request:'),
        (r'\bfunction\s+DELETE\(request:', 'function DELETE(_request:'),
    ]
    
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
    
    if content != original:
        Path(file_path).write_text(content)
        return True
    return False

def fix_unused_error_vars(file_path):
    """Fix unused error variables in catch blocks"""
    content = Path(file_path).read_text()
    original = content
    
    # catch (error) -> catch (_error)
    # But only if error is truly unused (no references)
    content = re.sub(r'catch\s*\(\s*error\s*\)', 'catch (_error)', content)
    
    if content != original:
        Path(file_path).write_text(content)
        return True
    return False

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python fix-unused-vars.py <fix_type> <file_path>")
        print("fix_type: req | request | error")
        sys.exit(1)
    
    fix_type = sys.argv[1]
    file_path = sys.argv[2]
    
    if fix_type == 'req':
        fixed = fix_unused_req_params(file_path)
    elif fix_type == 'request':
        fixed = fix_unused_request_params(file_path)
    elif fix_type == 'error':
        fixed = fix_unused_error_vars(file_path)
    else:
        print(f"Unknown fix type: {fix_type}")
        sys.exit(1)
    
    if fixed:
        print(f"Fixed {file_path}")
    else:
        print(f"No changes needed for {file_path}")
