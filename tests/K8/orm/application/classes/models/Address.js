const ORM = require('../../../../../../classes/ORM');

class Address extends ORM{
  constructor(id, db) {
    super(id, db);

    if(id)return;

    //foreignKeys
    this.person_id = null;

    //fields
    this.address1 = null;
    this.address2 = null;
    this.city = null;
    this.company = null;
    this.country = null;
    this.country_code = null;
    this.province = null;
    this.province_code = null;
    this.street = null;
    this.zip = null;
  }
}

Address.jointTablePrefix = 'address';
Address.tableName = 'addresses';
Address.key       = 'address_id';

Address.fieldType = {
  address1 : ['TEXT', 'NOT NULL'],
  address2 : ['TEXT'],
  city : ['TEXT'],
  company : ['TEXT'],
  country : ['TEXT'],
  country_code : ['TEXT'],
  province : ['TEXT'],
  province_code : ['TEXT'],
  street : ['TEXT'],
  zip : ['TEXT']
};

Address.belongsTo = [
  {fk: 'person_id', model: 'Person'}
];

Address.hasMany   = [
  {fk: 'address_id', model: 'Customer'},
  {fk: 'billing_address_id', model: 'Order'},
  {fk: 'shipping_address_id', model: 'Order'},
  {fk: 'address_id', model: 'Shop'},
  {fk: 'shipping_address_id', model: 'Checkout'},
  {fk: 'billing_address_id', model: 'Checkout'}
];

Address.belongsToMany = [
  
];


module.exports = Address;
