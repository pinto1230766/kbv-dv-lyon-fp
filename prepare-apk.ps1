# Script de Préparation APK - KBV Lyon
# Ce script automatise les étapes de build et synchronisation

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Préparation APK - KBV Lyon" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1 : Vérifier que nous sommes dans le bon dossier
$projectPath = "C:\Users\FP123\Downloads\kbv-dv-lyon-fp"
if ((Get-Location).Path -ne $projectPath) {
    Write-Host "📁 Navigation vers le dossier du projet..." -ForegroundColor Yellow
    Set-Location $projectPath
}

# Étape 2 : Vérifier que node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances npm..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dépendances npm déjà installées" -ForegroundColor Green
}

# Étape 3 : Build de l'application web
Write-Host ""
Write-Host "🔨 Compilation de l'application web..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build réussi" -ForegroundColor Green

# Étape 4 : Vérifier que le dossier dist existe
if (-not (Test-Path "dist")) {
    Write-Host "❌ Le dossier dist n'a pas été créé" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dossier dist créé" -ForegroundColor Green

# Étape 5 : Synchronisation avec Android
Write-Host ""
Write-Host "🔄 Synchronisation avec Android..." -ForegroundColor Yellow
npx cap sync android

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la synchronisation" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Synchronisation réussie" -ForegroundColor Green

# Étape 6 : Vérifier que les assets ont été copiés
$assetsPath = "android\app\src\main\assets\public"
if (Test-Path $assetsPath) {
    $fileCount = (Get-ChildItem -Path $assetsPath -Recurse -File).Count
    Write-Host "✅ $fileCount fichiers copiés dans les assets Android" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dossier assets non trouvé, mais la synchronisation a réussi" -ForegroundColor Yellow
}

# Résumé final
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ Préparation Terminée !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes :" -ForegroundColor Cyan
Write-Host "  1. Ouvrir Android Studio avec : npx cap open android" -ForegroundColor White
Write-Host "  2. Attendre la synchronisation Gradle" -ForegroundColor White
Write-Host "  3. Build → Build Bundle(s)/APK(s) → Build APK(s)" -ForegroundColor White
Write-Host ""
Write-Host "L'APK sera généré dans :" -ForegroundColor Cyan
Write-Host "  android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Yellow
Write-Host ""

# Proposer d'ouvrir Android Studio
Write-Host "Voulez-vous ouvrir Android Studio maintenant ? (O/N)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "O" -or $response -eq "o" -or $response -eq "Y" -or $response -eq "y") {
    Write-Host "🚀 Ouverture d'Android Studio..." -ForegroundColor Yellow
    npx cap open android
} else {
    Write-Host "✅ Vous pouvez ouvrir Android Studio plus tard avec : npx cap open android" -ForegroundColor Green
}
