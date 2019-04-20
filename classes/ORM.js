const Database  = require('better-sqlite3');

const K8 = require('../K8');
const Model = K8.require('Model');

class ORM extends Model{
  constructor(){
    super();
    this.id = null;
    this.created_at = null;
    this.updated_at = null;
  }

  /**
   *
   * @returns {Model}
   */
  getBelongs(model){
    if(!this.constructor.belongsTo.includes(model)){
      throw new Error(`${this.constructor.name} is not belongs to ${model.name}`);
    }

    const fk = model.name.toLowerCase() + '_id';

    return Object.assign(
      new model(),
      ORM.prepare(`SELECT * from ${model.tableName} WHERE id = ${this[fk]}`).get()
    );
  }

  getMany(model){
    if(!this.constructor.hasMany.includes(model)) {
      throw new Error(`${this.constructor.name} is not belongs to ${model.name}`);
    }

    const lk = this.constructor.name.toLowerCase() + '_id';
    const fk = model.name.toLowerCase() + '_id';

    ORM
      .prepare(`SELECT * from ${model.tableName} WHERE id in (SELECT ${fk} from ${this.constructor.name}_${model.tableName} WHERE ${lk} = ${this.id})`)
      .all();

    return Object.assign();
  }

  static all(model) {
    return ORM.prepare(`SELECT * from ${model.tableName}`).all().map(x => Object.assign(new model(), x));
  }

  static get(model, id){
    return Object.assign(
      new model(),
      ORM.prepare(`SELECT * from ${model.tableName} WHERE id = ${id}`).get()
    );
  }

  /**
   *
   * @param {Database} db
   */
  static setDB(db){
    ORM.db = db;
  }

  static prepare(sql){
    return ORM.db.prepare(sql);
  }
}

ORM.fields    = [];
ORM.belongsTo = [];
ORM.hasMany   = [];
ORM.tableName = 'orms';

module.exports = ORM;