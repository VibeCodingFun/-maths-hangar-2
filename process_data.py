import pandas as pd # Ensure this is the very first line!
import json
import random
import os

# 1. LOAD DATA
# We explicitly use header=None because planes.dat has no header row
try:
    df = pd.read_csv('planes.dat', names=['Name', 'IATA', 'ICAO'], header=None, encoding='utf-8')
    print(f"File loaded successfully. Total rows: {len(df)}")
except Exception as e:
    print(f"CRITICAL ERROR: Could not read planes.dat. Details: {e}")
    exit() # Stop the script here if we can't load data

# 2. TRANSFORM
# Drop rows where 'Name' is missing
df = df.dropna(subset=['Name'])
print(f"Rows after dropping missing names: {len(df)}")

database = []

def get_rarity(name):
    n = str(name).lower()
    if any(x in n for x in ['f-16', 'f-22', 'b-2', 'sr-71', 'su-57', 'f-35', 'spitfire']): return 'legendary'
    if any(x in n for x in ['jet', 'fighter', 'bomber', 'airbus', 'boeing']): return 'epic'
    return 'common'

# Process the data
for index, row in df.iterrows():
    name = str(row['Name'])
    database.append({
        "id": index + 1,
        "name": name,
        "brand": name.split(' ')[0], 
        "rarity": get_rarity(name),
        "searchQuery": f"{name} aircraft",
        "speed": f"{random.randint(200, 1200)} mph",
        "photo": None
    })

# Add your manual overrides
manual_planes = [
    {"name": "Supermarine Spitfire", "brand": "Supermarine", "rarity": "legendary"},
    {"name": "Hawker Hurricane", "brand": "Hawker", "rarity": "epic"},
    {"name": "Avro Lancaster", "brand": "Avro", "rarity": "epic"}
]

for p in manual_planes:
    database.append({
        "id": len(database) + 1,
        "name": p['name'],
        "brand": p['brand'],
        "rarity": p['rarity'],
        "searchQuery": f"{p['brand']} {p['name']} aircraft",
        "speed": f"{random.randint(200, 1200)} mph",
        "photo": None
    })

# 3. SAVE
with open('aircraft.json', 'w', encoding='utf-8') as f:
    json.dump(database, f, indent=4)

print(f"Success! Processed {len(database)} planes into aircraft.json")