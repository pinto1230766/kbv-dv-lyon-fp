# 📱 Construction APK Android avec Android Studio

## 🎯 Vue d'ensemble

Ce guide explique comment transformer l'application web KBV Lyon en une application Android native (.apk) utilisant Capacitor et Android Studio.

## 📋 Prérequis

### Logiciels requis :

- ✅ **Android Studio** (version Arctic Fox ou supérieure)
- ✅ **Java JDK 11+** (inclus avec Android Studio)
- ✅ **Node.js & npm** (déjà installés)

### Configuration Android :

- **SDK Android** : API 21+ (Android 5.0)
- **Android Build Tools** : 30.0.0+
- **Android SDK Platform** : API 33+

---

## 🚀 Étapes de construction

### 1. Préparation du projet

```bash
# Installation des dépendances Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialisation Capacitor
npx cap init "KBV Lyon" "com.kbvlyon.fp" --web-dir=dist

# Ajout plateforme Android
npx cap add android
```

### 2. Build de l'application web

```bash
# Construction production
npm run build

# Synchronisation avec Android
npx cap sync android
```

### 3. Ouverture dans Android Studio

```bash
# Ouvrir le projet Android
npx cap open android
```

**OU manuellement :**

1. Ouvrir Android Studio
2. **File → Open**
3. Sélectionner le dossier `android/` dans votre projet
4. Cliquer **"Open"**

---

## 🔧 Configuration Android Studio

### Premier lancement :

1. **Laisser Gradle synchroniser** (peut prendre quelques minutes)
2. **Accepter les licences SDK** si demandé
3. **Installer les composants manquants** si nécessaire

### Configuration du projet :

1. Dans la barre latérale **"Project"** (gauche)
2. **app → src → main → AndroidManifest.xml**
3. Vérifier les permissions :
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.VIBRATE" />
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   <uses-permission android:name="android.permission.WAKE_LOCK" />
   ```

---

## 📦 Génération de l'APK

### Option 1 : Build Debug (recommandé pour commencer)

1. **Barre de menu** : **Build → Build Bundle(s)/APK(s) → Build APK(s)**
2. Attendre la fin du build
3. **Notification** : "APK(s) generated successfully"
4. **Localiser l'APK** :
   - `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2 : Build Release (pour publication)

1. **Créer un keystore** (si pas déjà fait) :

   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configuration du build** :

   - **File → Project Structure → Modules → app**
   - **Signing Config** : Créer une config release
   - Sélectionner votre keystore

3. **Build release** :
   - **Build → Generate Signed Bundle/APK**
   - Sélectionner **APK**
   - Choisir votre config de signature
   - **Build**

---

## 📱 Installation et test

### Installation sur appareil :

```bash
# Via ADB (appareil connecté)
adb install android/app/build/outputs/apk/debug/app-debug.apk

# OU copier manuellement l'APK sur l'appareil
```

### Test des fonctionnalités :

- ✅ **Interface responsive** sur tablette
- ✅ **Synchronisation Google Sheets**
- ✅ **Notifications push** (avec permissions)
- ✅ **Congrégations raccourcies**
- ✅ **Export PDF** des rapports

---

## 🐛 Dépannage

### Erreur commune : "Gradle sync failed"

```bash
# Nettoyer et reconstruire
cd android
./gradlew clean
./gradlew build
```

### Erreur : "SDK not found"

- **SDK Manager** dans Android Studio
- Installer **Android SDK Build-Tools**
- Installer **Android SDK Platform API 33+**

### Erreur : "Min SDK version"

- Vérifier `android/app/build.gradle`
- `minSdkVersion 21` (Android 5.0)

### Permissions notifications (Android 13+)

- Dans `AndroidManifest.xml` :

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

---

## 📋 Checklist avant publication

- [ ] **Build release** réussi
- [ ] **APK signé** avec keystore valide
- [ ] **Test installation** sur appareil réel
- [ ] **Permissions** configurées correctement
- [ ] **Icône app** personnalisée
- [ ] **Nom app** : "KBV Lyon"
- [ ] **Package ID** : "com.kbvlyon.fp"

---

## 🎯 Fonctionnalités de l'APK

### ✅ Implémentées :

- **Interface complète** (tablette optimisée)
- **Synchronisation Google Sheets**
- **Notifications push** Android
- **Raccourcis congrégations** (KBV, Assemblées)
- **Export PDF** des rapports
- **Gestion données** complète

### 📱 Spécifique Android :

- **Installation native** (.apk)
- **Notifications système**
- **Icône sur écran d'accueil**
- **Permissions natives**

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifier les logs** Android Studio
2. **Gradle sync** : Build → Make Project
3. **Clean build** : Build → Clean Project
4. **Invalidate caches** : File → Invalidate Caches

L'APK généré sera dans `android/app/build/outputs/apk/` 🎉
