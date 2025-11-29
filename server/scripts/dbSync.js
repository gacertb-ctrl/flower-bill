// server/scripts/dbSync.js
const dbPrimary = require('../db/primaryConnection');
const dbSecondary = require('../db/secondaryConnection');

const syncDatabases = async () => {
  const tables = ['credit', 'customer_supplier', 'debit', 'product', 'purchase', 'sales'];
  
  for (const table of tables) {
    try {
      // Get last update time from secondary
      const [lastUpdate] = await dbSecondary.query(
        `SELECT ${table}_last_update_time FROM kanthimathi_${table} 
         ORDER BY ${table}_last_update_time DESC LIMIT 1`
      );
      
      const lastUpdateTime = lastUpdate[0]?.[`${table}_last_update_time`] || '1970-01-01';
      
      // Get new records from primary
      const [newRecords] = await dbPrimary.query(
        `SELECT * FROM ${table} 
         WHERE ${table}_last_update_time > ?`,
        [lastUpdateTime]
      );
      
      // Insert into secondary
      for (const record of newRecords) {
        const fields = Object.keys(record)
          .filter(key => key !== `${table}_last_update_time`)
          .join(',');
          
        const values = Object.values(record)
          .filter((_, i) => Object.keys(record)[i] !== `${table}_last_update_time`)
          .map(val => `'${val}'`)
          .join(',');
          
        await dbSecondary.query(
          `INSERT INTO kanthimathi_${table} (${fields}) VALUES (${values})`
        );
      }
      
      console.log(`Synced ${newRecords.length} records for ${table}`);
      
    } catch (err) {
      console.error(`Error syncing ${table}:`, err.message);
    }
  }
};

// Schedule sync every 5 minutes
if (require.main === module) {
  const cron = require('node-cron');
  cron.schedule('*/5 * * * *', syncDatabases);
}

module.exports = syncDatabases;