class Foo{
    constructor(){
    }
}
global.FooID = global.FooID || 0;
global.FooID++;
Foo.id = global.FooID;

module.exports = Foo;