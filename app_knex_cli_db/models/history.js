const knex = require('knex')(require('../knexfile')['development']);

// Ajoute un achat d'utilisateur
async function addPurchase(userId, model, quantity, totalPrice) {
  return await knex('historique').insert({ user_id: userId, model, quantity, total_price: totalPrice });
}

// Retourne tous les achats d'un utilisateur a partir de son id
async function getUserHistory(userId) {
  return await knex('historique').where({ user_id: userId });
}

// Supprime toutes les Commandes, sans aucune exception (mais surtout celle avec des Telsa en vrai)
async function deleteAllPurchases() {
  return await knex('historique').del();
}

module.exports = {
  addPurchase,
  getUserHistory,
  deleteAllPurchases,
};
