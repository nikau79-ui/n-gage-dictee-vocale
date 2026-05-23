# Design — Build Windows .msi avec Vulkan via GitHub Actions

Date : 2026-05-23
Projet : N-Gage Dictée Vocale (fork Handy)
Auteur : Nicolas Graillot + Claude Code
Statut : validé, prêt pour plan d'implémentation

---

## 1. Contexte

Le fork N-Gage de Handy fonctionne sur macOS (Apple Silicon + Intel) depuis v1.0.0 (février 2025). Le job Windows du workflow GitHub Actions échoue depuis le début à cause de l'installation de Vulkan SDK, requis par `whisper-rs-sys` (transitive de `transcribe-rs 0.2.2`). 4 tentatives en février 2025 ont échoué :

1. `choco install vulkan-sdk` → package cassé (404)
2. Action `humbletim/setup-vulkan-sdk@v1.2.0` → utilise `actions/cache` v2 déprécié
3. Téléchargement direct LunarG sans flags silencieux → timeout 6h
4. `GGML_NO_VULKAN=1` → ne désactive pas réellement, build essaye quand même

Nicolas reprend le projet en mai 2026 pour pouvoir l'utiliser lui-même sur son PC Windows. Le projet a été déplacé de `04-clients/handy-prevention/` vers `06-outils-rnd/ngage-dictee-vocale/` (outil interne, pas client).

## 2. Objectif

Produire un installeur `N-Gage_x.x.x_x64-setup.msi` Windows fonctionnel avec accélération Vulkan, téléchargeable depuis GitHub Actions, installable comme un utilisateur lambda (double-clic, suivant, terminé).

## 3. Critères de succès

1. Le workflow `Build & Release` réussit son job `Windows` en moins de 30 min
2. Un artefact `.msi` est disponible (artifact ou release draft)
3. Une fois installé sur Windows, l'app démarre, demande l'autorisation micro, télécharge un modèle Whisper Small, et transcrit en français en temps quasi réel (< 2 sec pour 5 sec d'audio)

## 4. Hors scope

- Signature de code Windows (Authenticode)
- Page de téléchargement n-gage.fr/telechargement
- Dictionnaire SST pré-activé au premier lancement
- Onboarding simplifié
- Build Linux (.deb, .AppImage)
- Optimisation taille du .msi

Ces items restent dans `TODO.md` pour des sessions ultérieures.

## 5. Approche retenue

**Approche A — Vulkan SDK via installateur silencieux LunarG officiel.**

Télécharger l'installeur `.exe` officiel LunarG (~200 Mo) via `Invoke-WebRequest`, lancer en mode silencieux avec les flags `--accept-licenses --default-answer --confirm-command install`, exporter `VULKAN_SDK` et `Bin/` via `GITHUB_ENV` / `GITHUB_PATH` pour les rendre visibles aux steps suivants.

**Pourquoi pas les autres :**

- **B (Docker Windows)** : trop lent (pull image 4-6 Go), peu de docs, tauri-action se comporte mal dans Docker Windows
- **C (fork transcribe-rs CPU-only)** : contradictoire avec l'exigence "temps réel sur Windows". Réservé en fallback si A échoue après 3 itérations.

## 6. Architecture

### 6.1 Fichiers modifiés

| Fichier | Modification |
|---|---|
| `.github/workflows/build.yml` | Ajout step "Install Vulkan SDK (Windows)", retrait flags `GGML_NO_VULKAN` et `WHISPER_NO_VULKAN` du step "Build Tauri app" |
| `BUILD.md` | Documentation de la version Vulkan SDK pinnée et de la procédure manuelle équivalente |

### 6.2 Fichiers explicitement non touchés

- Code Rust métier (`src-tauri/src/managers/`, `audio_toolkit/`)
- Code React/TypeScript (`src/`)
- Workflow macOS (steps existants conservés tels quels)
- `src-tauri/Cargo.toml` — pas de modification de dépendances, `transcribe-rs 0.2.2` reste tel quel

### 6.3 Variables d'environnement Windows

| Variable | Valeur | Mécanisme |
|---|---|---|
| `VULKAN_SDK` | `C:\VulkanSDK\1.3.296.0` | écrit dans `$env:GITHUB_ENV` |
| `PATH` (ajout) | `C:\VulkanSDK\1.3.296.0\Bin` | écrit dans `$env:GITHUB_PATH` |
| `GGML_NO_VULKAN` | retiré | suppression de la ligne env du step Build |
| `WHISPER_NO_VULKAN` | retiré | suppression de la ligne env du step Build |

**Pourquoi `GITHUB_ENV`/`GITHUB_PATH` et pas `$env:` PowerShell** : `$env:VAR=value` n'affecte que la session PowerShell courante du step, pas les steps suivants. C'est probablement la cause d'au moins un des 4 échecs de février 2025.

### 6.4 Version Vulkan SDK pinnée

`1.3.296.0` — dernière version stable LunarG au moment du design. URL CDN :
```
https://sdk.lunarg.com/sdk/download/1.3.296.0/windows/VulkanSDK-1.3.296.0-Installer.exe
```

## 7. Séquence du workflow Windows

Remplace l'étape `Install Windows dependencies` actuelle :

```yaml
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
    Invoke-WebRequest -Uri $url -OutFile "$env:TEMP\vulkan-sdk.exe"
    Start-Process -FilePath "$env:TEMP\vulkan-sdk.exe" -ArgumentList "--accept-licenses","--default-answer","--confirm-command","install" -Wait
    echo "VULKAN_SDK=C:\VulkanSDK\$version" >> $env:GITHUB_ENV
    echo "C:\VulkanSDK\$version\Bin" >> $env:GITHUB_PATH
```

Et dans le step `Build Tauri app`, retirer ces deux lignes du bloc `env:` :
```yaml
GGML_NO_VULKAN: "1"
WHISPER_NO_VULKAN: "1"
```

## 8. Validation

1. **Build CI vert** : déclencher via `gh workflow run "Build & Release" --ref main`, vérifier job Windows < 30 min
2. **Artefact présent** : confirmer `.msi` dans artifacts ou release draft
3. **Test installation réel** : télécharger le `.msi` sur PC Windows, installer, lancer, tester une dictée en français

## 9. Fallback

| Symptôme | Cause probable | Action |
|---|---|---|
| Téléchargement Vulkan timeout | URL LunarG cassée ou CDN lent | Pinner version antérieure (1.3.275.0) ou utiliser miroir |
| Installateur tourne mais SDK pas détecté | Variables d'env mal exportées | Vérifier `GITHUB_ENV`/`GITHUB_PATH` |
| cmake ne trouve pas glslc | `Bin/` pas dans PATH | Ajouter aussi `%VULKAN_SDK%\Lib` au PATH |
| whisper-rs-sys compile mais linker échoue | Bibliothèques Vulkan introuvables | Exporter `VK_SDK_PATH` en plus de `VULKAN_SDK` |
| Build OK mais .msi crash au lancement | DLL Vulkan runtime pas embarquée | Inclure `vulkan-1.dll` dans `tauri.conf.json` → `bundle.resources` |

**Seuil de bascule** : si après 3 itérations de workflow (~75 min cumulés) Vulkan ne passe pas, basculement vers Approche C (fork `transcribe-rs` CPU-only). Décision prise avec Nicolas, pas unilatéralement.

## 10. Itérations attendues

1 à 3 runs de workflow (15-25 min chacun). Possibilité de relancer entre 2 runs en analysant les logs du run précédent via `gh run view <id> --log-failed`.

## 11. Sortie de session

- Workflow committé sur `main`, job Windows vert
- Au moins une release draft GitHub avec le `.msi` téléchargeable
- `BUILD.md` mis à jour avec la version Vulkan SDK
- `TODO.md` du projet : marquer "build Windows" comme fait, lister les prochaines priorités (dico pré-activé, onboarding, page téléchargement)
- `MEMORY.md` du projet : mis à jour avec le nouveau chemin et l'état du build Windows
- Si fallback Approche C activé : note explicite dans `TODO.md` et `MEMORY.md`
