# Handy Prevention — Fork N-Gage

## Vision du projet

Adapter **Handy** (outil de dictée vocale open source) pour les professionnels de la **prévention santé au travail** :
- Préventeurs / IPRP
- Médecins du travail
- Responsables HSE
- Ergonomes
- Consultants RPS
- Institutions (CARSAT, DIRECCTE, INRS)

## Pourquoi ce projet ?

| Besoin métier | Solution Handy Prevention |
|---------------|---------------------------|
| Confidentialité des données de santé | 100% offline, aucune donnée dans le cloud |
| Vocabulaire technique spécifique | Dictionnaire métier personnalisé |
| Rapidité de saisie sur le terrain | Dictée vocale → texte instantané |
| Multi-usage | Rapports, notes terrain, transcription réunions |

## Fonctionnalités cibles

### Phase 1 — Personnalisation de base
- [ ] Renommage et rebranding (nom, icône, couleurs)
- [ ] Dictionnaire de vocabulaire métier SST
- [ ] Templates de texte pré-formatés

### Phase 2 — Fonctionnalités métier
- [ ] Reconnaissance du vocabulaire spécifique (DUERP, RPS, AT/MP, etc.)
- [ ] Modèles de phrases types (conclusions, recommandations)
- [ ] Export structuré (markdown, PDF)

### Phase 3 — Intégrations (optionnel)
- [ ] Intégration avec outils métier courants
- [ ] Synchronisation sécurisée entre appareils

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React + TypeScript + Tailwind |
| Backend | Rust (Tauri v2) |
| Transcription | Whisper / Parakeet (offline) |
| VAD | Silero |

## Prérequis développement

- **Rust** (dernière version stable)
- **Bun** (gestionnaire de paquets JS)
- macOS, Windows ou Linux

## Commandes principales

```bash
# Installation des dépendances
bun install

# Mode développement
bun run tauri dev

# Build production
bun run tauri build
```

## Licence

Fork basé sur Handy (MIT License) — libre de modification et redistribution.

---

**Projet N-Gage** — Nicolas Graillot
