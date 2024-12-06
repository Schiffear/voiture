const prompt = require("prompt-sync")({ sigint: true });
const dbUsers = require('./models/users');
const dbCars = require('./models/cars');
const dbHistorique = require('./models/history');
var limdu = require('limdu');
var colors = require('colors');

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

// Fonction pour vérifier si la carte est une Amex
function isAmex(cardNumber) {
  // Une carte Amex commence par 34 ou 37 et a 15 chiffres
  return /^3[47][0-9]{13}$/.test(cardNumber);
}

(async function () {
  console.log("🌟 Bienvenue dans notre chatbot pour voitures de luxe ! 🌟".green);
  console.log("Veuillez vous connecter pour utiliser nos services !".blue);

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
      const userInput = prompt("🔑 Voulez-vous vous connecter ou vous inscrire ? ").toLowerCase();
      const features = preprocessInput(userInput);
      const intent = classifier.classify(features);

      if (intent === "createAccount") {
        const login = prompt("🔒 Connexion en cours... -> Entrez votre Nom : ");
        const password = prompt("🔒 Connexion en cours... -> Entrez votre mot de passe : ");
        const role = "Client"
        await dbUsers.createUser(login, password, role);
        console.log(`📝 Compte "${login}" créé avec succès !`);

        isAuthenticated = true; // L'utilisateur est authentifié après la création
        userId = (await dbUsers.getUserByLogin(login)).id;
      } else if (intent === "connect") {
        const login = prompt("🔒 Connexion en cours... -> Entrez votre Nom : ");
        const password = prompt("🔒 Connexion en cours... -> Entrez votre mot de passe : ");
        const user = await dbUsers.getUserByLogin(login);

        if (user && user.password === password) {
          console.log(`Bienvenue, ${login}! Vous êtes connecté en tant que ${user.role}.`.green);
          isAuthenticated = true;
          userId = user.id; // Supposons que chaque utilisateur a un ID unique
        } else {
          console.log("❌ Identifiants incorrects. Veuillez réessayer.");
        }
      } else {
        console.log("❌ Vous n'êtes pas connecté, opération impossible.");
      }
    }
  }

  async function userLegit() {
    userName = (await dbUsers.getUserById(userId)).login
    try {
      const response = await fetch (`https://ws-public.interpol.int/notices/v1/red?name=${userName}`);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      const json = await response.json();
      if (json.total > 0) {
        console.log("Vous êtes recherché par Interpole 👮‍♂️, votre adresse ip a été transmise au service compétant, La police sera la d'ici 2 minutes ".underline.red.bold); 
        console.log("Bon voyage en prison mon reuf ;) ✈️✈️✈️".rainbow); 
        legit = false
      }

    } catch (error) {
      console.error(error.message);
    }
    
  }

  let legit = true

  // Authentification obligatoire
  await authenticateUser();
  //userId disponible
  await userLegit();

  // Une fois l'utilisateur authentifié, il peut interagir avec les services
  while (legit) {
    const userInput = prompt("Que souhaitez vous faire ? Acheter une voiture ? voir votre historique ? : " .blue).toLowerCase();
    const features = preprocessInput(userInput);
    const intent = classifier.classify(features);

    switch (intent) {
      case "buyCar":
        const brand = prompt("Achat : Quelle marque de voiture souhaitez-vous (ex: Ferrari, Lamborghini) ? ");
        const cars = await dbCars.getByBrand(brand);

        if (cars.length === 0) {
          console.log(`Aucune voiture trouvée pour la marque ${brand}.`);
          continue;
        }

        console.log("Voici les modèles disponibles :");
        cars.forEach(car => console.log(`- ${car.model} (${car.quantity} disponibles, ${car.price} EUR)`));

        const model = prompt("Quel modèle souhaitez-vous ? ");
        const selectedCar = await dbCars.getByModel(model);

        if (!selectedCar || selectedCar.quantity <= 0) {
          console.log(`Désolé, le modèle ${model} n'est pas disponible. 🙅`);
          continue;
        }

        const quantity = parseInt(prompt(`Combien de ${model} voulez-vous acheter ? `), 10);
        if (quantity > selectedCar.quantity) {
          console.log(`Nous n'avons pas assez de stock. Il reste ${selectedCar.quantity} véhicules disponibles.`);
          continue;
        }

        const totalPrice = quantity * selectedCar.price;
        console.log(`Le prix total est de ${totalPrice} EUR.`);
        // Demander les informations de la carte de crédit
        const cardNumber = prompt("Veuillez entrer votre numéro de carte de crédit : ");

        // Vérifier si c'est une carte Amex
        if (isAmex(cardNumber)) {
          await dbCars.updateStock(model, selectedCar.quantity - quantity);
          await dbHistorique.addPurchase(userId, model, quantity, totalPrice);
          console.log("✨ Achat confirmé ! Merci pour votre commande. ✨".yellow.bold);
        } else {
          console.log("🚫 Désolé, vous n'avez pas les capacités financières pour effectuer ce paiement, PAUVRE ! 🚫".underline.red.bold);
        }
        break;

      case "listCars":
        console.log("Voici toutes les marques de voitures disponibles :");
        const allCars = await dbCars.getAll();
        allCars.forEach(car => console.log(`- ${car.brand} ${car.model} (${car.price} EUR)`));
        break;

      case "showHistory":
        const userHistory = await dbHistorique.getUserHistory(userId);
        if (userHistory.length === 0) {
          console.log("Aucun historique d'achat trouvé 🤷. Il serait temps de faire un achat !");
        } else {
          console.log("📝 Votre historique d'achat :");
          userHistory.forEach(entry => console.log(`- ${entry.model} x${entry.quantity}, ${entry.total_price} EUR`));
        }
        break;

		case "addCar":
			// Vérifie si l'utilisateur est authentifié et est un administrateur
			if (isAuthenticated && (await dbUsers.getUserById(userId)).role === "admin") {
			  const brand = prompt("Entrez la marque de la voiture : ");
			  const model = prompt("Entrez le modèle de la voiture : ");
			  const quantity = parseInt(prompt("Entrez la quantité : "), 10);
			  const price = parseFloat(prompt("Entrez le prix de la voiture : "));
		  
			  // Ajout de la voiture dans la base de données
			  await dbCars.create(brand, model, quantity, price);
			  console.log(`La voiture ${brand} ${model} a été ajoutée avec succès.`);
			} else {
			  // Si l'utilisateur n'est pas un administrateur
			  console.log("🚫 Seuls les administrateurs peuvent ajouter des voitures. 🚫");
			}
			break;
		  
		  default:
			console.log("Je n'ai pas compris votre demande 🤔. Essayez de reformuler !");
			break;		  
    }
  }
})();
