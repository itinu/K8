const K8 = require('k8mvc');
const Database = require('better-sqlite3');
const fs = require('fs');
K8.init(__dirname, __dirname+'/orm/application', __dirname+'/test1/modules');

test('orm', ()=>{
    const K8ORM = K8.require('ORM');
    const ORM = require('../../classes/ORM');
    expect(K8ORM).toBe(ORM);

    const obj = new ORM();
    const className = obj.constructor.name;

    expect(className).toBe('ORM');
    expect(ORM.lowercase).toBe(undefined);
    expect(ORM.tableName).toBe(undefined);
    //ORM is abstract class, should not found lowercase and tableName
});

test('extends ORM', ()=>{
    const TestModel = require('./orm/application/classes/TestModel');
    new TestModel();

    expect(TestModel.tableName).toBe('testmodels');
});

test('DB', () =>{
    const dbPath = __dirname+'/orm/db/db.sqlite';
    if(fs.existsSync(dbPath))fs.unlinkSync(dbPath);
    const db = new Database(dbPath);

    const sql = `CREATE TABLE tests( id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL , text TEXT NOT NULL)`;
    db.prepare(sql).run();

    const tmpValue = Math.random().toString();
    db.prepare('INSERT INTO tests(text) VALUES (?)').run(tmpValue);

    const result = db.prepare('SELECT * from tests WHERE text = ?').get(tmpValue);
    expect(result.text).toBe(tmpValue);
});

test('ORM.setDB', ()=>{
    const dbPath = __dirname+'/orm/db/db.sqlite';
    if(fs.existsSync(dbPath))fs.unlinkSync(dbPath);
    const db = new Database(dbPath);

    const ORM = require('../../classes/ORM');
    ORM.setDB(db);

    const tableName = 'testmodels';
    db.prepare(`CREATE TABLE ${tableName}( id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL , created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL , updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL , text TEXT NOT NULL)`).run();
    db.prepare(`CREATE TRIGGER ${tableName}_updated_at AFTER UPDATE ON ${tableName} WHEN old.updated_at < CURRENT_TIMESTAMP BEGIN UPDATE ${tableName} SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id; END;`).run();
    db.prepare(`INSERT INTO ${tableName} (text) VALUES (?)`).run('Hello');
    db.prepare(`INSERT INTO ${tableName} (text) VALUES (?)`).run('Foo');

    const TestModel = require('./orm/application/classes/TestModel');
    const m = TestModel.get(TestModel, 1);
    const m2 = new TestModel(2);

    expect(TestModel.tableName).toBe('testmodels');

    expect(m.text).toBe('Hello');
    expect(m2.text).toBe('Foo');

});

test('alias model', ()=>{
    const AliasModel = require('./orm/application/classes/AliasModel');
    expect(AliasModel.tableName).toBe('testmodels');

    new AliasModel();
    expect(AliasModel.jointTablePrefix).toBe('testmodel');

    const model = new AliasModel(1);
    expect(model.text).toBe('Hello');
});

test('belongsTo', () =>{
    const dbPath = __dirname+'/orm/db/belongsTo.sqlite';
    if(fs.existsSync(dbPath))fs.unlinkSync(dbPath);
    fs.copyFileSync(__dirname+'/orm/db/belongsTo.default.sqlite', dbPath);
    const db = new Database(dbPath);
    db.prepare('INSERT INTO persons (first_name, last_name) VALUES (?, ?)').run('Peter', 'Pan');
    db.prepare('INSERT INTO addresses (person_id, address1) VALUES (?, ?)').run(1, 'Planet X');

    const ORM = require('../../classes/ORM');
    ORM.setDB(db);

    const Address = K8.require('models/Address');
    const Person = K8.require('models/Person');

    const peter = new Person(1);
    expect(peter.first_name).toBe('Peter');

    const home = new Address(1);
    expect(home.address1).toBe('Planet X');

    const owner = home.belongsTo('person_id');
    expect(owner.first_name).toBe('Peter');
});

test('belongsToMany', () =>{
    const dbPath = __dirname+'/orm/db/belongsToMany.sqlite';
    if(fs.existsSync(dbPath))fs.unlinkSync(dbPath);
    fs.copyFileSync(__dirname+'/orm/db/belongsToMany.default.sqlite', dbPath);
    const db = new Database(dbPath);

    db.prepare('INSERT INTO products (name) VALUES (?)').run('bar');
    db.prepare('INSERT INTO tags (name) VALUES (?)').run('foo');
    db.prepare('INSERT INTO tags (name) VALUES (?)').run('tar');
    db.prepare('INSERT INTO product_tags (product_id, tag_id) VALUES (?,?)').run(1, 1);
    db.prepare('INSERT INTO product_tags (product_id, tag_id) VALUES (?,?)').run(1, 2);

    const ORM = require('../../classes/ORM');
    ORM.setDB(db);

    const Product = K8.require('models/Product');
    const Tag     = K8.require('models/Tag');

    const product = new Product(1);

    expect(product.name).toBe('bar');
    const tags = product.belongsToMany(Tag);

    expect(tags[0].name).toBe('foo');
    expect(tags[1].name).toBe('tar');
});

test('ORM get all from model', ()=>{
    const dbPath = __dirname+'/orm/db/belongsToMany.sqlite';
    if(fs.existsSync(dbPath))fs.unlinkSync(dbPath);
    fs.copyFileSync(__dirname+'/orm/db/belongsToMany.default.sqlite', dbPath);
    const db = new Database(dbPath);

    db.prepare('INSERT INTO tags (name) VALUES (?)').run('foo');
    db.prepare('INSERT INTO tags (name) VALUES (?)').run('tar');

    const ORM = require('../../classes/ORM');
    ORM.setDB(db);

    const Tag = K8.require('models/Tag');
    const tags = ORM.all(Tag);

    expect(tags[0].name).toBe('foo');
    expect(tags[1].name).toBe('tar');
});