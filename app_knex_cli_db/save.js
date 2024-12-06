const dbUsers = require('./models/users');
const dbCars = require('./models/cars');
const dbHistorique = require('./models/history');

async function main() {
  try {
    // Ajouter des utilisateurs
    await dbUsers.createUser('admin', 'admin', 'admin');
    await dbUsers.createUser('client', 'client', 'client');
    console.log('Utilisateurs ajoutés avec succès.');

    // Ajouter des voitures avec différentes marques et modèles
    const cars = [
      { brand: 'Toyota', model: 'Corolla', quantity: 5, price: 20000 },
      { brand: 'Toyota', model: 'Camry', quantity: 3, price: 25000 },
      { brand: 'Toyota', model: 'Prius', quantity: 2, price: 28000 },
      
      { brand: 'Honda', model: 'Civic', quantity: 3, price: 22000 },
      { brand: 'Honda', model: 'Accord', quantity: 4, price: 26000 },
      { brand: 'Honda', model: 'CR-V', quantity: 6, price: 28000 },
      
      { brand: 'Tesla', model: 'Model 3', quantity: 2, price: 35000 },
      { brand: 'Tesla', model: 'Model S', quantity: 1, price: 70000 },
      { brand: 'Tesla', model: 'Model X', quantity: 3, price: 80000 },
      
      { brand: 'BMW', model: 'Series 3', quantity: 4, price: 45000 },
      { brand: 'BMW', model: 'Series 5', quantity: 2, price: 60000 },
      { brand: 'BMW', model: 'X5', quantity: 5, price: 70000 },
      
      { brand: 'Mercedes', model: 'A-Class', quantity: 3, price: 35000 },
      { brand: 'Mercedes', model: 'C-Class', quantity: 2, price: 40000 },
      { brand: 'Mercedes', model: 'E-Class', quantity: 4, price: 55000 },
      
      { brand: 'Audi', model: 'A3', quantity: 3, price: 32000 },
      { brand: 'Audi', model: 'A4', quantity: 2, price: 40000 },
      { brand: 'Audi', model: 'Q7', quantity: 4, price: 75000 },
      
      { brand: 'Ford', model: 'Focus', quantity: 5, price: 18000 },
      { brand: 'Ford', model: 'Mustang', quantity: 2, price: 45000 },
      { brand: 'Ford', model: 'Explorer', quantity: 3, price: 60000 },
      
      { brand: 'Chevrolet', model: 'Cruze', quantity: 4, price: 20000 },
      { brand: 'Chevrolet', model: 'Malibu', quantity: 3, price: 25000 },
      { brand: 'Chevrolet', model: 'Tahoe', quantity: 5, price: 65000 },
      
      { brand: 'Nissan', model: 'Altima', quantity: 4, price: 22000 },
      { brand: 'Nissan', model: 'Maxima', quantity: 3, price: 30000 },
      { brand: 'Nissan', model: 'Murano', quantity: 2, price: 38000 },
      
      { brand: 'Lexus', model: 'IS', quantity: 3, price: 40000 },
      { brand: 'Lexus', model: 'RX', quantity: 2, price: 55000 },
      { brand: 'Lexus', model: 'NX', quantity: 4, price: 45000 },
      
      { brand: 'Porsche', model: '911', quantity: 2, price: 90000 },
      { brand: 'Porsche', model: 'Cayenne', quantity: 1, price: 80000 },
      { brand: 'Porsche', model: 'Macan', quantity: 3, price: 75000 },
    ];

    for (const car of cars) {
      await dbCars.create(car.brand, car.model, car.quantity, car.price);
    }
    console.log('Voitures ajoutées avec succès.');


    // Suppression de toutes les voitures (commenté pour l'instant)
    // await dbCars.deleteAll(); // Décommentez cette ligne pour supprimer toutes les voitures

  } catch (error) {
    console.error('Erreur dans le script principal :', error);
  }
}

main();