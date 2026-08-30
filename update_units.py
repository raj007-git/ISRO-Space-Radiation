import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements
    # 1. Electron Flux
    content = content.replace('e/cm²/s/sr', 'electrons / cm² / s')
    
    # 2. Density
    content = content.replace('cm⁻³', 'particles / cm³')
    content = content.replace('p/cm³', 'particles / cm³') # just in case
    
    # 3. Magnetic Field (optional, expand nT to nanoTesla in tooltips/labels)
    # Actually nT is quite standard and fits well in UI, but I can change `nT` to `nanoTesla (nT)` in headers.
    # We will just focus on the main ones: electrons/cm²/s and particles/cm³.

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_dir = r"c:\Users\krish\OneDrive\Documents\ISRO_Radiation_Forecasting\frontend\src"

for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.jsx'):
            replace_in_file(os.path.join(root, file))

print("Unit replacements complete!")
