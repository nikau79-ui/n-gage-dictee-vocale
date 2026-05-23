# Build Windows .msi avec Vulkan — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produire un `.msi` Windows fonctionnel avec accélération Vulkan, téléchargeable depuis GitHub Actions, installable comme un utilisateur lambda sur le PC Windows de Nicolas.

**Architecture:** Modifier `.github/workflows/build.yml` pour installer Vulkan SDK 1.3.296.0 via l'installateur officiel LunarG en mode silencieux, exporter `VULKAN_SDK` et `PATH` via `GITHUB_ENV` / `GITHUB_PATH`, retirer les flags `GGML_NO_VULKAN`/`WHISPER_NO_VULKAN` qui annulaient l'effort. Aucune modification du code Rust/TS — seulement le workflow CI et la doc.

**Tech Stack:** GitHub Actions (Windows runner), PowerShell, Vulkan SDK 1.3.296.0 (LunarG), Tauri v2, `transcribe-rs 0.2.2` + `whisper-rs-sys`.

**Spec :** `docs/superpowers/specs/2026-05-23-build-windows-vulkan-design.md`

---

## File Structure

| Fichier | Action | Responsabilité |
|---|---|---|
| `.github/workflows/build.yml` | Modifier | Workflow CI — ajouter step Vulkan SDK, retirer flags NO_VULKAN |
| `BUILD.md` | Modifier | Documenter la version Vulkan SDK pinnée et la procédure manuelle |
| `TODO.md` | Modifier | Marquer "build Windows" comme fait |
| `MEMORY.md` (à créer si absent) | Créer/Modifier | Tracer l'état du build Windows et le nouveau chemin du projet |

Aucun fichier de code source (Rust ou TypeScript) n'est modifié.

---

## Task 1 : Préparer la branche de travail et vérifier l'état du repo

**Files:**
- Aucun fichier modifié, vérifications uniquement

- [ ] **Step 1 : Vérifier qu'on est dans le bon dossier**

Run :
```bash
cd "/Users/nikau/MonProjetIA/Claude code/projets/06-outils-rnd/ngage-dictee-vocale" && pwd && git status
```

Expected : on est dans `ngage-dictee-vocale`, working tree clean ou seulement avec changements de session (déplacement du dossier).

- [ ] **Step 2 : Vérifier que la remote GitHub est bien configurée**

Run :
```bash
git remote -v
```

Expected : remote `origin` pointe vers `github.com/nikau79-ui/n-gage-dictee-vocale`.

- [ ] **Step 3 : Créer une branche dédiée pour le fix Windows**

Run :
```bash
git checkout -b fix/windows-vulkan-build
```

Expected : `Switched to a new branch 'fix/windows-vulkan-build'`.

---

## Task 2 : Modifier le workflow GitHub Actions

**Files:**
- Modify: `.github/workflows/build.yml` lignes 59-75 (step Windows + env du step Build)

- [ ] **Step 1 : Remplacer le step "Install Windows dependencies"**

Dans `.github/workflows/build.yml`, remplacer les lignes 59-64 :

```yaml
      # Windows : cmake seulement (pas de Vulkan pour accélérer le build)
      - name: Install Windows dependencies
        if: matrix.platform == 'windows-latest'
        shell: pwsh
        run: |
          choco install cmake --installargs 'ADD_CMAKE_TO_PATH=System' -y
```

par :

```yaml
      # Windows : cmake puis Vulkan SDK (LunarG installateur silencieux officiel)
      - name: Install cmake (Windows)
        if: matrix.platform == 'windows-latest'
        shell: pwsh
        run: choco install cmake --installargs 'ADD_CMAKE_TO_PATH=System' -y

      - name: Install Vulkan SDK (Windows)
        if: matrix.platform == 'windows-latest'
        shell: pwsh
        run: |
          $version = "1.3.296.0"
          $url = "https://sdk.lunarg.com/sdk/download/$version/windows/VulkanSDK-$version-Installer.exe"
          Write-Host "Downloading Vulkan SDK $version from $url"
          Invoke-WebRequest -Uri $url -OutFile "$env:TEMP\vulkan-sdk.exe"
          Write-Host "Running silent installer..."
          Start-Process -FilePath "$env:TEMP\vulkan-sdk.exe" -ArgumentList "--accept-licenses","--default-answer","--confirm-command","install" -Wait
          Write-Host "Exporting environment variables for next steps"
          echo "VULKAN_SDK=C:\VulkanSDK\$version" >> $env:GITHUB_ENV
          echo "C:\VulkanSDK\$version\Bin" >> $env:GITHUB_PATH
          Write-Host "Verifying installation..."
          Test-Path "C:\VulkanSDK\$version\Bin\glslc.exe"
```

- [ ] **Step 2 : Retirer les flags `GGML_NO_VULKAN` et `WHISPER_NO_VULKAN` du step "Build Tauri app"**

Dans le même fichier, dans le step "Build Tauri app" (vers ligne 69-75), remplacer le bloc `env:` :

```yaml
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # Désactiver Vulkan pour accélérer le build
          GGML_NO_VULKAN: "1"
          WHISPER_NO_VULKAN: "1"
```

par :

```yaml
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 3 : Vérifier la syntaxe YAML**

Run :
```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/build.yml'))" && echo "YAML OK"
```

Expected : `YAML OK`. Si erreur de parsing, relire la modification.

- [ ] **Step 4 : Commit**

Run :
```bash
git add .github/workflows/build.yml
git commit -m "fix(ci): install Vulkan SDK 1.3.296.0 on Windows runner

Replaces the NO_VULKAN workaround that didn't actually disable Vulkan
compilation. Uses LunarG official silent installer and exports
VULKAN_SDK + PATH via GITHUB_ENV / GITHUB_PATH so subsequent steps
(cargo/whisper-rs-sys build.rs) detect it correctly.

Refs: docs/superpowers/specs/2026-05-23-build-windows-vulkan-design.md"
```

Expected : commit créé, `git log -1` montre le message.

---

## Task 3 : Déclencher un premier run et analyser les logs

**Files:** aucun

- [ ] **Step 1 : Pousser la branche**

Run :
```bash
git push -u origin fix/windows-vulkan-build
```

Expected : branche poussée sur GitHub.

- [ ] **Step 2 : Déclencher le workflow manuellement**

Run :
```bash
gh workflow run "Build & Release" --ref fix/windows-vulkan-build
```

Expected : `Created workflow_dispatch event for build.yml at fix/windows-vulkan-build`.

- [ ] **Step 3 : Récupérer l'ID du run**

Attendre 5-10 secondes que le run apparaisse, puis :

```bash
gh run list --branch fix/windows-vulkan-build --limit 1
```

Expected : un run en `queued` ou `in_progress`. Noter le `<run_id>` (1ère colonne numérique).

- [ ] **Step 4 : Suivre le run en temps réel**

Run :
```bash
gh run watch <run_id>
```

Expected : affichage live des steps. Le job Windows doit passer par : Checkout → Setup Bun → Setup Rust → Cache Rust → Install cmake → Install Vulkan SDK → Install dependencies → Build Tauri app.

- [ ] **Step 5 : Si le job Windows réussit, vérifier l'artefact**

Run :
```bash
gh run view <run_id>
gh run download <run_id> --name N-Gage-Windows --dir /tmp/ngage-windows-test
ls -la /tmp/ngage-windows-test/
```

Expected : un fichier `.msi` présent. Si oui → passer à Task 5. Si non → Task 4.

- [ ] **Step 6 : Si le job Windows échoue, récupérer les logs**

Run :
```bash
gh run view <run_id> --log-failed > /tmp/run-failed.log
grep -iE "(error|fatal|vulkan|glslc|cmake|whisper)" /tmp/run-failed.log | head -50
```

Expected : identifier la cause exacte de l'échec. Comparer avec la matrice de fallback (Task 4).

---

## Task 4 : Itérer sur l'échec (max 3 itérations)

Cette tâche est conditionnelle : à exécuter uniquement si Task 3 step 5 montre un échec.

**Files:**
- Modify: `.github/workflows/build.yml` (selon le symptôme)

- [ ] **Step 1 : Matcher le symptôme avec la matrice de fallback**

Consulter la section 9 du spec (`docs/superpowers/specs/2026-05-23-build-windows-vulkan-design.md`).

| Symptôme dans les logs | Action |
|---|---|
| `Invoke-WebRequest : The request was aborted` ou timeout | Pinner version antérieure `1.3.275.0` (changer `$version` dans le step Vulkan SDK) |
| `Could not find VULKAN_SDK` après installation | Ajouter `Write-Host (Get-ChildItem C:\VulkanSDK)` après le `Start-Process` pour vérifier où le SDK est installé. Adapter le chemin si différent de `C:\VulkanSDK\$version`. |
| `glslc: command not found` au build whisper-rs-sys | Ajouter `echo "C:\VulkanSDK\$version\Lib" >> $env:GITHUB_PATH` après la ligne PATH existante |
| `LINK : fatal error LNK1181: cannot open input file 'vulkan-1.lib'` | Exporter `VK_SDK_PATH=C:\VulkanSDK\$version` en plus de `VULKAN_SDK` (ajouter `echo "VK_SDK_PATH=C:\VulkanSDK\$version" >> $env:GITHUB_ENV`) |
| Autre erreur non listée | Faire un commit de diagnostic ajoutant `Write-Host` partout, relancer, lire les logs |

- [ ] **Step 2 : Appliquer la correction au workflow**

Modifier `.github/workflows/build.yml` avec l'action correspondante.

- [ ] **Step 3 : Commit et push**

Run :
```bash
git add .github/workflows/build.yml
git commit -m "fix(ci): <description courte de la correction>"
git push
```

- [ ] **Step 4 : Relancer le workflow**

Run :
```bash
gh workflow run "Build & Release" --ref fix/windows-vulkan-build
sleep 10
gh run list --branch fix/windows-vulkan-build --limit 1
gh run watch <nouveau_run_id>
```

- [ ] **Step 5 : Vérifier l'itération**

Si succès → Task 5. Si échec et compteur < 3 → revenir à Step 1. Si échec et compteur = 3 → Task 4b (basculement fallback).

- [ ] **Step 6 : (conditionnel) Task 4b — Bascule fallback Approche C**

Si 3 itérations Vulkan ont échoué : arrêter, prévenir Nicolas, demander validation pour basculer sur fork `transcribe-rs` CPU-only. Ne PAS basculer unilatéralement.

---

## Task 5 : Installer et tester le .msi sur le PC Windows de Nicolas

**Files:** aucun (test manuel utilisateur)

- [ ] **Step 1 : Transférer le .msi à Nicolas**

Donner à Nicolas l'URL de téléchargement de l'artefact :
```bash
gh run view <run_id> --json url -q .url
```

Lui dire de : aller sur la page du run, scroller jusqu'à "Artifacts", télécharger `N-Gage-Windows.zip`, dézipper, double-cliquer sur le `.msi`.

- [ ] **Step 2 : Nicolas installe**

Attendu côté Nicolas :
- Double-clic sur le `.msi`
- L'installateur Tauri/WiX s'ouvre
- Suivant → Suivant → Installer → Terminé
- Une icône N-Gage apparaît dans le menu Démarrer

- [ ] **Step 3 : Nicolas lance l'app**

Attendu :
- Première ouverture : l'app demande l'autorisation micro Windows
- Onboarding : l'app propose de télécharger un modèle Whisper Small (~500 Mo)
- Une fois le modèle téléchargé, l'app est prête

- [ ] **Step 4 : Test de dictée réel**

Attendu :
- Nicolas presse `Ctrl+Shift+Space`
- Parle 5 secondes en français
- Relâche le raccourci
- Le texte transcrit apparaît dans le presse-papier ou est tapé dans le focus actif
- Latence : < 2 secondes pour 5 secondes d'audio (critère de succès du spec)

- [ ] **Step 5 : Feedback Nicolas**

Trois résultats possibles :
- ✅ Tout marche → Task 6
- ⚠️ Marche mais lent (> 3 sec latence) → Vulkan probablement pas actif au runtime, vérifier les logs de l'app Windows (debug mode `Ctrl+Shift+D`), créer une issue dans TODO.md
- ❌ Crash au lancement → Probablement DLL Vulkan runtime manquante. Action : ajouter `vulkan-1.dll` dans `src-tauri/tauri.conf.json` → `bundle.resources`, rebuild

---

## Task 6 : Documentation et merge

**Files:**
- Modify: `BUILD.md`
- Modify: `TODO.md`
- Modify: `MEMORY.md` (créer si absent)

- [ ] **Step 1 : Mettre à jour `BUILD.md`**

Lire `BUILD.md` actuel, ajouter une section Windows :

```markdown
## Build Windows (local)

Si tu veux compiler localement sur Windows au lieu d'utiliser GitHub Actions :

1. Installer Rust : https://rustup.rs/
2. Installer Bun : https://bun.sh/
3. Installer cmake : `choco install cmake`
4. Installer Vulkan SDK 1.3.296.0 : https://sdk.lunarg.com/sdk/download/1.3.296.0/windows/VulkanSDK-1.3.296.0-Installer.exe
5. Vérifier que `VULKAN_SDK` est bien dans l'environnement (l'installateur le fait automatiquement)
6. `bun install`
7. `bun run tauri build`

Le `.msi` sera dans `src-tauri/target/release/bundle/msi/`.

## Build Windows (CI)

Le workflow `.github/workflows/build.yml` produit automatiquement un `.msi` à chaque push sur `main` ou tag `v*`. Pour déclencher manuellement :

```bash
gh workflow run "Build & Release" --ref main
```

Récupérer l'artefact :
```bash
gh run download <run_id> --name N-Gage-Windows
```
```

- [ ] **Step 2 : Mettre à jour `TODO.md`**

Dans la section "À faire — Priorité haute", déplacer la ligne "Build Windows (.msi)" vers "Terminé (v1.0.0)" en cochant `[x]` et en ajoutant la version Vulkan SDK utilisée.

- [ ] **Step 3 : Créer ou mettre à jour `MEMORY.md` du projet**

Si `MEMORY.md` n'existe pas dans `projets/06-outils-rnd/ngage-dictee-vocale/`, le créer avec :

```markdown
# MEMORY — N-Gage Dictée Vocale

> État actuel synthétique du projet. Mis à jour à chaque session, pas empilé.

## Statut

- v1.0.0 livrée sur macOS (Apple Silicon + Intel) — février 2025
- Build Windows .msi fonctionnel — mai 2026 (via Vulkan SDK 1.3.296.0 en CI)
- Projet déplacé de `04-clients/handy-prevention/` vers `06-outils-rnd/ngage-dictee-vocale/` le 23/05/2026 (outil R&D interne, pas client)

## Stack

- Tauri v2 (Rust backend + React/TypeScript frontend)
- Whisper via `transcribe-rs 0.2.2` (features : whisper, parakeet, moonshine)
- Bun pour le frontend
- Vulkan (Windows/Linux) + Metal (macOS) pour l'accélération GPU

## Repo

- GitHub : `github.com/nikau79-ui/n-gage-dictee-vocale`
- Branche principale : `main`

## Builds CI

| Plateforme | Statut | Notes |
|---|---|---|
| macOS ARM64 | ✅ | `.dmg` aarch64 |
| macOS Intel | ✅ | `.dmg` x64 |
| Windows | ✅ | `.msi` x64 avec Vulkan SDK 1.3.296.0 |
| Linux | ❌ | Désactivé temporairement (manque `glslc`), à reprendre |

## Prochaines priorités

Voir `TODO.md`.

## Décisions structurantes

- 23/05/2026 : Vulkan en CI Windows via installateur LunarG silencieux (cf `docs/superpowers/specs/2026-05-23-build-windows-vulkan-design.md`)
- Reste en CPU-only fallback documenté si Vulkan casse à l'avenir
```

- [ ] **Step 4 : Commit doc**

Run :
```bash
git add BUILD.md TODO.md MEMORY.md
git commit -m "docs: document Windows build with Vulkan SDK 1.3.296.0

Updates BUILD.md with local + CI Windows build instructions,
marks Windows build as done in TODO.md, creates project MEMORY.md."
```

- [ ] **Step 5 : Push et merger la branche dans main**

Run :
```bash
git push
git checkout main
git merge fix/windows-vulkan-build --no-ff -m "Merge fix/windows-vulkan-build: Windows .msi with Vulkan SDK"
git push
```

Expected : `main` à jour, branche `fix/windows-vulkan-build` peut être supprimée plus tard.

- [ ] **Step 6 : Vérifier qu'un nouveau run sur main produit toujours le .msi**

Run :
```bash
gh workflow run "Build & Release" --ref main
sleep 10
gh run list --branch main --limit 1
```

Surveiller le run, confirmer le .msi en artefact.

---

## Task 7 : Mettre à jour la mémoire globale Claude Code

**Files:**
- Modify: `/Users/nikau/MonProjetIA/Claude code/JOURNAL.md` (entrée transverse)

- [ ] **Step 1 : Ajouter une entrée dans le JOURNAL.md racine**

Ajouter en tête du fichier `/Users/nikau/MonProjetIA/Claude code/JOURNAL.md` :

```markdown
## Session 2026-05-23 — Reprise N-Gage Dictée Vocale + build Windows (~Xh)

- Projet `handy-prevention` déplacé de `04-clients/` vers `06-outils-rnd/ngage-dictee-vocale/` (outil R&D interne)
- Fix build Windows GitHub Actions : Vulkan SDK 1.3.296.0 via installateur LunarG silencieux
- `.msi` Windows fonctionnel, installé et testé sur PC Windows de Nicolas
- Spec + plan dans `projets/06-outils-rnd/ngage-dictee-vocale/docs/superpowers/`
```

- [ ] **Step 2 : Commit (optionnel selon préférence Nicolas)**

Si Nicolas veut commit le JOURNAL.md racine du repo Claude code (s'il est versionné), faire un commit dédié. Sinon, juste l'écriture suffit.

---

## Self-Review

**Couverture du spec :**
- Objectif (.msi avec Vulkan) → Task 2 + Task 3 ✓
- Critère 1 (CI verte < 30 min) → Task 3 step 4 ✓
- Critère 2 (artefact .msi) → Task 3 step 5 ✓
- Critère 3 (installation + dictée temps réel) → Task 5 ✓
- Variables d'env via GITHUB_ENV/GITHUB_PATH → Task 2 step 1 ✓
- Retrait flags NO_VULKAN → Task 2 step 2 ✓
- Version Vulkan SDK 1.3.296.0 pinnée → Task 2 step 1 ✓
- Plan de fallback (matrice de symptômes) → Task 4 step 1 ✓
- Seuil 3 itérations avant bascule Approche C → Task 4 step 5 + 6 ✓
- Mise à jour BUILD.md / TODO.md / MEMORY.md → Task 6 ✓

**Placeholders :** aucun "TBD", aucun "implement later", aucun "similar to". Toutes les commandes shell et tous les blocs YAML sont complets.

**Cohérence des types/noms :** noms de steps, noms de fichiers, noms de variables d'env tous identiques entre Task 2, Task 4 et Task 6.

Plan complet et committé.
