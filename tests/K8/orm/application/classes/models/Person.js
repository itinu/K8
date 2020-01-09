const ORM = require('../../../../../../classes/ORM');

class Person extends ORM{
  constructor(id, db) {
    super(id, db);

    if(id)return;

    //foreignKeys


    //fields
    this.first_name = null;
    this.last_name = null;
    this.phone = null;
    this.email = null;
  }
}

Person.jointTablePrefix = 'person';
Person.tableName = 'persons';
Person.key       = 'person_id';

Person.fieldType = {
  first_name : ['TEXT', 'NOT NULL'],
  last_name : ['TEXT', 'NOT NULL'],
  phone : ['TEXT'],
  email : ['TEXT']
};

Person.belongsTo = [
  
];

Person.hasMany   = [
  {fk: 'person_id', model: 'Address'},
  {fk: 'person_id', model: 'User'},
  {fk: 'person_id', model: 'Customer'}
];

Person.belongsToMany = [
  
];


module.exports = Person;
