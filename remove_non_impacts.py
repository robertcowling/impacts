
import json
import os

data_dir = r'c:\Users\rob_c\Code\PRD Civil Service Challenge\frontend\data'

removals = {
    'social.json': ['ev-social-0', 'ev-social-1', 'ev-social-2', 'ev-social-3', 'ev-social-4'],
    'news.json': ['ev-news-0', 'ev-news-1'],
    'ea-help.json': ['ev-ea-help-0', 'ev-ea-help-5'],
    'energy.json': ['ev-energy-0'],
    'water.json': ['ev-water-0']
}

for filename, ids_to_remove in removals.items():
    path = os.path.join(data_dir, filename)
    if not os.path.exists(path):
        print(f"File {filename} not found.")
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    original_count = len(data)
    new_data = [entry for entry in data if entry['id'] not in ids_to_remove]
    
    if len(new_data) < original_count:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=2)
        print(f"Updated {filename}: Removed {original_count - len(new_data)} entries.")
    else:
        print(f"No entries removed from {filename}.")
