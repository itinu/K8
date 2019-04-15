const Database  = require('better-sqlite3');

class HelperDB {
  static getConnection(hostname){
    if(!HelperDB.pool[hostname]){
      const db = new Database(`../sites/${hostname}/db/db.sqlite`);
//      db.pragma('journal_mode = WAL');

      HelperDB.pool[hostname] = {
        connection : db,
        access_at : Date.now()
      };
    }

    HelperDB.pool[hostname].access_at = Date.now();
    return HelperDB.pool[hostname].connection;
  }
}

HelperDB.pool = [];

module.exports = HelperDB;