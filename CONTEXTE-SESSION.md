# N-Gage — Contexte pour reprise de session

*Dernière mise à jour : 4 février 2025*

---

## Résumé du projet

**N-Gage** est un fork de l'application open-source **Handy** (dictée vocale offline basée sur Whisper).

**Objectif** : Adapter Handy pour les professionnels SST (Santé et Sécurité au Travail) français avec :
- Rebranding complet (nom, logo, couleurs)
- Système de dictionnaires de vocabulaire métier
- Traduction française

**Stack technique** :
- **Tauri v2** (Rust backend + React/TypeScript frontend)
- **Whisper** via `transcribe-rs` (transcription vocale offline)
- **Bun** comme gestionnaire de packages

---

## État actuel (v1.0.0)

### Ce qui fonctionne

| Fonctionnalité | État |
|----------------|------|
| Rebranding complet (N-Gage) | ✅ |
| Logo et icônes personnalisées | ✅ |
| Traduction française | ✅ |
| Système de dictionnaires par packs | ✅ |
| Import .txt et .json | ✅ |
| Build macOS Apple Silicon | ✅ |
| Build macOS Intel | ✅ |
| GitHub Actions (macOS) | ✅ |

### Ce qui ne fonctionne pas encore

| Fonctionnalité | Problème | Piste |
|----------------|----------|-------|
| Build Windows (.msi) | whisper-rs-sys nécessite Vulkan SDK, timeout 6h sur GitHub Actions | Compiler sans Vulkan ou machine Windows locale |
| Build Linux | Manque `glslc` (shader compiler Vulkan) | Installer SDK Vulkan complet ou désactiver Vulkan |

---

## Architecture du projet

```
handy-prevention/
├── src/                          # Frontend React/TypeScript
│   ├── components/
│   │   ├── settings/
│   │   │   └── CustomWords.tsx   # UI gestion dictionnaires
│   │   └── icons/
│   │       └── NGageLogo.tsx     # Logo SVG N-Gage
│   ├── i18n/locales/fr/          # Traductions françaises
│   └── App.css                   # Couleurs (--accent: #264B63)
│
├── src-tauri/                    # Backend Rust
│   ├── src/
│   │   ├── settings.rs           # Structure CustomDictionary
│   │   ├── shortcut/mod.rs       # Commandes Tauri (add_dictionary, etc.)
│   │   ├── lib.rs                # Enregistrement des commandes
│   │   └── managers/
│   │       └── transcription.rs  # Fusion dictionnaires lors transcription
│   ├── icons/                    # Toutes les icônes (générées par tauri icon)
│   ├── tauri.conf.json           # Config app (nom, identifiant)
│   └── Cargo.toml                # Dépendances Rust
│
├── ressources/                   # Dictionnaires de vocabulaire
│   ├── dictionnaire-sst.json     # Vocabulaire SST (66 termes)
│   └── mots-sst.txt              # Version texte simple
│
├── .github/workflows/
│   └── build.yml                 # GitHub Actions multi-plateforme
│
├── TODO.md                       # Roadmap détaillée
├── GUIDE-TECHNIQUE.md            # Guide pédagogique complet
└── CONTEXTE-SESSION.md           # Ce fichier
```

---

## Modifications clés réalisées

### 1. Rebranding

**Fichiers modifiés :**
- `src-tauri/tauri.conf.json` : `productName: "N-Gage"`, `identifier: "fr.ngage.dictee"`
- `src-tauri/Cargo.toml` : `name = "ngage-dictee"`
- `package.json` : `name: "n-gage"`
- `src/App.css` : `--accent: #264B63` (bleu ardoise), `--accent-secondary: #F28705` (orange)

### 2. Système de dictionnaires

**Structure Rust** (`src-tauri/src/settings.rs`) :
```rust
pub struct CustomDictionary {
    pub id: String,
    pub name: String,
    pub words: Vec<String>,
    pub enabled: bool,
}
```

**Commandes Tauri** (`src-tauri/src/shortcut/mod.rs`) :
- `add_dictionary(id, name, words)` : Ajoute un dictionnaire
- `remove_dictionary(id)` : Supprime un dictionnaire
- `toggle_dictionary(id, enabled)` : Active/désactive

**Frontend** (`src/components/settings/CustomWords.tsx`) :
- Import de fichiers .txt (un mot par ligne, # = commentaire)
- Import de fichiers .json (formats flexibles)
- Toggles on/off par dictionnaire
- Compteur de mots

### 3. Icônes

Générées avec `bun x tauri icon logo-ngage.png` depuis une image 4167x4167.

Fichiers dans `src-tauri/icons/` :
- `icon.icns` (macOS)
- `icon.ico` (Windows)
- `icon.png` (Linux)
- Toutes les tailles PNG (32x32 → 512x512)

---

## GitHub Actions

**Fichier** : `.github/workflows/build.yml`

**État actuel** :
- macOS ARM64 : ✅ fonctionne
- macOS Intel : ✅ fonctionne
- Windows : ❌ échoue (Vulkan)
- Linux : ❌ désactivé (glslc)

**Tentatives pour Windows** :
1. `choco install vulkan-sdk` → package cassé (404)
2. `humbletim/setup-vulkan-sdk@v1.2.0` → utilise actions/cache v2 déprécié
3. Téléchargement direct LunarG → timeout 6h
4. `GGML_NO_VULKAN=1` → ne désactive pas complètement

**Piste non testée** : Compiler sur machine Windows locale ou trouver la feature Cargo pour désactiver Vulkan dans `transcribe-rs`.

---

## Dépôt GitHub

- **URL** : https://github.com/nikau79-ui/n-gage-dictee-vocale
- **Branche principale** : `main`
- **Releases** : Draft automatique via GitHub Actions

---

## Commandes utiles

```bash
# Développement
cd projets/handy-prevention
bun run tauri dev

# Build production (macOS)
bun run tauri build

# Générer icônes depuis une image
bun x tauri icon logo-ngage.png

# Lancer GitHub Actions manuellement
gh workflow run "Build & Release" --ref main

# Voir les logs d'un run
gh run view <run_id> --log-failed
```

---

## Prochaines étapes prioritaires

1. **Build Windows** : Trouver comment compiler whisper-rs sans Vulkan
2. **Dictionnaire SST pré-activé** : Au premier lancement
3. **Guide de prise en main** : Pour utilisateurs non-tech
4. **Page téléchargement** : n-gage.fr/telechargement

Voir `TODO.md` pour la roadmap complète.

---

## Contacts / Ressources

- **Projet original** : [Handy](https://github.com/mxgnus-de/handy) par mxgnus-de
- **Whisper** : OpenAI (modèle de transcription)
- **Tauri** : https://tauri.app/
- **Propriétaire** : Nicolas Graillot (N-Gage, Toulouse)
