const fs = require('fs');

const mapping = {
  "Prada Paradoxe": "/perfumes/dar-safia-femme.img/Prada paradox.jpg",
  "Prada Paradoxe Intense": "/perfumes/dar-safia-femme.img/prada paradoxe intense.jpg",
  "Valentino Donna Born In Roma": "/perfumes/dar-safia-femme.img/Valentino donna born in Roma.jpg",
  "Valentino Donna Born In Roma Intense": "/perfumes/dar-safia-femme.img/Valentino donna born in Roma intense.jpg",
  "Rabanne Fame In Love": "/perfumes/dar-safia-femme.img/Rabanne fame in love.jpg",
  "Lancôme Idôle Peach & Rose": "/perfumes/dar-safia-femme.img/Lancôme.Idôle L'Eau de Parfum Fruitée.jpg",
  "Viktor & Rolf Flowerbomb (La Bomba)": "/perfumes/dar-safia-femme.img/La Bomba.jpg",
  "Rochas Audace": "/perfumes/dar-safia-femme.img/(Rochas Audace.jpg",
  "Dolce & Gabbana Devotion (Femme)": "/perfumes/dar-safia-femme.img/Dolce & Gabbana Devotion Eau de Parfum.jpg",
  "Chloé Le Parfum": "/perfumes/dar-safia-femme.img/chloé le parfum.jpg",
  "My Burberry Blush": "/perfumes/dar-safia-femme.img/My Burberry Blush.jpg",
  "My Burberry (Eau de Parfum)": "/perfumes/dar-safia-femme.img/My Burberry Blush.jpg",
  "Givenchy Irrésistible": "/perfumes/dar-safia-femme.img/Irresistible Givenchy Eau de Parfum.jpg",
  "Jean Paul Gaultier Divine Couture": "/perfumes/dar-safia-femme.img/Jean Paul Gaultier Divine Couture.jpg",
  "Mademoiselle Rochas": "/perfumes/dar-safia-femme.img/madoemoiselle rochas rochas paris.jpg",
  "Versace Dylan Blue Pour Femme": "/perfumes/dar-safia-femme.img/versace femme dylan blue eau de parfum.jpg",
  "Emporio Armani Stronger With You (You Powerfully)": "/perfumes/dar-safia-femme.img/Emporio Armani because it's you.jpg",
  "Givenchy Gentleman Society Ambrée": "/perfumes/dar-safia-homme.img/givenchy gentleman eau de parfum.jpg",
  "Jean Paul Gaultier Scandal Pour Homme Elixir": "/perfumes/dar-safia-femme.img/Jean Paul Gaultier scandale élixir.jpg",
  "Montblanc Explorer Platinum / Extrême": "/perfumes/dar-safia-homme.img/montblanc légende elixir.jpg",
  "Giorgio Armani Acqua Di Giò Eau de Parfum": "/perfumes/dar-safia-homme.img/Giorgio Armani acqua di giò eau de parfum.jpg",
  "Givenchy Gentleman Eau de Parfum": "/perfumes/dar-safia-homme.img/givenchy gentleman eau de parfum.jpg",
  "Jean Paul Gaultier Le Beau Narcisse / Le Parfum": "/perfumes/dar-safia-homme.img/jean paul gultier le beau paradise garden.jpg",
  "Paco Rabanne Invictus Victory Elixir": "/perfumes/dar-safia-homme.img/invictus victury poco rabanne.jpg",
  "Yves Saint Laurent MYSLF Le Parfum": "/perfumes/dar-safia-homme.img/Yves saint Laurent MYSELF eau de parfum.jpg",
  "Yves Saint Laurent MYSLF Eau de Parfum": "/perfumes/dar-safia-homme.img/Yves saint Laurent MYSELF eau de parfum.jpg",
  "Montblanc Legend Elixir / Red": "/perfumes/dar-safia-homme.img/montblanc légende elixir.jpg",
  "Lacoste L.12.12 Original Aqua": "/perfumes/dar-safia-homme.img/Lacoste original acqua.jpg",
  "Kenzo Homme Indigo / Santal Marin": "/perfumes/dar-safia-homme.img/Kenzo homme indigoENP.jpg",
  "Dior Sauvage Le Parfum": "/perfumes/dar-safia-homme.img/dior sauvage elixir.jpg",
  "Dior Sauvage Elixir 100ml": "/perfumes/dar-safia-homme.img/dior sauvage elixir.jpg",
  "Dolce & Gabbana K (King) 200ml Eau de Parfum": "/perfumes/dar-safia-homme.img/Dolce Gabbana king 200ml eau de parfum.jpg",
  "Lacoste Booster": "/perfumes/dar-safia-homme.img/lacoste booster eau de toillete.jpg",
  "Dolce & Gabbana The One Eau de Parfum Intense": "/perfumes/dar-safia-homme.img/dolce gabbana the one eu de parfum intense.jpg",
  "Jean Paul Gaultier Scandal Absolu": "/perfumes/dar-safia-femme.img/Jean Paul Gaultier scandale absolu femme.jpg",
  "Jean Paul Gaultier Scandal Intense 150ml": "/perfumes/dar-safia-femme.img/Jean Paul Gaultier scandale intense.jpg",
  "Azzaro Wanted by Night": "/perfumes/dar-safia-homme.img/azzoro wanted by night.jpg"
};

const catalogPath = 'c:/Users/dell/dar-safia/catalog-data.js';
let catalogData = fs.readFileSync(catalogPath, 'utf8');

const newCatalogData = catalogData.replace(/name:\s*'([^']+)'[\s\S]*?img:\s*'([^']+)'/g, (match, name, oldImg) => {
    if (mapping[name]) {
        console.log(`Replacing img for ${name} -> ${mapping[name]}`);
        return match.replace(oldImg, mapping[name]);
    }
    console.log(`No mapping for ${name}`);
    return match;
});

fs.writeFileSync(catalogPath, newCatalogData);
console.log('Done modifying catalog-data.js!');
