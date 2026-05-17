# Publier The Sun Road sur GitHub (2 minutes)

## Méthode la plus simple

1. Ouvre le dossier du projet dans l’Explorateur Windows :
   `c:\Users\jadir\Documents\Codex\2026-05-17\non-on-va-oublier-un-peu`

2. **Clic droit** sur `deploy-github.ps1` → **Exécuter avec PowerShell**

3. Si Windows bloque : ouvre PowerShell et colle :

```powershell
cd "c:\Users\jadir\Documents\Codex\2026-05-17\non-on-va-oublier-un-peu"
Set-ExecutionPolicy -Scope Process Bypass
.\deploy-github.ps1
```

4. La première fois, `gh auth login` peut être demandé (connexion GitHub dans le navigateur).

5. À la fin, le script affiche ton URL, par exemple :
   **https://TON-USERNAME.github.io/the-sun-road/**

6. Sur le téléphone : ouvre cette URL → menu Chrome → **Ajouter à l’écran d’accueil**.

---

## Si tu as déjà un dépôt `horizon-chill`

Le script crée/pousse vers **`the-sun-road`** (nouveau nom).

Pour réutiliser l’ancien dépôt, change la ligne `$RepoName = "the-sun-road"` dans `deploy-github.ps1` par ton nom de dépôt, puis relance le script.

---

## Activer GitHub Pages (si le site ne s’affiche pas)

1. Va sur `https://github.com/TON-USERNAME/the-sun-road/settings/pages`
2. **Build and deployment** → Source : **GitHub Actions**
3. Attends 2 minutes, recharge l’URL

---

## Fichiers à envoyer sur GitHub

Tout le contenu du dossier (sauf rien d’obligatoire à exclure) :

- `index.html`, `styles.css`, `app.js`
- `icon.svg`, `manifest.webmanifest`
- `.nojekyll`, `.gitignore`
- `.github/workflows/pages.yml` (déploiement auto)
- `README.md`, `LICENSE`

**Version actuelle de la bannière :**

- Titre : **The Sun Road**
- Slogan : **Chaque trajet devient un souvenir**
- Plus de « Liege → Marseille » ni « Horizon Chill »
