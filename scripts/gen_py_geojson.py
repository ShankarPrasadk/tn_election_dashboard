#!/usr/bin/env python3
"""Generate Puducherry constituencies GeoJSON file."""
import json
import math
import os

py_constituencies = [
    ("Mannadipet", "Puducherry", 11.98, 79.76),
    ("Thirubuvanai", "Puducherry", 11.97, 79.79),
    ("Ossudu", "Puducherry", 11.99, 79.83),
    ("Mangalam", "Puducherry", 11.96, 79.82),
    ("Villianur", "Puducherry", 11.94, 79.77),
    ("Ozhukarai", "Puducherry", 11.95, 79.80),
    ("Kadirkamam", "Puducherry", 11.93, 79.82),
    ("Indira Nagar", "Puducherry", 11.92, 79.79),
    ("Thattanchavady", "Puducherry", 11.94, 79.84),
    ("Kamaraj Nagar", "Puducherry", 11.91, 79.82),
    ("Lawspet", "Puducherry", 11.96, 79.85),
    ("Kalapet", "Puducherry", 11.97, 79.86),
    ("Muthialpet", "Puducherry", 11.93, 79.85),
    ("Raj Bhavan", "Puducherry", 11.94, 79.87),
    ("Oupalam", "Puducherry", 11.92, 79.84),
    ("Orleampeth", "Puducherry", 11.91, 79.86),
    ("Nellithope", "Puducherry", 11.93, 79.88),
    ("Mudaliarpet", "Puducherry", 11.92, 79.87),
    ("Ariankuppam", "Puducherry", 11.90, 79.79),
    ("Manavely", "Puducherry", 11.89, 79.81),
    ("Embalam", "Puducherry", 11.88, 79.83),
    ("Nettapakkam", "Puducherry", 11.87, 79.80),
    ("Bahour", "Puducherry", 11.85, 79.76),
    ("Nedungadu", "Karaikal", 10.95, 79.82),
    ("Thirunallar", "Karaikal", 10.93, 79.84),
    ("Karaikal North", "Karaikal", 10.92, 79.83),
    ("Karaikal South", "Karaikal", 10.91, 79.85),
    ("Neravy T.R. Pattinam", "Karaikal", 10.94, 79.86),
    ("Mahe", "Mahe", 11.70, 75.54),
    ("Yanam", "Yanam", 16.73, 82.22),
]

def make_polygon(lat, lon, size=0.008):
    coords = []
    for i in range(6):
        angle = math.pi / 3 * i + math.pi / 6
        coords.append([
            round(lon + size * math.cos(angle), 6),
            round(lat + size * math.sin(angle), 6)
        ])
    coords.append(coords[0])
    return [coords]

features = []
for i, (name, district, lat, lon) in enumerate(py_constituencies):
    features.append({
        "type": "Feature",
        "properties": {
            "AC_NO": i + 1,
            "AC_NAME": name.upper(),
            "ST_NAME": "PUDUCHERRY",
            "DISTRICT": district,
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": make_polygon(lat, lon),
        }
    })

geojson = {"type": "FeatureCollection", "features": features}
out = os.path.join(os.path.dirname(__file__), "..", "public", "data", "py-constituencies.geojson")
with open(out, "w") as f:
    json.dump(geojson, f)
print(f"Created {out} with {len(features)} features")
