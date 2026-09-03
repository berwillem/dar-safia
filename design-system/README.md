# Design system Dar Safia — phase 1

`tokens.json` est la source de vérité du design system. Il alimentera le thème
Tailwind en phase 2 : aucune couleur, taille ou durée ne doit être écrite en dur
dans un composant.

## Ce qui est extrait tel quel (ne pas modifier)

Ces valeurs viennent du `:root` de `style.css` et de `getCategoryTheme()`. Elles
constituent l'identité visuelle de la maison :

- **Couleurs** — noir, bordeaux, or, ivoire. L'or est l'unique accent.
- **Univers olfactifs** — les six atmosphères (rubis, frais, émeraude, noir,
  ambre, floral).
- **Familles de polices** — Cinzel Decorative, Cinzel, Cormorant Garamond,
  Montserrat.
- **Courbes d'animation**, ombres, rayons, largeur de conteneur.

## Ce qui est proposé (à relire avant application)

L'audit a mis au jour deux dettes qu'il faut solder **avant** le portage, sinon
la nouvelle stack en hérite :

### 1. Aucune échelle typographique

Le CSS actuel emploie une quarantaine de tailles choisies au cas par cas :
`.62 .65 .68 .7 .72 .75 .78 .8 .82 .85 .92 .95 1 1.05 1.1 1.15 1.25 1.3 1.4 1.5…`

Beaucoup ne diffèrent que de 0,02rem, soit moins d'un tiers de pixel — une
distinction invisible qui coûte de la cohérence. Correspondance proposée :

| Tailles actuelles | Pas proposé | Valeur |
|---|---|---|
| `.62` `.65` | `3xs` | 0.625rem |
| `.68` `.7` | `2xs` | 0.6875rem |
| `.72` `.75` | `xs` | 0.75rem |
| `.78` `.8` `.82` | `sm` | 0.8125rem |
| `.85` `.92` `.95` | `base` | 0.9375rem |
| `1` `1.05` | `md` | 1rem |
| `1.1` `1.15` | `lg` | 1.125rem |
| `1.25` `1.3` | `xl` | 1.3125rem |
| `1.4` `1.5` | `2xl` | 1.5rem |

Le bas de l'échelle est volontairement dense : l'interface repose beaucoup sur
des micro-libellés en capitales.

### 2. Dix-sept points de rupture

`240, 440, 500, 520, 580, 680, 720, 760, 768, 780, 800, 820, 860, 900, 960,
1024, 1250 px` — ajoutés au fil des correctifs, pas conçus. Certains sont à
8 px l'un de l'autre (`760` / `768` / `780`), ce qui produit trois
recalculs de mise en page pour aucune différence perceptible.

Proposition : `sm 580` · `md 768` · `lg 1024` · `xl 1320`.

## Pourquoi ces changements ne sont pas encore appliqués

Réécrire les ~40 tailles et 17 requêtes média du `style.css` existant
modifierait l'aspect de la quasi-totalité des pages. C'est un travail qui se
relit à l'œil, écran par écran, pas un simple remplacement mécanique — et la
consigne du projet est de ne pas altérer l'identité visuelle sans validation.

Deux options pour la suite :

1. **Appliquer maintenant à `style.css`** — le site actuel devient cohérent,
   au prix d'une relecture visuelle complète.
2. **Appliquer au portage (phase 2)** — `style.css` reste tel quel, l'échelle
   ne s'applique qu'aux composants réécrits. Moins risqué, mais les deux
   systèmes coexistent le temps de la migration.

La seconde est recommandée : elle évite de retoucher un site en production pour
un bénéfice invisible au client, et fait porter l'effort là où le code est de
toute façon réécrit.
