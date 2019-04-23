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

    if(!this.id || !this[model.key])return null;

    const belongs = ORM.prepare(`SELECT * from ${model.tableName} WHERE id = ?`).get(this[model.key]);
    if(!belongs)return null;

    return Object.assign(new model(), belongs);
  }

  getMany(model){
    if(!this.constructor.hasMany.includes(model)) {
      throw new Error(`${this.constructor.name} is not belongs to ${model.name}`);
    }

    //no id, one to many relation must return an empty array.
    if(!this.id){
      return [];
    }

    return ORM
      .prepare(`SELECT * from ${model.tableName} WHERE id in (SELECT ${model.key} from ${this.constructor.lowercase}_${model.tableName} WHERE ${this.constructor.key} = ?)`)
      .all(this.id)
      .map(x => Object.assign(new model(), x));
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

  static createStaticVariables(model, tableName, fields, belongsTo, hasMany){
    model.lowercase = model.name.toLowerCase();
    model.key       = model.lowercase + '_id';
    model.tableName = tableName || (this.lowercase + 's');
    model.fields    = fields || [];
    model.belongsTo = belongsTo || [];
    model.hasMany   = hasMany || [];
  }
}

ORM.createStaticVariables(ORM);

module.exports = ORM;