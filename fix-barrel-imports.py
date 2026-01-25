#!/usr/bin/env python3
"""
Script pentru actualizarea automată a importurilor de tip barrel file.
Înlocuiește importurile din '@/components/ui' cu importuri directe.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Mapping de componente UI către fișierele lor
UI_COMPONENT_MAP = {
    'Button': 'Button',
    'Input': 'Input',
    'Select': 'Select',
    'Card': 'Card',
    'CardHeader': 'Card',
    'CardTitle': 'Card',
    'CardContent': 'Card',
    'CardFooter': 'Card',
    'Badge': 'Badge',
    'StatusBadge': 'Badge',
    'SectionTitle': 'SectionTitle',
    'PageTitle': 'SectionTitle',
    'Tabs': 'tabs',
    'TabsList': 'tabs',
    'TabsTrigger': 'tabs',
    'TabsContent': 'tabs',
    'Table': 'Table',
    'Pagination': 'Pagination',
    'LoadingState': 'LoadingState',
    'SkeletonCard': 'LoadingState',
    'SkeletonList': 'LoadingState',
    'SkeletonTable': 'LoadingState',
    'ErrorState': 'ErrorState',
    'ErrorNetwork': 'ErrorState',
    'Error404': 'ErrorState',
    'Error403': 'ErrorState',
    'ErrorGeneric': 'ErrorState',
    'InlineError': 'ErrorState',
    'SuccessState': 'ErrorState',
    'EmptyState': 'EmptyState',
    'EmptyProjects': 'EmptyState',
    'EmptyFiles': 'EmptyState',
    'EmptyOrders': 'EmptyState',
    'EmptyNotifications': 'EmptyState',
    'EmptySearch': 'EmptyState',
    'Modal': 'Modal',
    'ConfirmDialog': 'ConfirmDialog',
    'useConfirmDialog': 'ConfirmDialog',
    'confirmPresets': 'ConfirmDialog',
}

def find_barrel_imports(file_path: str) -> List[Tuple[str, str]]:
    """Găsește toate importurile de tip barrel file într-un fișier."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern pentru import de tip: import { X, Y, Z } from '@/components/ui';
    pattern = r"import\s+{([^}]+)}\s+from\s+['\"]@/components/ui['\"];"
    matches = re.findall(pattern, content)
    
    imports = []
    for match in matches:
        # Split componentele
        components = [c.strip() for c in match.split(',')]
        imports.append((match, components))
    
    return imports

def group_components_by_file(components: List[str]) -> Dict[str, List[str]]:
    """Grupează componentele după fișierul din care trebuie importate."""
    grouped = {}
    
    for component in components:
        # Clean component name (remove 'type' keyword if present)
        clean_name = component.replace('type ', '').strip()
        
        # Skip types for now
        if component.startswith('type '):
            continue
            
        if clean_name in UI_COMPONENT_MAP:
            file_name = UI_COMPONENT_MAP[clean_name]
            if file_name not in grouped:
                grouped[file_name] = []
            grouped[file_name].append(clean_name)
    
    return grouped

def generate_direct_imports(grouped: Dict[str, List[str]]) -> str:
    """Generează string-urile de import direct."""
    imports = []
    
    for file_name, components in sorted(grouped.items()):
        components_str = ', '.join(sorted(set(components)))
        imports.append(f"import {{ {components_str} }} from '@/components/ui/{file_name}';")
    
    return '\n'.join(imports)

def update_file(file_path: str) -> bool:
    """Actualizează un fișier cu importuri directe."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Găsește toate importurile barrel
        barrel_imports = find_barrel_imports(file_path)
        
        if not barrel_imports:
            return False
        
        # Procesează fiecare import barrel
        for import_str, components in barrel_imports:
            # Grupează componentele
            grouped = group_components_by_file(components)
            
            if not grouped:
                continue
            
            # Generează importuri directe
            direct_imports = generate_direct_imports(grouped)
            
            # Înlocuiește importul barrel cu importuri directe
            old_import = f"import {{{import_str}}} from '@/components/ui';"
            content = content.replace(old_import, direct_imports)
        
        # Scrie doar dacă s-au făcut modificări
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Eroare la procesarea {file_path}: {e}")
        return False

def process_directory(directory: str) -> Tuple[int, int]:
    """Procesează toate fișierele .tsx și .ts dintr-un director."""
    updated = 0
    total = 0
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts')) and not file.endswith('.d.ts'):
                file_path = os.path.join(root, file)
                
                # Skip node_modules
                if 'node_modules' in file_path:
                    continue
                
                # Skip barrel files themselves
                if file == 'index.ts' or file == 'index.tsx':
                    continue
                
                total += 1
                if update_file(file_path):
                    updated += 1
                    print(f"✅ Actualizat: {file_path}")
    
    return updated, total

if __name__ == '__main__':
    src_dir = 'src'
    
    if not os.path.exists(src_dir):
        print(f"❌ Directorul {src_dir} nu există!")
        exit(1)
    
    print("🔧 Actualizare importuri barrel files...")
    print("=" * 60)
    
    updated, total = process_directory(src_dir)
    
    print("=" * 60)
    print(f"✅ Procesare completă!")
    print(f"   Fișiere procesate: {total}")
    print(f"   Fișiere actualizate: {updated}")
    
    if updated == 0:
        print("   Nu s-au găsit importuri de actualizat.")
