
import json
import os

path = r'c:\Users\rob_c\Code\PRD Civil Service Challenge\frontend\data\social.json'

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_entries = [
    {
        "id": "ev-social-birmingham-1300",
        "lat": 52.4814,
        "lng": -1.8998,
        "category": "social",
        "severity": "minor",
        "timestamp": "2025-11-14T13:00:00.000Z",
        "title": "[X (Twitter)] Birmingham \u2013 Surface Water Affecting City Centre Businesses",
        "locationName": "West Midlands | Birmingham | Birmingham Central",
        "evidence": "X (Twitter) users in Birmingham city centre report heavy surface water on local roads and some run-off affecting access to street-level businesses. No major property flooding reported but commuters and shoppers describe 'significant puddles' and 'drenched pavements'.",
        "source": "X (Twitter)",
        "sourceUrl": "#",
        "assessment": {
          "confidenceLabel": "Medium",
          "confidenceColor": "#facc15",
          "confidence": 62,
          "justification": "Multiple independent reports from a high-density urban area. Geographic spread of reports consistent with heavy rainfall in the West Midlands. Direct observation of surface water affecting business access.",
          "sourceLabel": "X (Twitter)",
          "sourceReliability": "Unofficial",
          "intelligenceType": "Direct",
          "corroborated": True,
          "startTiming": "13:00",
          "endTiming": "",
          "synthesis": "Surface water disruption in Birmingham city centre as the weather system moves through the West Midlands. Impacts focalised on business access and pedestrian movement. Part of the broader central England minor impact picture.",
          "confidenceStatement": "Medium confidence. Multiple community reports from city centre locations. Consistent with rainfall pattern."
        },
        "posts": [
          {
            "user": "@BrumShopper",
            "text": "Cardiff style rain in Birmingham today! Drains around Grand Central and New Street can't cope. Street level shops starting to get worried #Brum #rain",
            "time": "just now"
          },
          {
            "user": "@MidlandsNews_user",
            "text": "Nasty surface water in Birmingham city centre this lunchtime. Drains are overwhelmed. Avoid walking if you can!",
            "time": "15m ago"
          }
        ]
    },
    {
        "id": "ev-social-peterborough-1300",
        "lat": 52.5739,
        "lng": -0.2431,
        "category": "social",
        "severity": "minor",
        "timestamp": "2025-11-14T13:15:00.000Z",
        "title": "[X (Twitter)] Peterborough \u2013 Residential Street Surface Water",
        "locationName": "Cambridgeshire | Peterborough | Peterborough Central",
        "evidence": "X (Twitter) report from Peterborough residential area noting surface water accumulation 'halfway up the kerbs'. Residents sharing photos of water pooling near driveways and houses. No internal flooding confirmed but high local concern.",
        "source": "X (Twitter)",
        "sourceUrl": "#",
        "assessment": {
          "confidenceLabel": "Low",
          "confidenceColor": "#ef4444",
          "confidence": 48,
          "justification": "Single localized report with photographic evidence on social media. Geographically consistent with the eastern movement of the frontal system. Reflects early stage of potential residential impact in East of England.",
          "sourceLabel": "X (Twitter)",
          "sourceReliability": "Unofficial",
          "intelligenceType": "Direct",
          "corroborated": False,
          "startTiming": "13:15",
          "endTiming": "",
          "synthesis": "Early report of residential surface water in Peterborough. Rain intensity increasing. First signal of potential residential impact in the East of England as the front progresses.",
          "confidenceStatement": "Low confidence. Localised social report with photo. Early indicator of East of England impact."
        },
        "posts": [
          {
            "user": "@PeterboroughLocal",
            "text": "Water is getting high on our street in Peterborough. Drains are just not taking it. Right up to the pavement edge. #Peterborough #flood",
            "time": "just now"
          },
          {
            "user": "@CambsWx_watch",
            "text": "Seeing some photos of big puddles in residential Peterborough. Rain is hammering down now.",
            "time": "10m ago"
          }
        ]
    }
]

data.extend(new_entries)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"Added {len(new_entries)} entries to social.json.")
