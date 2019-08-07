const K8 = require('../K8');
const Model = K8.require('Model');

class ORM extends Model{
  constructor(){
    super();
    this.id = null;
    this.created_at = null;
    this.updated_at = null;
    this.lowercase  = this.constructor.name.toLowerCase();
  }

  contains(ary, model, fk){
    for(let i=0;i< this.constructor.belongsTo.length; i++){
      const x = this.constructor.belongsTo[i];
      if(x.model === model && x.fk === fk){
        return true;
      }
    }

    return false;
  }

  /**
   *
   * @returns {Model}
   */
  belongsTo(modelName, fk){
    if(!this.id)return null;
    const m = K8.require(`model/${modelName}`);

    const belongs = ORM.prepare(`SELECT * from ${m.tableName} WHERE id = ?`).get(this[fk]);
    if(!belongs)return null;

    return Object.assign(new m(), belongs);
  }

  hasMany(modelName, fk){
    if(!this.id)return [];
    const m = K8.require(`model/${modelName}`);

    return ORM
      .prepare(`SELECT * from ${m.tableName} WHERE ${fk} = ?`)
      .all(this.id)
      .map(x => Object.assign(new m(), x));
  }

  belongsToMany(modelName){
    if(!this.id)return [];
    const m = K8.require(`model/${modelName}`);

    return ORM
      .prepare(`SELECT * from ${m.tableName} WHERE id in (SELECT ${m.key} from ${this.lowercase}_${m.tableName} WHERE ${this.constructor.key} = ?)`)
      .all(this.id)
      .map(x => Object.assign(new m(), x));
  }

  /**
   *
   * @param {Model} model
   * @returns {Array}
   */
  static all(model) {
    return ORM.prepare(`SELECT * from ${model.tableName}`).all().map(x => Object.assign(new model(), x));
  }

  /**
   *
   * @param {Model} model
   * @param {Number} id
   * @returns {Object}
   */
  static get(model, id){
    return Object.assign(
      new model(),
      ORM.prepare(`SELECT * from ${model.tableName} WHERE id = ?`).get(id)
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

/*  static createStaticVariables(model, tableName, fieldType, belongsTo, hasMany, belongsToMany){
    model.lowercase     = model.name.toLowerCase();
    model.tableName     = tableName     || (model.lowercase + 's');
    model.key           = model.lowercase + '_id';
    model.fieldType     = model.fieldType || {};

    model.belongsTo     = belongsTo     || [];
    model.hasMany       = hasMany       || [];
    model.belongsToMany = belongsToMany || [];
  }*/
}

//ORM.createStaticVariables(ORM);

module.exports = ORM;