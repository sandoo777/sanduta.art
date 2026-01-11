#!/bin/bash

echo "🏭 Adding complete digital print shop inventory via Admin Panel API"
echo ""

BASE_URL="http://localhost:3000"

# Function to add material
add_material() {
  local name="$1"
  local sku="$2"
  local unit="$3"
  local stock="$4"
  local minStock="$5"
  local costPerUnit="$6"
  local notes="$7"
  
  echo "  Adding: $name ($sku)"
  
  curl -s -X POST "$BASE_URL/api/admin/materials" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$name\",
      \"sku\": \"$sku\",
      \"unit\": \"$unit\",
      \"stock\": $stock,
      \"minStock\": $minStock,
      \"costPerUnit\": $costPerUnit,
      \"notes\": \"$notes\"
    }" > /dev/null
}

# Function to add print method
add_print_method() {
  local name="$1"
  local type="$2"
  local costPerM2="$3"
  local speed="$4"
  local description="$5"
  
  echo "  Adding: $name ($type)"
  
  curl -s -X POST "$BASE_URL/api/admin/print-methods" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$name\",
      \"type\": \"$type\",
      \"costPerM2\": $costPerM2,
      \"speed\": \"$speed\",
      \"description\": \"$description\",
      \"active\": true
    }" > /dev/null
}

# Function to add finishing operation
add_finishing() {
  local name="$1"
  local type="$2"
  local costFix="$3"
  local costPerM2="$4"
  local description="$5"
  
  echo "  Adding: $name ($type)"
  
  curl -s -X POST "$BASE_URL/api/admin/finishing" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$name\",
      \"type\": \"$type\",
      \"costFix\": $costFix,
      \"costPerM2\": $costPerM2,
      \"description\": \"$description\",
      \"active\": true
    }" > /dev/null
}

# Function to add machine
add_machine() {
  local name="$1"
  local type="$2"
  local costPerHour="$3"
  local speed="$4"
  local description="$5"
  
  echo "  Adding: $name ($type)"
  
  curl -s -X POST "$BASE_URL/api/admin/machines" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$name\",
      \"type\": \"$type\",
      \"costPerHour\": $costPerHour,
      \"speed\": \"$speed\",
      \"description\": \"$description\",
      \"active\": true
    }" > /dev/null
}

echo "📦 Adding Materials (14 items)..."
add_material "Hârtie Foto Lucioasă" "PHOTO-GLOSS-260" "m²" 50 10 25.50 "260gsm, finish glossy"
add_material "Hârtie Foto Mată" "PHOTO-MATT-260" "m²" 45 10 24.00 "260gsm, finish matt"
add_material "Hârtie Offset 90g" "OFFSET-90" "m²" 200 50 5.50 "90gsm, alb"
add_material "Hârtie Offset 120g" "OFFSET-120" "m²" 150 30 7.80 "120gsm, alb"
add_material "Hârtie Offset 160g" "OFFSET-160" "m²" 100 20 10.50 "160gsm, alb"
add_material "Carton 250g" "CARD-250" "m²" 80 15 15.00 "250gsm, rigid"
add_material "Carton 300g" "CARD-300" "m²" 60 10 18.50 "300gsm, foarte rigid"
add_material "Autocolant PVC" "VINYL-PVC" "m²" 40 10 35.00 "Autocolant alb impermeabil"
add_material "Canvas" "CANVAS-380" "m²" 30 5 45.00 "380gsm, pânză pictură"
add_material "Hârtie Magnetică" "MAGNETIC-SHEET" "m²" 20 5 55.00 "Folie magnetică flexibilă"
add_material "Hârtie Reciclabilă" "RECYCLED-100" "m²" 70 15 8.00 "100gsm, kraft eco"
add_material "Hârtie Colorată" "COLOR-MIX-120" "m²" 50 10 9.50 "120gsm, diverse culori"
add_material "Hârtie Transparentă" "TRANSPARENT-100" "m²" 25 5 22.00 "100gsm, translucidă"
add_material "Hârtie Termică" "THERMAL-80" "m²" 60 15 12.00 "80gsm, pentru chitanțe"
echo "✅ Materials added"
echo ""

echo "🖨️  Adding Print Methods (8 items)..."
add_print_method "Inkjet" "Digital" 8.50 "25 m²/oră" "Imprimare inkjet calitate foto"
add_print_method "Laser" "Digital" 6.00 "80 ppm" "Imprimare laser rapidă"
add_print_method "Sublimare" "Transfer" 12.00 "15 m²/oră" "Transfer termic pentru textile"
add_print_method "UV" "Digital" 18.00 "30 m²/oră" "Imprimare UV cu uscare instant"
add_print_method "Eco-Solvent" "Large Format" 14.00 "20 m²/oră" "Imprimare eco-solvent exterior"
add_print_method "Termotransfer" "Transfer" 10.00 "40 transferuri/oră" "Transfer termic obiecte"
add_print_method "DTG" "Textile" 0 "30 tricouri/oră" "Imprimare directă pe textile"
add_print_method "DTF" "Transfer" 15.00 "25 m²/oră" "Transfer pe film"
echo "✅ Print Methods added"
echo ""

echo "✂️  Adding Finishing Operations (12 items)..."
add_finishing "Laminare Lucioasă" "Laminare" 5.00 8.00 "Laminare folie lucioasă"
add_finishing "Laminare Mată" "Laminare" 5.00 8.00 "Laminare folie mată"
add_finishing "Capsare" "Îndosariere" 2.00 0 "Capsare cu agrafă"
add_finishing "Spiralare" "Îndosariere" 3.00 0 "Îndosariere cu spirală"
add_finishing "Tăiere Contur" "Tăiere" 10.00 12.00 "Tăiere la formă cu plotter"
add_finishing "Biguire" "Finisare" 2.00 0 "Șanț pentru pliere"
add_finishing "Perforare" "Finisare" 1.50 0 "Găurire pentru îndosariere"
add_finishing "Pliere" "Finisare" 1.00 0 "Pliere la jumătate sau în 3"
add_finishing "Îndosariere" "Îndosariere" 5.00 0 "Asamblare completă"
add_finishing "Colț Rotunjit" "Finisare" 3.00 0 "Rotunjire colțuri"
add_finishing "Aplicare Magnet" "Montaj" 5.00 20.00 "Aplicare folie magnetică"
add_finishing "Aplicare Suport Rigid" "Montaj" 8.00 25.00 "Montaj pe foam/dibond"
echo "✅ Finishing Operations added"
echo ""

echo "🖨️  Adding Machines (6 items)..."
add_machine "Epson SureColor P700" "Photo Inkjet" 15.00 "13 min/A2" "Imprimantă photo A3+ 10 culori"
add_machine "Canon imagePROGRAF PRO-300" "Photo Inkjet" 18.00 "90s/A3" "Imprimantă A3+ pigment"
add_machine "HP Latex 315" "Large Format" 35.00 "23 m²/oră" "Latex 64 inch"
add_machine "Mimaki CJV300-160" "Print & Cut" 40.00 "20 m²/oră" "Eco-solvent cu plotter"
add_machine "Xerox Versant 180" "Production" 50.00 "80 ppm" "Digitală de producție"
add_machine "Ricoh Pro C5300s" "Production" 55.00 "90 ppm" "Producție cu finishing"
echo "✅ Machines added"
echo ""

echo "🎉 Inventory seeding complete!"
echo ""
echo "📊 Summary:"
echo "   • 14 materials"
echo "   • 8 print methods"
echo "   • 12 finishing operations"
echo "   • 6 machines"
echo ""
echo "✅ All inventory data added via Admin Panel API!"
