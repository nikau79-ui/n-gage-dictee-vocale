# Guide technique — De Handy à N-Gage

*Ce guide explique toutes les modifications réalisées pour transformer Handy en N-Gage, de manière pédagogique.*

---

## Table des matières

1. [Comprendre la structure du projet](#1-comprendre-la-structure-du-projet)
2. [Le rebranding (changement de nom et couleurs)](#2-le-rebranding)
3. [Le système de dictionnaires personnalisés](#3-le-système-de-dictionnaires)
4. [Les icônes de l'application](#4-les-icônes)
5. [Compiler et distribuer l'application](#5-compiler-et-distribuer)
6. [Résumé des fichiers modifiés](#6-résumé-des-fichiers-modifiés)

---

## 1. Comprendre la structure du projet

### Qu'est-ce que Tauri ?

Tauri est un framework qui permet de créer des applications de bureau (macOS, Windows, Linux) en combinant :

- **Un backend en Rust** (langage de programmation performant et sécurisé)
- **Un frontend web** (React, TypeScript, HTML/CSS)

C'est comme si tu créais un site web, mais emballé dans une application native.

### Structure des dossiers

```
handy-prevention/
├── src/                      # FRONTEND (ce que l'utilisateur voit)
│   ├── components/           # Composants React (boutons, formulaires...)
│   ├── i18n/locales/         # Traductions (fr, en...)
│   └── App.css               # Styles CSS (couleurs, mise en page)
│
├── src-tauri/                # BACKEND (la logique de l'application)
│   ├── src/
│   │   ├── settings.rs       # Gestion des paramètres utilisateur
│   │   ├── shortcut/mod.rs   # Commandes appelables depuis le frontend
│   │   └── managers/         # Logique métier (transcription, audio...)
│   ├── icons/                # Icônes de l'application
│   ├── tauri.conf.json       # Configuration de l'app (nom, identifiant...)
│   └── Cargo.toml            # Dépendances Rust (comme package.json)
│
├── package.json              # Dépendances JavaScript
└── ressources/               # Nos dictionnaires de vocabulaire
```

### Communication Frontend ↔ Backend

```
┌─────────────────────┐         ┌─────────────────────┐
│      FRONTEND       │         │       BACKEND       │
│   (React/TypeScript)│ ──────► │       (Rust)        │
│                     │ commande│                     │
│  "Importer un       │         │  Enregistre le      │
│   dictionnaire"     │         │  dictionnaire dans  │
│                     │ ◄────── │  les settings       │
│  Affiche le         │ réponse │                     │
│  dictionnaire       │         │                     │
└─────────────────────┘         └─────────────────────┘
```

Le frontend appelle des **commandes Tauri** (définies en Rust), et le backend répond.

---

## 2. Le rebranding

### 2.1 Changer le nom de l'application

**Fichier : `src-tauri/tauri.conf.json`**

```json
{
  "productName": "N-Gage",           // Nom affiché
  "identifier": "fr.ngage.dictee",   // Identifiant unique (style domaine inversé)
  "version": "1.0.0"
}
```

**Fichier : `src-tauri/Cargo.toml`**

```toml
[package]
name = "ngage-dictee"    # Nom technique (pas d'espaces, pas de majuscules)
version = "1.0.0"
```

**Fichier : `package.json`**

```json
{
  "name": "n-gage",
  "version": "1.0.0",
  "description": "Dictée vocale pour professionnels SST"
}
```

### 2.2 Changer les couleurs

**Fichier : `src/App.css`**

Les couleurs sont définies comme variables CSS :

```css
:root {
  /* AVANT (Handy - violet) */
  --accent: #8B5CF6;

  /* APRÈS (N-Gage - bleu ardoise + orange) */
  --accent: #264B63;        /* Bleu ardoise - couleur principale */
  --accent-secondary: #F28705;  /* Orange - couleur d'accent */
}
```

Ces variables sont ensuite utilisées partout :
```css
.button {
  background-color: var(--accent);  /* Utilise automatiquement #264B63 */
}
```

**Avantage** : Changer une variable = changer la couleur partout.

### 2.3 Changer le logo dans l'interface

**Fichier : `src/components/icons/NGageLogo.tsx`**

C'est un composant React qui contient le logo en SVG (format vectoriel) :

```tsx
export const NGageLogo = () => (
  <svg viewBox="0 0 100 100">
    {/* Le dessin du logo en code SVG */}
    <path d="..." fill="#264B63" />
  </svg>
);
```

Le SVG est du code, pas une image. Avantage : il s'adapte à toutes les tailles sans pixeliser.

### 2.4 Traduire en français

**Fichier : `src/i18n/locales/fr/translation.json`**

Structure d'un fichier de traduction :

```json
{
  "settings": {
    "title": "Paramètres",
    "advanced": {
      "customWords": {
        "title": "Vocabulaire personnalisé",
        "importDictionary": "Importer un dictionnaire",
        "importSuccess": "Dictionnaire \"{{name}}\" importé ({{count}} mots)"
      }
    }
  }
}
```

- Les clés sont hiérarchiques (settings.advanced.customWords.title)
- `{{name}}` et `{{count}}` sont des variables remplacées dynamiquement

**Dans le code React :**

```tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

// Affiche "Vocabulaire personnalisé"
<h1>{t("settings.advanced.customWords.title")}</h1>

// Affiche "Dictionnaire "SST" importé (66 mots)"
<p>{t("settings.advanced.customWords.importSuccess", { name: "SST", count: 66 })}</p>
```

---

## 3. Le système de dictionnaires

C'est la fonctionnalité principale ajoutée à N-Gage.

### 3.1 Comment ça marche (vue d'ensemble)

```
┌─────────────────┐
│ Fichier .txt    │
│ ou .json        │
└────────┬────────┘
         │ Import
         ▼
┌─────────────────┐
│ Frontend React  │  Lit le fichier, extrait les mots
└────────┬────────┘
         │ Commande Tauri
         ▼
┌─────────────────┐
│ Backend Rust    │  Stocke dans les settings
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Transcription   │  Utilise les mots pour corriger
└─────────────────┘
```

### 3.2 Structure de données (Rust)

**Fichier : `src-tauri/src/settings.rs`**

On définit ce qu'est un dictionnaire :

```rust
// Structure = un "moule" pour créer des objets
pub struct CustomDictionary {
    pub id: String,       // Identifiant unique (ex: "dict_1706978400000")
    pub name: String,     // Nom affiché (ex: "Vocabulaire SST")
    pub words: Vec<String>,  // Liste de mots (Vec = tableau dynamique)
    pub enabled: bool,    // Activé ou non
}
```

Et on l'ajoute aux paramètres de l'application :

```rust
pub struct Settings {
    // ... autres paramètres ...
    pub custom_words: Vec<String>,           // Mots individuels
    pub custom_dictionaries: Vec<CustomDictionary>,  // Dictionnaires
}
```

### 3.3 Commandes Tauri (Rust)

**Fichier : `src-tauri/src/shortcut/mod.rs`**

Les commandes sont des fonctions Rust appelables depuis JavaScript :

```rust
// Le #[tauri::command] rend cette fonction appelable depuis le frontend
#[tauri::command]
pub fn add_dictionary(
    app: AppHandle,           // Accès à l'application
    id: String,               // Paramètres reçus du frontend
    name: String,
    words: Vec<String>
) -> Result<(), String> {     // Retourne Ok ou une erreur

    // 1. Charger les settings actuels
    let mut settings = Settings::load(&app);

    // 2. Créer le nouveau dictionnaire
    let dictionary = CustomDictionary {
        id,
        name,
        words,
        enabled: true,  // Activé par défaut
    };

    // 3. L'ajouter à la liste
    settings.custom_dictionaries.push(dictionary);

    // 4. Sauvegarder
    settings.save(&app);

    Ok(())
}
```

**Enregistrer les commandes** (`src-tauri/src/lib.rs`) :

```rust
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        // ... autres commandes ...
        shortcut::add_dictionary,
        shortcut::remove_dictionary,
        shortcut::toggle_dictionary,
    ])
```

### 3.4 Interface utilisateur (React)

**Fichier : `src/components/settings/CustomWords.tsx`**

**Lecture d'un fichier importé :**

```tsx
const handleFileImport = async (event) => {
  const file = event.target.files[0];
  const content = await file.text();  // Lire le contenu

  // Parser selon le format
  if (file.name.endsWith('.json')) {
    const data = JSON.parse(content);
    words = data.words;
  } else {
    // Fichier .txt : un mot par ligne
    words = content.split('\n').filter(line => !line.startsWith('#'));
  }

  // Appeler la commande Rust
  await commands.addDictionary(id, name, words);
};
```

**Afficher les dictionnaires avec toggles :**

```tsx
{customDictionaries.map((dict) => (
  <div key={dict.id}>
    {/* Toggle on/off */}
    <input
      type="checkbox"
      checked={dict.enabled}
      onChange={(e) => handleToggleDictionary(dict.id, e.target.checked)}
    />

    {/* Nom et nombre de mots */}
    <span>{dict.name} ({dict.words.length} mots)</span>

    {/* Bouton supprimer */}
    <button onClick={() => handleRemoveDictionary(dict.id)}>
      Supprimer
    </button>
  </div>
))}
```

### 3.5 Utilisation lors de la transcription

**Fichier : `src-tauri/src/managers/transcription.rs`**

Quand Whisper transcrit l'audio, on corrige ensuite avec nos mots :

```rust
// 1. Collecter tous les mots actifs
let mut all_custom_words: Vec<String> = settings.custom_words.clone();

for dictionary in &settings.custom_dictionaries {
    if dictionary.enabled {  // Seulement les dictionnaires activés
        all_custom_words.extend(dictionary.words.clone());
    }
}

// 2. Appliquer la correction
let corrected_text = apply_custom_words(
    &transcription_result,
    &all_custom_words,
    settings.word_correction_threshold,  // Seuil de similarité
);
```

**Comment fonctionne la correction ?**

Le fichier `src-tauri/src/audio_toolkit/text.rs` contient :

1. **Distance de Levenshtein** : compte le nombre de modifications (ajout, suppression, remplacement) pour passer d'un mot à un autre
   - "CARSAT" vs "karsa" = 2 modifications → similaire
   - "CARSAT" vs "bateau" = 5 modifications → différent

2. **Soundex** : compare la phonétique
   - "DUERP" et "duère" sonnent pareil → match

```rust
fn apply_custom_words(text: &str, custom_words: &[String], threshold: f32) -> String {
    for word in text.split_whitespace() {
        for custom_word in custom_words {
            if is_similar(word, custom_word, threshold) {
                // Remplacer "karsa" par "CARSAT"
                text = text.replace(word, custom_word);
            }
        }
    }
    text
}
```

---

## 4. Les icônes

### 4.1 Formats nécessaires

Une application multi-plateforme a besoin de plusieurs formats d'icône :

| Format | Plateforme | Tailles |
|--------|------------|---------|
| `.icns` | macOS | Multiple (16→1024) |
| `.ico` | Windows | Multiple (16→256) |
| `.png` | Linux, Web | 32, 64, 128, 256, 512 |
| `Square*.png` | Windows Store | Diverses |
| `AppIcon-*.png` | iOS | Diverses |
| `mipmap-*/ic_launcher.png` | Android | hdpi, mdpi, xhdpi... |

### 4.2 Générer toutes les icônes automatiquement

Tauri a un outil intégré. À partir d'une seule image source (1024x1024 ou plus) :

```bash
bun x tauri icon mon-logo.png
```

Ça génère automatiquement les ~50 fichiers d'icônes dans `src-tauri/icons/`.

### 4.3 Où sont stockées les icônes

```
src-tauri/icons/
├── icon.icns          # macOS
├── icon.ico           # Windows
├── icon.png           # Linux
├── 32x32.png          # Petites tailles
├── 128x128.png
├── Square*.png        # Windows Store
├── ios/               # iOS
│   └── AppIcon-*.png
└── android/           # Android
    └── mipmap-*/
```

---

## 5. Compiler et distribuer

### 5.1 Mode développement

Pour tester pendant le développement :

```bash
bun run tauri dev
```

- Recharge automatiquement quand tu modifies le code
- Plus rapide mais pas optimisé
- L'icône dans le Dock peut ne pas être à jour (cache macOS)

### 5.2 Compiler pour production

```bash
bun run tauri build
```

Génère :
- `src-tauri/target/release/bundle/macos/N-Gage.app` — L'application
- `src-tauri/target/release/bundle/dmg/N-Gage_1.0.0_aarch64.dmg` — L'installateur

### 5.3 Distribuer

Le fichier `.dmg` peut être :
- Envoyé par email/Drive/Dropbox
- Mis sur un site web
- Distribué via GitHub Releases

**Pour d'autres plateformes :**
- Windows : `bun run tauri build` sur une machine Windows → génère `.msi`
- Linux : `bun run tauri build` sur Linux → génère `.deb`, `.AppImage`

---

## 6. Résumé des fichiers modifiés

### Rebranding (nom, couleurs, logo)

| Fichier | Ce qu'on a changé |
|---------|-------------------|
| `src-tauri/tauri.conf.json` | Nom de l'app, identifiant |
| `src-tauri/Cargo.toml` | Nom du package Rust |
| `package.json` | Nom et description |
| `src/App.css` | Variables de couleurs |
| `src/components/icons/NGageLogo.tsx` | Logo SVG |
| `src/i18n/locales/fr/translation.json` | Traductions françaises |
| `src-tauri/icons/` | Toutes les icônes |

### Système de dictionnaires (nouvelle fonctionnalité)

| Fichier | Ce qu'on a ajouté |
|---------|-------------------|
| `src-tauri/src/settings.rs` | Structure `CustomDictionary` |
| `src-tauri/src/shortcut/mod.rs` | Commandes `add_dictionary`, `remove_dictionary`, `toggle_dictionary` |
| `src-tauri/src/lib.rs` | Enregistrement des commandes |
| `src-tauri/src/managers/transcription.rs` | Fusion des dictionnaires actifs |
| `src/components/settings/CustomWords.tsx` | Interface d'import et gestion |
| `src/bindings.ts` | Types TypeScript générés automatiquement |

### Ressources ajoutées

| Fichier | Contenu |
|---------|---------|
| `ressources/dictionnaire-sst.json` | Vocabulaire SST (66 termes) |
| `ressources/mots-sst.txt` | Version texte simple |
| `ressources/vocabulaire-sar-cospas.txt` | Exemple SAR/Cospas-Sarsat |

---

## Conclusion

Pour résumer, transformer Handy en N-Gage a impliqué :

1. **Rebranding** : Modifier quelques fichiers de configuration (nom, couleurs, textes)
2. **Nouvelle fonctionnalité** : Ajouter du code Rust (backend) + React (frontend) pour les dictionnaires
3. **Icônes** : Générer automatiquement toutes les tailles avec `tauri icon`
4. **Distribution** : Compiler avec `tauri build` pour obtenir un installateur

Le plus complexe était le système de dictionnaires car il touche à la fois :
- La structure de données (Rust)
- La communication frontend/backend (commandes Tauri)
- L'interface utilisateur (React)
- La logique de transcription (correction des mots)

Mais chaque partie, prise individuellement, reste accessible !

---

*Guide créé le 3 février 2025 — N-Gage v1.0.0*
