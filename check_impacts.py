
import json
import os

data_dir = r'c:\Users\rob_c\Code\PRD Civil Service Challenge\frontend\data'
files = ['roads.json', 'social.json', 'news.json', 'railways.json', 'ea-help.json', 'energy.json', 'water.json']

problem_keywords = [
    'warning', 'discussion', 'observation', 'noted', 'forecast', 'concerns', 'alert', 'precautionary'
]

results = {}

for filename in files:
    path = os.path.join(data_dir, filename)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    file_problems = []
    for entry in data:
        title = entry.get('title', '').lower()
        evidence = entry.get('evidence', '').lower()
        
        # Check if title suggests no impact
        is_problem = False
        if any(kw in title for kw in ['warning', 'discussion', 'observation', 'noted', 'concerns', 'forecast']):
            # It might be a warning ABOUT an impact, so check evidence
            if 'no direct reports' in evidence or 'no disruption' in evidence or 'no local impact' in evidence:
                is_problem = True
            elif 'warning' in title and 'surface water' not in evidence and 'flooded' not in evidence:
                is_problem = True
            elif 'discussion' in title:
                is_problem = True
            elif 'observation' in title and 'no disruption' in evidence:
                is_problem = True
        
        if is_problem:
            file_problems.append({
                'id': entry['id'],
                'title': entry['title'],
                'evidence': entry['evidence']
            })
            
    results[filename] = file_problems

print(json.dumps(results, indent=2))
