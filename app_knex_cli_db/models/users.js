const knex = require('knex')(require('../knexfile')['development']);

// Création d'un nouvel utilisateur § login = nom de la personne
async function createUser(login, password, role) {
  return await knex('authentification').insert({ login, password, role });
}

// Retourne l'utilisateur en fonction du nom demandé
async function getUserByLogin(login) {
  return await knex('authentification').where({ login }).first();
}

// Retourne l'utilisateur en fonction de l'id
async function getUserById(id) {
  return await knex('authentification').where({ id }).first();
}

// Supprime tous les Users, sans aucune exception
async function deleteAllUsers() {
  return await knex('authentification').del();
}


module.exports = {
    createUser,
    getUserByLogin,
    getUserById,
    deleteAllUsers,

  };
  