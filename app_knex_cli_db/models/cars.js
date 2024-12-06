const knex = require('knex')(require('../knexfile')['development']);

// Create car
async function create(brand, model, quantity, price) {
  return await knex('voitures').insert({ brand, model, quantity, price });
}

// Retourne une voiture demandé via la marque
async function getByBrand(brand) {
  return await knex('voitures').where({ brand });
}

// Retourne une voiture demandé via son modèle
async function getByModel(model) {
  return await knex('voitures').where({ model }).first();
}

// Modifie la quantité du stock
async function updateStock(model, newQuantity) {
  return await knex('voitures').where({ model }).update({ quantity: newQuantity });
}

// Supprime toutes les Voitures, sans aucune exception (mais surtout les Telsa en vrai)
async function deleteAll() {
  return await knex('voitures').del();
}

// liste de toutes les voitures
async function getAll() {
  return await knex('voitures');
}

module.exports = {
  create,
  getByBrand,
  getByModel,
  updateStock,
  deleteAll,
  getAll
};

//ok.