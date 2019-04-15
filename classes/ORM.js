const Database  = require('better-sqlite3');
const Model = require('./Model');

class ORM extends Model{
  constructor(){
    super();
    this.fk = this.constructor.name.toLowerCase()+'_id';
    this.id = null;
    this.created_at = null;
    this.updated_at = null;
  }

  /**
   *
   * @returns {Model}
   */
  belongsTo(model){
    const fk = new model().constructor.name.toLowerCase() + '_id';
    if(!this[fk])return null;
    return new model().parse(ORM.prepare(`SELECT * from ${ORM.getTableNameBy(model)} WHERE id = ${this[fk]}`).get());
  }

  /**
   *
   * @returns {Model}
   */
  hasOne(model){
    if(this.id == null)return null;
    return new model().parse(ORM.prepare(`SELECT * from ${ORM.getTableNameBy(model)} WHERE ${this.fk} = ${this.id}`).get());
  }

  hasManyThrough(model, through){
    if(this.id == null )return null;
    ORM.prepare(`SELECT * from ${through} WHERE ${this.fk} = ${this.id}`);
    //TODO
    return new model().parse();
  }

  static all(model) {
    return ORM.prepare(`SELECT * from ${ORM.getTableNameBy(model)}`).all().map(x => new model().parse(x));
  }

  static get(model, id){
    return new model().parse(
      ORM.prepare(`SELECT * from ${ORM.getTableNameBy(model)} WHERE id = ${id}`).get()
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

  static getTableNameBy(model){
    return model.tableName || (new model().constructor.name.toLowerCase() + 's');
  }
}

module.exports = ORM;