# MEMORY — N-Gage Dictée Vocale

> État actuel synthétique du projet. Mis à jour à chaque session, pas empilé.

## Statut

- v1.0.0 livrée sur macOS (Apple Silicon + Intel) — février 2025
- **Build Windows .msi fonctionnel en CI — 23/05/2026** (via Vulkan SDK 1.3.296.0)
- Installation Windows OK le 23/05 mais runtime non validé (à creuser : dictée pas détectée au 1er test de Nicolas)
- Projet déplacé de `04-clients/handy-prevention/` → `06-outils-rnd/ngage-dictee-vocale/` le 23/05/2026 (outil R&D interne, pas client)

## Stack

- Tauri v2 (Rust backend + React/TypeScript frontend)
- Whisper via `transcribe-rs 0.2.2` (features : whisper, parakeet, moonshine)
- Bun pour le frontend
- Vulkan SDK 1.3.296.0 (Windows) + Metal (macOS) pour l'accélération GPU

## Repo

- GitHub : `github.com/nikau79-ui/n-gage-dictee-vocale`
- Branche principale : `main`
- Branche de travail courante : `fix/windows-vulkan-build` (pas encore mergée, en attente de validation runtime Windows)

## Builds CI

| Plateforme | Statut | Run de référence |
|---|---|---|
| macOS ARM64 | ✅ | tous runs |
| macOS Intel | ✅ | tous runs |
| Windows x64 | ✅ depuis 23/05/2026 | `26330580791` (.msi 25 Mo) |
| Linux | ❌ | Désactivé (manque `glslc`), à reprendre |

## Décisions structurantes

- **23/05/2026** : Vulkan en CI Windows via installateur LunarG silencieux (cf `docs/superpowers/specs/2026-05-23-build-windows-vulkan-design.md`)
- **23/05/2026** : retrait de la `signCommand` héritée du fork Handy (pointait vers le compte Azure de CJ Pais, faisait planter le bundling .msi). Conséquence : .msi non signé, SmartScreen warning normal au 1er lancement Windows.
- Fallback CPU-only (fork transcribe-rs) reste documenté dans le spec si Vulkan recasse plus tard.

## Points d'attention

- **Runtime Windows non validé** : à creuser au prochain run. Nicolas a installé le .msi le 23/05 mais "ce n'était pas détecté, ça ne fonctionnait pas". Pistes à explorer en priorité :
  1. Autorisation micro Windows pas accordée → vérifier Paramètres → Confidentialité → Microphone
  2. Raccourci global `Ctrl+Shift+Space` pas capté (conflit avec autre app Windows) → reconfigurer dans Settings
  3. Modèle Whisper pas téléchargé / corrompu → relancer le download via Settings → Models
  4. Activer Debug Mode (`Ctrl+Shift+D`) pour voir les logs
- Branche `fix/windows-vulkan-build` à NE PAS merger dans `main` tant que runtime non validé

## Prochaines priorités

Voir `TODO.md`.
