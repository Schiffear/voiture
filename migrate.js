const knex = require('knex')(require('./knexfile')['development']);

async function createTables() {
  try {
    // Table `authentification`
    const authExists = await knex.schema.hasTable('authentification');
    if (!authExists) {
      await knex.schema.createTable('authentification', (table) => {
        table.increments('id').primary();
        table.string('login').notNullable();
        table.string('password').notNullable();
        table.string('role').notNullable();
      });
      console.log('Table "authentification" créée avec succès.');
    } else {
      console.log('Table "authentification" existe déjà.');
    }

    // Table `voitures`
    const carsExists = await knex.schema.hasTable('voitures');
    if (!carsExists) {
      await knex.schema.createTable('voitures', (table) => {
        table.increments('id').primary();
        table.string('brand').notNullable();
        table.string('model').notNullable();
        table.integer('quantity').notNullable();
        table.integer('price').notNullable();
      });
      console.log('Table "voitures" créée avec succès.');
    } else {
      console.log('Table "voitures" existe déjà.');
    }

    // Table `historique`
    const historyExists = await knex.schema.hasTable('historique');
    if (!historyExists) {
      await knex.schema.createTable('historique', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('authentification').onDelete('CASCADE');
        table.string('model').notNullable();
        table.integer('quantity').notNullable();
        table.integer('total_price').notNullable();
      });
      console.log('Table "historique" créée avec succès.');
    } else {
      console.log('Table "historique" existe déjà.');
    }
  } catch (error) {
    console.error('Erreur lors de la création des tables :', error);
  } finally {
    await knex.destroy();
  }
}

createTables();
