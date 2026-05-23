# JOURNAL — N-Gage Dictée Vocale

> Historique chronologique des sessions de travail sur ce projet. Append-only.

## Session 1 — 23/05/2026 (~2h30, après-midi)

**Contexte** : reprise du projet dormant depuis février 2025 après que Nicolas a redemandé une version Windows utilisable.

**Travail réalisé** :
- Projet déplacé de `04-clients/handy-prevention/` vers `06-outils-rnd/ngage-dictee-vocale/` (R&D interne, pas mission client).
- Brainstorming structuré (superpowers) : spec + plan rédigés, périmètre cadré à "un .msi Windows utilisable par Nicolas".
- Fix CI #1 : Vulkan SDK 1.3.296.0 installé via LunarG silent installer (`--accept-licenses --default-answer --confirm-command install`), exports `VULKAN_SDK` et `PATH` via `GITHUB_ENV`/`GITHUB_PATH` (et non `$env:VAR` qui ne persistait pas — diagnostic de la cause probable des 4 échecs de février 2025).
- Fix CI #2 : fail-fast sur erreurs d'installation Vulkan (`-PassThru` + check `ExitCode`, `Test-Path glslc.exe` dans un `if`).
- Fix bundling : retrait de la `signCommand` héritée du fork Handy (pointait vers `trusted-signing-cli` + compte Azure de CJ Pais → `program not found` au bundling).
- 4 commits propres sur branche `fix/windows-vulkan-build`, pushés.
- **Build Windows .msi réussi** au 2e run CI : run `26330580791`, .msi 25 Mo, 18 min.
- Test installation Windows par Nicolas : .msi s'installe correctement.

**Décisions** :
- Projet repositionné R&D interne (pas client) → cohérent avec sa nature : outil offert/diffusable, pas mission facturée.
- .msi non signé pour l'instant (SmartScreen warning normal) — code signing reporté à plus tard si besoin de distribution large.
- Branche `fix/windows-vulkan-build` **non mergée dans main** tant que runtime Windows pas validé.
- Fallback CPU-only (fork transcribe-rs) documenté dans le spec, pas activé.

**En suspens** :
- **Runtime Windows à diagnostiquer** : Nicolas rapporte "ce n'était pas détecté, ça ne fonctionnait pas" au 1er test. 4 pistes à explorer :
  1. Autorisation micro Windows pas accordée
  2. Raccourci global `Ctrl+Shift+Space` capté par autre app
  3. Modèle Whisper pas téléchargé / corrompu
  4. Debug Mode `Ctrl+Shift+D` pour voir les logs internes
- Merge `fix/windows-vulkan-build` → `main` après validation runtime.
- Dictionnaire SST pré-activé au 1er lancement.
- Onboarding simplifié non-tech.
- Page n-gage.fr/telechargement.

**Spec + plan** : `docs/superpowers/specs/2026-05-23-build-windows-vulkan-design.md` et `docs/superpowers/plans/2026-05-23-build-windows-vulkan.md`
