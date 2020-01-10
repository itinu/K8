const K8 = require('../K8');
const Model = K8.require('Model');

//static private function
function assignTableName(model){
  model.jointTablePrefix = model.name.toLowerCase();
  model.tableName = model.jointTablePrefix + 's';
}

class ORM extends Model{
  constructor(id = null, options = {}){
    super();
    this.db = options.database;

    this.id = id;
    this.uid = null;
    this.created_at = null;
    this.updated_at = null;

    if(this.constructor !== ORM){
      if(!this.constructor.tableName){
        assignTableName(this.constructor);
      }

      if(!this.constructor.jointTablePrefix){
        this.constructor.jointTablePrefix = this.constructor.tableName.replace(/s$/i, '')//singluar tableName;
      }
    }

    if(id !== null){
      Object.assign(this, this.prepare(`SELECT * from ${this.constructor.tableName} WHERE ${options.isUid? 'uid' : 'id'} = ?`).get(id));
    }
  }

  /**
   * @return ORM
   */
  save(){
    const tableName = this.constructor.tableName;
    const columns = Object.keys(this.constructor.fieldType);
    //add belongsTo to columns
    this.constructor.belongsTo.forEach(x => columns.push(x.fk));

    const sql = (this.id) ?
        `UPDATE ${tableName} SET ${columns.map(x => `${x} = ?`).join(', ')} WHERE id = ?` :
        `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map(x => `?`).join(', ')})` ;
    const values = columns.map(x => this[x]);

    const res = this.prepare(sql).run(...values);
    this.id = this.id || res.lastInsertRowid;

    return this;
  }

  delete(){
    if(!this.id)throw new Error('ORM delete Error, no id defined');
    const tableName = this.constructor.tableName;
    this.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(this.id);
  }
  /**
   * belongs to - this table have xxx_id column
   * @param fk
   * @returns {Model}
   */
  belongsTo(fk){
    const modelName = this.constructor.belongsTo.find(x => x.fk === fk).model;
    const model = K8.require(`models/${modelName}`);
    return new model(this[fk], {database: this.db});
  }

  /**
   * has many
   */
  hasMany(model){
    if(!model.tableName)assignTableName(model);

    const key = this.constructor.key;
    return this.prepare(`SELECT * FROM ${model.tableName} WHERE ${key} = ?`).all(this.id).map(x => Object.assign(new model(null, {database : this.db}), x));
  }

  /**
   *
   * @param {Model} model
   */
  belongsToMany(model){
    const jointTableName = this.constructor.jointTablePrefix + '_' +model.tableName;

    return this.prepare(`SELECT * FROM ${jointTableName} WHERE ${this.constructor.key} = ?`)
        .all(this.id)
        .map(x => new model(x[model.key], {database : this.db}));
  }

  /**
   *
   * @param {Database} db
   */
  static setDB(db){
    ORM.db = db;
  }

  /**
   *
   * @param {Model} model
   * @returns {Array}
   */
  all(){
    const model = this.constructor;
    if(!model.tableName)assignTableName(model);
    return this.prepare(`SELECT * from ${model.tableName}`).all().map(x => Object.assign(new model(null, {database: this.db}), x));
  }

  static all(model) {
    const m = new model();
    return m.all();
  }

  /**
   *
   * @param {Model} model
   * @param {Number} id
   * @returns {Object}
   */
  static get(model, id){
    return new model(id);
  }

  /**
   *
   * @param {string} sql
   */
  prepare(sql){
    if(this.db)return this.db.prepare(sql);
    return ORM.prepare(sql);
  }

  static prepare(sql){
    if(!ORM.db)throw new Error('ORM Database not assigned. Please provide database with ORM.setDB(db)');
    return ORM.db.prepare(sql);
  }
}

//ORM is abstract, jointTablePrefix and tableName must be undefined.
ORM.jointTablePrefix = undefined;
ORM.tableName = undefined;
ORM.key = undefined;
ORM.fieldType = {};
ORM.belongsTo = [];
ORM.hasMany   = [];
ORM.belongsToMany = [];

module.exports = ORM;