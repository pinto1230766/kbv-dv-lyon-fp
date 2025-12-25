# 🚀 Génération APK - Démarrage Rapide

## ⚡ Commande Rapide

```powershell
# Exécuter le script de préparation automatisé
.\prepare-apk.ps1
```

Ce script va :

- ✅ Vérifier les dépendances
- ✅ Compiler l'application web
- ✅ Synchroniser avec Android
- ✅ Proposer d'ouvrir Android Studio

---

## 📚 Guides Disponibles

### 1. [TABLEAU_DE_BORD.md](file:///C:/Users/FP123/.gemini/antigravity/brain/e40b8ce4-622d-4dac-8a2f-91a19724e73e/TABLEAU_DE_BORD.md)

**Commencez ici !** Vue d'ensemble complète avec workflow visuel et commandes rapides.

### 2. [GUIDE_PREPARATION_APK.md](file:///C:/Users/FP123/.gemini/antigravity/brain/e40b8ce4-622d-4dac-8a2f-91a19724e73e/GUIDE_PREPARATION_APK.md)

Guide détaillé complet avec toutes les étapes et résolution de problèmes.

### 3. [GUIDE_RAPIDE_ANDROID_STUDIO.md](file:///C:/Users/FP123/.gemini/antigravity/brain/e40b8ce4-622d-4dac-8a2f-91a19724e73e/GUIDE_RAPIDE_ANDROID_STUDIO.md)

Guide visuel rapide pour Android Studio.

---

## 🎯 Workflow Simplifié

```
1. .\prepare-apk.ps1          → Prépare le projet
2. npx cap open android       → Ouvre Android Studio
3. Build → Build APK(s)       → Génère l'APK
4. adb install app-debug.apk  → Installe sur appareil
```

---

## 📱 Emplacements des APK

**APK Debug :**

```
android\app\build\outputs\apk\debug\app-debug.apk
```

**APK Release :**

```
android\app\build\outputs\apk\release\app-release.apk
```

---

## 🔧 Commandes Utiles

```powershell
# Rebuild complet
npm run build && npx cap sync android

# Ouvrir Android Studio
npx cap open android

# Nettoyer Gradle
cd android
.\gradlew clean
.\gradlew build
```

---

## ✅ État du Projet

- ✅ Capacitor configuré (v8.0.0)
- ✅ Projet Android présent
- ✅ Permissions configurées
- ✅ Build web fonctionnel

**Votre projet est prêt pour générer un APK ! 🎉**
