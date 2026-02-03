# N-Gage — TODO & Évolutions

*Dernière mise à jour : 3 février 2025*

---

## Terminé (v1.0.0)

### Branding
- [x] Nom définitif : **N-Gage**
- [x] Couleurs : Bleu Ardoise (#264B63) + Orange (#F28705)
- [x] Logo N-Gage en SVG
- [x] Métadonnées mises à jour (package.json, Cargo.toml, tauri.conf.json)

### Traductions
- [x] Traduction française complète
- [x] Toutes les références "Handy" → "N-Gage"

### Vocabulaire métier
- [x] Dictionnaire SST créé (`ressources/dictionnaire-sst.json`)
- [x] Liste de mots SST (`ressources/mots-sst.txt`)
- [x] Vocabulaire SAR/Cospas-Sarsat (exemple test)

### Système de dictionnaires (nouvelle fonctionnalité)
- [x] Structure `CustomDictionary` dans Rust
- [x] Commandes Tauri : `add_dictionary`, `remove_dictionary`, `toggle_dictionary`
- [x] Fusion automatique des mots actifs lors de la transcription
- [x] Interface UI avec toggles par dictionnaire
- [x] Import de fichiers .txt et .json
- [x] Compteur de mots par dictionnaire

### Build & Distribution
- [x] Build macOS Apple Silicon (.dmg) — 15 Mo
- [x] Raccourci bureau pour mode développement

---

## À faire — Priorité haute

### Build multi-plateforme
- [ ] Build Windows (.msi)
- [ ] Build Linux (.deb, .AppImage)
- [ ] GitHub Actions pour builds automatiques

### Icône personnalisée
- [x] Créer icône N-Gage (remplacer icône Handy originale)
- [x] Toutes les tailles (16x16 → 1024x1024)
- [ ] Icône barre système (tray)

### Documentation
- [ ] Guide de prise en main rapide
- [ ] Tutoriel vidéo court
- [ ] FAQ

---

## À faire — Priorité moyenne

### Améliorations vocabulaire
- [ ] Bouton "Exporter" les dictionnaires
- [ ] Édition des mots dans un dictionnaire existant
- [ ] Expressions multi-mots (avec espaces)

### Interface
- [ ] Indicateur du dictionnaire actif pendant transcription
- [ ] Statistiques (mots corrigés par session)

### Templates (Phase 2)
- [ ] Templates de phrases types (intro rapport, conclusion...)
- [ ] Interface de gestion des templates
- [ ] Insertion rapide par raccourci

---

## À faire — Priorité basse

### Déploiement entreprise
- [ ] Documentation déploiement GPO (Windows)
- [ ] Package MDM (macOS)
- [ ] Configuration centralisée des dictionnaires

### Intégrations
- [ ] Intégration n8n pour automatisation
- [ ] Export PDF avec mise en forme
- [ ] Mode "rapport structuré"

---

## Réflexions futures

### White-label / Personnalisation par client
- [ ] Rebranding facile (nom + icône + couleurs) via fichier de config
- [ ] Script de génération de builds personnalisés par service/entreprise
- [ ] Version "générique SST" nationale vs versions personnalisées

**Note** : La plupart des utilisateurs préfèrent une version nationale standard. La personnalisation par client serait un service premium sur demande.

---

## Fichiers clés du projet

| Fichier | Description |
|---------|-------------|
| `src-tauri/src/settings.rs` | Structure CustomDictionary |
| `src-tauri/src/managers/transcription.rs` | Fusion des mots actifs |
| `src-tauri/src/shortcut/mod.rs` | Commandes Tauri dictionnaires |
| `src/components/settings/CustomWords.tsx` | UI dictionnaires |
| `src/i18n/locales/fr/translation.json` | Traductions françaises |
| `ressources/` | Dictionnaires de vocabulaire |

---

## Historique

### v1.0.0 — 3 février 2025
- Fork initial de Handy
- Rebranding complet N-Gage
- Système de dictionnaires par packs
- Build macOS fonctionnel
- Icône N-Gage personnalisée (toutes tailles)
- Dépôt GitHub : github.com/nikau79-ui/n-gage-dictee-vocale
