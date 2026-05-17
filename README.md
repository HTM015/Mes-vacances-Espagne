# Horizon Chill 🌅

Application web **mobile-first** pour organiser un roadtrip en famille : route, logement, activités, budget, valise, documents et galerie souvenirs.

Optimisée pour **smartphone** (style One UI). Aucun serveur : les données restent dans le navigateur (`localStorage`).

## Démo en ligne (GitHub Pages)

Après publication, l’app est disponible à :

**https://VOTRE-USERNAME.github.io/horizon-chill/**

(Remplace `VOTRE-USERNAME` par ton identifiant GitHub.)

## Fonctionnalités

- Tableau de bord avec progression du voyage
- Bannière immersive + stats (budget, essence, distance, météo…)
- Navigation basse : Accueil · Villes · Route · Activités · Budget · Plus
- Timeline route + mini-carte
- Budget par catégories avec anneau de progression
- Checklists logement, documents, valise
- Galerie photos (stockage local)
- Mode sombre + ambiance selon l’heure
- Export / import JSON de sauvegarde

## Héberger sur GitHub Pages

### 1. Créer le dépôt

```bash
cd "chemin/vers/non-on-va-oublier-un-peu"
git init
git add .
git commit -m "Horizon Chill — app roadtrip mobile"
gh repo create horizon-chill --public --source=. --remote=origin --push
```

Sans `gh` : crée un dépôt vide **horizon-chill** sur [github.com/new](https://github.com/new), puis :

```bash
git remote add origin https://github.com/VOTRE-USERNAME/horizon-chill.git
git branch -M main
git push -u origin main
```

### 2. Activer GitHub Pages

1. Ouvre le dépôt sur GitHub → **Settings** → **Pages**
2. **Build and deployment** → Source : **Deploy from a branch**
3. Branch : **main** · Folder : **/ (root)**
4. Enregistre — la page est en ligne sous 1 à 2 minutes

### 3. Installer sur le téléphone (Samsung)

Ouvre l’URL Pages dans Chrome → menu **⋮** → **Ajouter à l’écran d’accueil**.

## Utilisation locale

Ouvre `index.html` dans le navigateur, ou :

```bash
npx --yes serve .
```

Puis va sur `http://localhost:3000`.

## Fichiers

| Fichier | Rôle |
|---------|------|
| `index.html` | Structure et écrans |
| `styles.css` | Design mobile premium |
| `app.js` | Logique et sauvegarde |
| `manifest.webmanifest` | Installation PWA |
| `icon.svg` | Icône application |

## Confidentialité

Les photos et notes ne quittent pas l’appareil (sauf si tu exportes le JSON). La météo utilise l’API publique [Open-Meteo](https://open-meteo.com/) (Valencia par défaut).

## Licence

MIT — libre d’utilisation et de modification.
