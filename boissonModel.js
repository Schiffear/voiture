const knex = require('knex')(require('./knexfile')['development']);

// Table `authentification`
async function createUser(login, password, role) {
  return await knex('authentification').insert({ login, password, role });
}

async function getUserByLogin(login) {
  return await knex('authentification').where({ login }).first();
}

async function deleteAllUsers() {
  return await knex('authentification').del();
}

// Table `voitures`
async function createCar(brand, model, quantity, price) {
  return await knex('voitures').insert({ brand, model, quantity, price });
}

async function getCarsByBrand(brand) {
  return await knex('voitures').where({ brand });
}

async function getCarByModel(model) {
  return await knex('voitures').where({ model }).first();
}

async function updateCarStock(model, newQuantity) {
  return await knex('voitures').where({ model }).update({ quantity: newQuantity });
}

async function deleteAllCars() {
  return await knex('voitures').del();
}

// Table `historique`
async function addPurchase(userId, model, quantity, totalPrice) {
  return await knex('historique').insert({ user_id: userId, model, quantity, total_price: totalPrice });
}

async function getUserHistory(userId) {
  return await knex('historique').where({ user_id: userId });
}

async function deleteAllPurchases() {
  return await knex('historique').del();
}

// Table `voitures`
async function getAllCars() {
  return await knex('voitures');
}

// Table `voitures`
async function addCar(brand, model, quantity, price) {
  return await knex('voitures').insert({ brand, model, quantity, price });
}

module.exports = {
  createUser,
  getUserByLogin,
  createCar,
  getCarsByBrand,
  getCarByModel,
  updateCarStock,
  addPurchase,
  getUserHistory,
  deleteAllUsers,
  deleteAllCars,
  deleteAllPurchases,
  getAllCars,
  addCar
};
