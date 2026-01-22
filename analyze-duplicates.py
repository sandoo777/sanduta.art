#!/usr/bin/env python3
import os
import json
import re
from pathlib import Path
from collections import defaultdict

def find_all_components(src_dir='src'):
    """Găsește toate componentele React"""
    components = []
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.tsx', '.jsx')) and not file.endswith(('.test.tsx', '.spec.tsx', '.test.jsx', '.spec.jsx')):
                path = os.path.join(root, file)
                components.append(path)
    return components

def get_component_name(filepath):
    """Extrage numele componentei din filepath"""
    return os.path.basename(filepath).replace('.tsx', '').replace('.jsx', '')

def count_imports(component_name, src_dir='src'):
    """Numără de câte ori este importată o componentă"""
    count = 0
    import_locations = []
    
    # Patterns de import
    patterns = [
        rf'import\s+.*\b{component_name}\b.*from',
        rf'import\s+\{{[^}}]*\b{component_name}\b[^}}]*\}}',
        rf'from\s+[\'"].*{component_name}[\'"]',
    ]
    
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        for pattern in patterns:
                            if re.search(pattern, content):
                                count += 1
                                import_locations.append(filepath)
                                break
                except Exception as e:
                    pass
    
    return count, import_locations

def is_component_file(filepath):
    """Verifică dacă fișierul conține componente React exportate"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Caută export default sau export function/const
            return bool(re.search(r'export\s+(default|function|const)', content))
    except:
        return False

def analyze_duplicates():
    """Analizează toate duplicatele"""
    
    print("🔍 Analizez componentele...")
    
    # UI standardizate (sursa de adevăr)
    ui_components = {}
    ui_dir = 'src/components/ui'
    if os.path.exists(ui_dir):
        for file in os.listdir(ui_dir):
            if file.endswith('.tsx') and file != 'index.ts':
                name = file.replace('.tsx', '')
                ui_components[name] = os.path.join(ui_dir, file)
    
    # Toate componentele
    all_components = find_all_components()
    
    # Grupează după nume
    by_name = defaultdict(list)
    for comp in all_components:
        name = get_component_name(comp)
        by_name[name].append(comp)
    
    # Analizează duplicate
    duplicates = []
    unused_components = []
    deletion_plan = []
    
    for name, paths in by_name.items():
        if len(paths) > 1:
            # Are duplicate
            standardized_path = ui_components.get(name, paths[0])
            duplicate_entries = []
            
            for path in paths:
                if path == standardized_path:
                    continue
                    
                # Verifică dacă este folosit
                import_count, import_locations = count_imports(name)
                
                # Verifică dacă este într-adevăr o componentă
                if not is_component_file(path):
                    continue
                
                can_delete = import_count == 0
                
                duplicate_entry = {
                    'path': path,
                    'isUsed': import_count > 0,
                    'importCount': import_count,
                    'importLocations': import_locations[:5],  # Primele 5
                    'canDelete': can_delete,
                    'reason': 'Not imported anywhere' if can_delete else f'Used in {import_count} locations'
                }
                
                duplicate_entries.append(duplicate_entry)
                
                if can_delete:
                    deletion_plan.append(path)
            
            if duplicate_entries:
                duplicates.append({
                    'componentName': name,
                    'standardizedPath': standardized_path if name in ui_components else None,
                    'duplicates': duplicate_entries
                })
    
    # Găsește componente complet nefolosite
    for comp in all_components:
        name = get_component_name(comp)
        # Skip page.tsx, layout.tsx, etc
        if name in ['page', 'layout', 'loading', 'error', 'not-found']:
            continue
            
        import_count, _ = count_imports(name)
        if import_count == 0 and is_component_file(comp):
            # Verifică dacă e în app/ (poate fi route component)
            if '/app/' in comp and comp.endswith('page.tsx'):
                continue
            if comp not in deletion_plan:
                unused_components.append({
                    'path': comp,
                    'componentName': name,
                    'reason': 'Not imported anywhere, likely obsolete'
                })
                if comp not in deletion_plan:
                    deletion_plan.append(comp)
    
    # Statistici
    safe_to_delete = len(deletion_plan)
    needs_refactoring = sum(1 for d in duplicates for dup in d['duplicates'] if not dup['canDelete'])
    
    report = {
        'duplicates': duplicates,
        'unusedComponents': unused_components[:50],  # Primele 50
        'statistics': {
            'totalDuplicates': len(duplicates),
            'safeToDelete': safe_to_delete,
            'needsRefactoring': needs_refactoring,
            'totalUnused': len(unused_components),
            'totalComponents': len(all_components)
        },
        'deletionPlan': deletion_plan[:30]  # Primele 30
    }
    
    return report

if __name__ == '__main__':
    report = analyze_duplicates()
    
    # Salvează raportul
    with open('RAPORT_E1_DUPLICATE_COMPONENTS.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("\n✅ Analiza completă!")
    print(f"📊 Statistici:")
    print(f"   - Total componente: {report['statistics']['totalComponents']}")
    print(f"   - Duplicate găsite: {report['statistics']['totalDuplicates']}")
    print(f"   - Safe to delete: {report['statistics']['safeToDelete']}")
    print(f"   - Needs refactoring: {report['statistics']['needsRefactoring']}")
    print(f"   - Componente nefolosite: {report['statistics']['totalUnused']}")
    print(f"\n💾 Raport salvat în: RAPORT_E1_DUPLICATE_COMPONENTS.json")
