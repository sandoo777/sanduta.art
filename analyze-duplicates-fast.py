#!/usr/bin/env python3
import os
import json
import re
from collections import defaultdict
import subprocess

def find_all_components(src_dir='src'):
    """Găsește toate componentele React"""
    result = subprocess.run(
        ['find', src_dir, '-type', 'f', '(', '-name', '*.tsx', '-o', '-name', '*.jsx', ')', '!', '-name', '*.test.*', '!', '-name', '*.spec.*'],
        capture_output=True, text=True, shell=False
    )
    components = [line.strip() for line in result.stdout.strip().split('\n') if line.strip()]
    return components

def get_component_name(filepath):
    """Extrage numele componentei din filepath"""
    return os.path.basename(filepath).replace('.tsx', '').replace('.jsx', '')

def fast_grep_imports(component_name, src_dir='src'):
    """Folosește grep pentru a număra rapid importurile"""
    try:
        # Caută în toate fișierele
        result = subprocess.run(
            ['grep', '-r', '-l', component_name, src_dir, '--include=*.tsx', '--include=*.ts', '--include=*.jsx', '--include=*.js'],
            capture_output=True, text=True
        )
        locations = [line.strip() for line in result.stdout.strip().split('\n') if line.strip()]
        return len(locations), locations[:5]
    except:
        return 0, []

def analyze_duplicates_fast():
    """Analiză rapidă a duplicatelor"""
    
    print("🔍 Analizez componentele (mod rapid)...")
    
    # UI standardizate
    ui_components = {}
    ui_dir = 'src/components/ui'
    if os.path.exists(ui_dir):
        for file in os.listdir(ui_dir):
            if file.endswith('.tsx'):
                name = file.replace('.tsx', '')
                ui_components[name] = os.path.join(ui_dir, file)
    
    print(f"✅ Găsite {len(ui_components)} componente UI standardizate")
    
    # Toate componentele
    all_components = []
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith(('.tsx', '.jsx')) and not any(x in file for x in ['.test.', '.spec.']):
                all_components.append(os.path.join(root, file))
    
    print(f"✅ Găsite {len(all_components)} componente totale")
    
    # Grupează după nume
    by_name = defaultdict(list)
    for comp in all_components:
        name = get_component_name(comp)
        by_name[name].append(comp)
    
    # Găsește duplicate (componente cu același nume)
    duplicate_names = {name: paths for name, paths in by_name.items() if len(paths) > 1}
    
    print(f"🔎 Găsite {len(duplicate_names)} nume duplicate")
    
    # Analizează doar duplicatele importante
    duplicates = []
    deletion_plan = []
    
    # Focus pe componentele care sunt duplicate ale celor din UI
    important_ui_names = ['Button', 'Card', 'Input', 'Modal', 'Table', 'Badge', 'Select', 
                         'LoadingState', 'ErrorState', 'EmptyState', 'Pagination']
    
    for name in important_ui_names:
        if name in by_name and len(by_name[name]) > 1:
            paths = by_name[name]
            standardized = ui_components.get(name)
            
            duplicate_entries = []
            for path in paths:
                if path == standardized:
                    continue
                
                # Simplu check - dacă e în ui/, păstrează-l; altfel marchează pentru verificare
                if '/components/ui/' in path:
                    continue
                    
                duplicate_entries.append({
                    'path': path,
                    'canDelete': False,  # Trebuie verificat manual
                    'reason': 'Potential duplicate of UI component - needs manual review'
                })
            
            if duplicate_entries:
                duplicates.append({
                    'componentName': name,
                    'standardizedPath': standardized,
                    'duplicates': duplicate_entries
                })
    
    # Adaugă și alte duplicate (non-UI)
    for name, paths in duplicate_names.items():
        if name in important_ui_names:
            continue  # Deja procesat
        if name in ['page', 'layout', 'loading', 'error', 'not-found']:
            continue  # Skip Next.js special files
            
        duplicate_entries = []
        for i, path in enumerate(paths[1:], 1):  # Skip primul
            duplicate_entries.append({
                'path': path,
                'canDelete': False,
                'reason': f'Duplicate #{i} of {name} - needs manual review'
            })
        
        if duplicate_entries:
            duplicates.append({
                'componentName': name,
                'standardizedPath': paths[0],
                'duplicates': duplicate_entries
            })
    
    report = {
        'duplicates': duplicates,
        'statistics': {
            'totalComponents': len(all_components),
            'totalDuplicateNames': len(duplicate_names),
            'importantDuplicates': len([d for d in duplicates if d['componentName'] in important_ui_names]),
            'needsManualReview': sum(len(d['duplicates']) for d in duplicates)
        },
        'uiComponents': list(ui_components.keys()),
        'duplicateNames': list(duplicate_names.keys())
    }
    
    return report

if __name__ == '__main__':
    report = analyze_duplicates_fast()
    
    with open('RAPORT_E1_DUPLICATE_COMPONENTS.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("\n✅ Analiza completă!")
    print(f"📊 Statistici:")
    print(f"   - Total componente: {report['statistics']['totalComponents']}")
    print(f"   - Nume duplicate: {report['statistics']['totalDuplicateNames']}")
    print(f"   - Duplicate importante (UI): {report['statistics']['importantDuplicates']}")
    print(f"   - Necesită review manual: {report['statistics']['needsManualReview']}")
    print(f"\n💾 Raport salvat în: RAPORT_E1_DUPLICATE_COMPONENTS.json")
