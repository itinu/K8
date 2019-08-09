const ORM = require('../../../../../../classes/ORM');

class Tag extends ORM{
  constructor(id) {
    super(id);

    if(id)return;

    //foreignKeys


    //fields
    this.name = null;
  }
}

Tag.jointTablePrefix = 'tag';
Tag.tableName = 'tags';
Tag.key       = 'tag_id';

Tag.fieldType = {
  name : ['TEXT', 'NOT NULL']
};

Tag.belongsTo = [
  
];

Tag.hasMany   = [
  
];

Tag.belongsToMany = [
  
];


module.exports = Tag;
