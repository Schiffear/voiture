const db = require('./boissonModel'); // Modèle à utiliser pour les opérations CRUD

async function main() {
  try {
    // Ajouter des utilisateurs
    await db.createUser('admin', 'admin123', 'admin');
    await db.createUser('user1', 'password1', 'user');
    console.log('Utilisateurs ajoutés avec succès.');

    // Ajouter des voitures
    const cars = [
      { brand: 'Toyota', model: 'Corolla', quantity: 5, price: 20000 },
      { brand: 'Honda', model: 'Civic', quantity: 3, price: 22000 },
      { brand: 'Tesla', model: 'Model 3', quantity: 2, price: 35000 },
    ];

    for (const car of cars) {
      await db.createCar(car.brand, car.model, car.quantity, car.price);
    }
    console.log('Voitures ajoutées avec succès.');

    // Effectuer un achat et l'ajouter à l'historique
    const user = await db.getUserByLogin('user1');
    const car = await db.getCarByModel('Corolla');
    if (user && car) {
      const quantity = 2;
      const totalPrice = car.price * quantity;
      await db.addPurchase(user.id, car.model, quantity, totalPrice);

      console.log('Achat ajouté à l\'historique :', {
        user: user.login,
        car: car.model,
        quantity,
        totalPrice,
      });
    }

    // Lire les données (historique d'achats)
    const userHistory = await db.getUserHistory(user.id);
    console.log('Historique des achats pour l\'utilisateur :', userHistory);

    // Suppression de toutes les voitures (commenté pour l'instant)
    // await db.deleteAllCars(); // Décommentez cette ligne pour supprimer toutes les voitures

  } catch (error) {
    console.error('Erreur dans le script principal :', error);
  }
}

main();
