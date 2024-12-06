const prompt = require("prompt-sync")({ sigint: true });
const db = require('./boissonModel');
var limdu = require('limdu');

// Configuration du classificateur
const classifier = new limdu.classifiers.Bayesian();

function preprocessInput(input) {
  const words = input.split(" "); // Divise la phrase en mots
  const features = {};
  for (const word of words) {
    features[word] = 1; // Associe chaque mot à une valeur de 1
  }
  return features;
}

(async function () {
  console.log("Bienvenue dans notre chatbot pour voitures de luxe, veuillez vous connecter pour utiliser nos services !");
  
  let isAuthenticated = false;
  let userId = null;

  // Entraînement du chatbot avec des phrases spécifiques
  classifier.trainBatch([
    { input: preprocessInput("je veux acheter une voiture"), output: "buyCar" },
    { input: preprocessInput("acheter une voiture"), output: "buyCar" },
    { input: preprocessInput("acheter"), output: "buyCar" },
    { input: preprocessInput("je veux acheter une automobile"), output: "buyCar" },
    { input: preprocessInput("j'aimerais acheter une voiture"), output: "buyCar" },

    { input: preprocessInput("liste les voitures"), output: "listCars" },
    { input: preprocessInput("montre-moi les voitures disponibles"), output: "listCars" },
    { input: preprocessInput("quelles voitures sont disponibles ?"), output: "listCars" },
    { input: preprocessInput("je veux voir les voitures"), output: "listCars" },
    { input: preprocessInput("affiche les voitures disponibles"), output: "listCars" },

    { input: preprocessInput("voir mon historique"), output: "showHistory" },
    { input: preprocessInput("afficher mon historique"), output: "showHistory" },
    { input: preprocessInput("montre-moi mon historique d'achats"), output: "showHistory" },
    { input: preprocessInput("quels achats ai-je faits ?"), output: "showHistory" },
    { input: preprocessInput("j'aimerais voir mon historique d'achats"), output: "showHistory" },

    { input: preprocessInput("se connecter"), output: "connect" },
    { input: preprocessInput("je veux me connecter"), output: "connect" },
    { input: preprocessInput("connexion"), output: "connect" },
    { input: preprocessInput("je souhaite me connecter"), output: "connect" },
    { input: preprocessInput("connecter"), output: "connect" },

    { input: preprocessInput("créer un compte"), output: "createAccount" },
    { input: preprocessInput("je veux créer un compte"), output: "createAccount" },
    { input: preprocessInput("inscription"), output: "createAccount" },
    { input: preprocessInput("je souhaite m'inscrire"), output: "createAccount" },
    { input: preprocessInput("comment m'inscrire ?"), output: "createAccount" },

    { input: preprocessInput("addcar"), output: "addCar" },
    { input: preprocessInput("ajouter une voiture"), output: "addCar" },
    { input: preprocessInput("ajouter une nouvelle voiture"), output: "addCar" },
    { input: preprocessInput("ajouter"), output: "addCar" },
    { input: preprocessInput("ajouter un modèle de voiture"), output: "addCar" },
  ]);
  
  // Fonction pour authentifier ou créer un compte
  async function authenticateUser() {
    while (!isAuthenticated) {
      const userInput = prompt("Votre réponse: ").toLowerCase();
      const features = preprocessInput(userInput);
      const intent = classifier.classify(features);

      if (intent === "createAccount") {
        const login = prompt("Creation de compte : Entrez votre nom et prénom : ");
        const password = prompt("Entrez votre mot de passe : ");
        const role = prompt("Êtes-vous un admin (oui/non) ? ") === "oui" ? "admin" : "client";

        await db.createUser(login, password, role);
        console.log("Compte créé avec succès !");
        isAuthenticated = true; // L'utilisateur est authentifié après la création
        userId = (await db.getUserByLogin(login)).id;
      } else if (intent === "connect") {
        const login = prompt("Connexion : Entrez votre nom et prénom : ");
        const password = prompt("Entrez votre mot de passe : ");
        const user = await db.getUserByLogin(login);

        if (user && user.password === password) {
          console.log(`Bienvenue, ${login}! Vous êtes connecté en tant que ${user.role}.`);
          isAuthenticated = true;
          userId = user.id; // Supposons que chaque utilisateur a un ID unique
        } else {
          console.log("Identifiants incorrects.");
        }
      } else {
        console.log("Vous n'êtes pas connecté, opération impossible.");
      }
    }
  }

  // Authentification obligatoire
  await authenticateUser();

  // Une fois l'utilisateur authentifié, il peut interagir avec les services
  while (true) {
    const userInput = prompt("Votre réponse: ").toLowerCase();
    const features = preprocessInput(userInput);
    const intent = classifier.classify(features);

    switch (intent) {
      case "buyCar":
        const brand = prompt("Achat : Quelle marque de voiture souhaitez-vous ? ");
        const cars = await db.getCarsByBrand(brand);

        if (cars.length === 0) {
          console.log(`Aucune voiture trouvée pour la marque ${brand}.`);
          continue;
        }

        console.log("Voici les modèles disponibles :");
        cars.forEach(car => console.log(`- ${car.model} (${car.quantity} disponibles, ${car.price} EUR)`));

        const model = prompt("Quel modèle souhaitez-vous ? ");
        const selectedCar = await db.getCarByModel(model);

        if (!selectedCar || selectedCar.quantity <= 0) {
          console.log(`Désolé, le modèle ${model} n'est pas disponible.`);
          continue;
        }

        const quantity = parseInt(prompt(`Combien de ${model} voulez-vous acheter ? `), 10);
        if (quantity > selectedCar.quantity) {
          console.log(`Nous n'avons pas assez de stock. Il reste ${selectedCar.quantity} véhicules disponibles.`);
          continue;
        }

        const totalPrice = quantity * selectedCar.price;
        console.log(`Le prix total est de ${totalPrice} EUR.`);

        await db.updateCarStock(model, selectedCar.quantity - quantity);
        await db.addPurchase(userId, model, quantity, totalPrice);

        console.log("Achat confirmé ! Merci pour votre commande.");
        break;

      case "listCars":
        console.log("Liste : Voici toutes les voitures disponibles :");
        const allCars = await db.getAllCars(); // Remplaçant getCarsByBrand('%') par getAllCars()
        allCars.forEach(car => console.log(`- ${car.brand} ${car.model} (${car.price} EUR)`));
        break;

      case "showHistory":
        const userHistory = await db.getUserHistory(userId);
        if (userHistory.length === 0) {
          console.log("Aucun historique d'achat trouvé.");
        } else {
          console.log("Votre historique d'achat :");
          userHistory.forEach(entry => console.log(`- ${entry.model} x${entry.quantity}, ${entry.total_price} EUR`));
        }
        break;

      
        case "addCar":
          // Vérifie si l'utilisateur est authentifié et est un administrateur
          if (isAuthenticated) {
            const user = await db.getUserById(userId); // On utilise getUserById ici pour récupérer l'utilisateur complet
            if (user.role === "admin") {
              const brand = prompt("Entrez la marque de la voiture : ");
              const model = prompt("Entrez le modèle de la voiture : ");
              const quantity = parseInt(prompt("Entrez la quantité : "), 10);
              const price = parseFloat(prompt("Entrez le prix de la voiture : "));
              
              // Vérifie que les quantités et prix sont des nombres valides
              if (isNaN(quantity) || isNaN(price)) {
                console.log("Quantité ou prix invalide. Veuillez entrer des nombres valides.");
                break;
              }
        
              // Ajout de la voiture dans la base de données
              await db.createCar(brand, model, quantity, price);
              console.log(`La voiture ${brand} ${model} a été ajoutée avec succès.`);
            } else {
              console.log("Seuls les administrateurs peuvent ajouter des voitures.");
            }
          } else {
            console.log("Vous devez être connecté pour ajouter une voiture.");
          }
          break;
    }
  }
})();
