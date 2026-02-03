# N-Gage - Dictée vocale pour professionnels SST

**Application de dictée vocale 100% offline, spécialisée pour les professionnels de la Santé et Sécurité au Travail.**

Fork de [Handy](https://github.com/cjpais/Handy) par **N-Gage** (Nicolas Graillot, Toulouse).

---

## Pourquoi N-Gage ?

- **100% local** : Aucune donnée ne quitte votre ordinateur - idéal pour les données sensibles en entreprise
- **Vocabulaire métier** : Import de dictionnaires personnalisés (SST, médical, juridique...)
- **Multi-plateforme** : macOS, Windows, Linux
- **Open source** : Code auditable, modifiable, redistribuable (licence MIT)

## Cas d'usage

- **Préventeurs / IPRP** : Dictée de rapports de visite, DUERP, fiches de poste
- **Médecins du travail** : Comptes-rendus de consultation
- **Ergonomes** : Notes d'observation terrain
- **SPSTI** : Solution déployable en masse sans dépendance cloud

---

## Modifications par rapport à Handy

### Branding
| Élément | Handy | N-Gage |
|---------|-------|--------|
| Nom | Handy | N-Gage |
| Couleur principale | Violet | Bleu Ardoise (#264B63) |
| Couleur accent | - | Orange (#F28705) |
| Logo | Handy | N-Gage (SVG personnalisé) |

### Fonctionnalités ajoutées

#### Système de dictionnaires
- Import de fichiers vocabulaire (.txt, .json)
- Gestion par packs avec toggle on/off
- Pas de limite de mots
- Dictionnaire SST pré-configuré inclus

#### Dictionnaire SST inclus (66 termes)
- **Institutions** : CARSAT, CRAMIF, INRS, ANACT, DREETS, DDETS...
- **Documents** : DUERP, PAPRIPACT, PPSPS, FDS, VLEP...
- **Risques** : RPS, TMS, CMR, ATEX, AT, MP...
- **Instances** : CSE, CSSCT, CHSCT, IRP...
- **Métiers** : IPRP, HSE, QSE, préventeur, ergonome...
- **Pathologies** : lombalgie, tendinite, épicondylite, burnout...

---

## Installation

### Depuis l'installateur (recommandé)

| Plateforme | Fichier | Notes |
|------------|---------|-------|
| macOS (Apple Silicon) | `N-Gage_x.x.x_aarch64.dmg` | M1/M2/M3 |
| macOS (Intel) | `N-Gage_x.x.x_x64.dmg` | Intel Mac |
| Windows | `N-Gage_x.x.x_x64.msi` | 64 bits |
| Linux | `N-Gage_x.x.x_amd64.deb` | Debian/Ubuntu |

### Depuis les sources

Voir [BUILD.md](BUILD.md) pour les instructions de compilation.

---

## Utilisation

### Premier lancement
1. Télécharger un modèle (Whisper Small recommandé pour commencer)
2. Accorder les permissions (micro + accessibilité)
3. Configurer le raccourci (défaut: `Cmd+Shift+Space` sur Mac)

### Importer un vocabulaire métier
1. **Paramètres → Avancé → Vocabulaire personnalisé**
2. Cliquer sur **"Importer un dictionnaire"**
3. Sélectionner un fichier `.txt` ou `.json`
4. Activer/désactiver avec le toggle

### Format des fichiers vocabulaire

**Fichier .txt** (un mot par ligne) :
```
# Les commentaires sont ignorés
CARSAT
DUERP
TMS
préventeur
```

**Fichier .json** :
```json
{
  "name": "Mon vocabulaire SST",
  "words": ["CARSAT", "DUERP", "TMS", "préventeur"]
}
```

---

## Structure du projet

```
handy-prevention/
├── src/                    # Frontend React/TypeScript
├── src-tauri/              # Backend Rust/Tauri
├── ressources/             # Dictionnaires de vocabulaire
│   ├── dictionnaire-sst.json
│   ├── mots-sst.txt
│   └── vocabulaire-sar-cospas.txt
├── public/
│   └── dictionnaires/      # Dictionnaires embarqués
├── BUILD.md                # Instructions de compilation
├── TODO.md                 # Évolutions prévues
└── README.md               # Ce fichier
```

---

## Développement

```bash
# Prérequis
# - Rust (rustup.rs)
# - Bun (bun.sh)
# - Xcode CLI (macOS) ou Visual Studio Build Tools (Windows)

# Installer les dépendances
bun install

# Lancer en mode développement
bun run tauri dev

# Compiler pour production
bun run tauri build
```

---

## Licence

**MIT License** - Voir [LICENSE](LICENSE)

Vous pouvez librement utiliser, modifier et redistribuer cette application.

---

## Crédits

- **Application originale** : [Handy](https://github.com/cjpais/Handy) par CJ Pais
- **Moteur de transcription** : [Whisper.cpp](https://github.com/ggerganov/whisper.cpp)
- **Framework** : [Tauri](https://tauri.app/)
- **Adaptation SST** : N-Gage (Nicolas Graillot)

---

## Contact

**N-Gage** - Nicolas Graillot
Toulouse, France
[n-gage.fr](https://n-gage.fr)
