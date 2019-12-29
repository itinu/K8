const K8 = require('../../K8');
const EXE_PATH = __dirname.replace(/\/tests$/, '') + '/server';

test('APP Path', () => {
    K8.init(EXE_PATH);
    expect(K8.APP_PATH).toBe(`${EXE_PATH}/application`);
});

test('K8.require', () => {
    const packagePath = `${__dirname}/test1/`;
    K8.init(packagePath);

    expect(K8.MOD_PATH).toBe(`${packagePath}/modules`);

    const Test = K8.require('Test');
    const t = new Test();
    expect(t.getFoo()).toBe('bar');
});

test('switch package', () => {
    let testDir = __dirname;
    K8.init(`${testDir}/test1`);
    expect(K8.MOD_PATH).toBe(`${testDir}/test1/modules`);

    let T = K8.require('Test');
    const t1 = new T();
    expect(t1.getFoo()).toBe('bar');

    const Foo1 = K8.require('Foo');
    const f1 = new Foo1();
    expect(f1.getFoo()).toBe('fooo');

    K8.init(`${testDir}/test2`);
    expect(K8.MOD_PATH).toBe(`${testDir}/test2/modules`);

    T = K8.require('Test');
    const t2 = new T();
    expect(t2.getFoo()).toBe('tar');

    try{
        const Foo2 = K8.require('Foo');
        const f2 = new Foo2();
    }catch(e){
        expect(e.message.replace(/ {[^}]+}/, '')).toBe('K8 resolve path error: path Foo.js not found. classes , ');
    }
});

test('application folder', () => {
    let testDir = __dirname;
    K8.init(`${testDir}/test1`);
    expect(K8.APP_PATH).toBe(`${testDir}/test1/application`);

    const Foo1 = K8.require('Foo');
    const f1 = new Foo1();
    expect(f1.getFoo()).toBe('fooo');

    K8.init(`${testDir}/test2`);
    expect(K8.APP_PATH).toBe(`${testDir}/test2/application`);

    try{
        const Foo2 = K8.require('Foo');
        const f2 = new Foo2();
    }catch(e){
        expect(e.message.replace(/ {[^}]+}/, '')).toBe('K8 resolve path error: path Foo.js not found. classes , {} ');
    }
});

test('custom module folder', () => {
    let testDir = __dirname;
    K8.init(`${testDir}/test1`, `${testDir}/test3/application`,`${testDir}/test1/modules`);
    expect(K8.APP_PATH).toBe(`${testDir}/test3/application`);
    expect(K8.MOD_PATH).toBe(`${testDir}/test1/modules`);

    const Foo1 = K8.require('Foo');//test3/Foo
    const f1 = new Foo1();
    expect(f1.getFoo()).toBe('waa');

    const Test = K8.require('Test');
    const t = new Test();
    expect(t.getFoo()).toBe('bar');

});

test('path not found', ()=>{
   try{
       K8.require('NotFound');
   }catch(e){
       expect(e.message.replace(/ {[^}]+}/, '')).toBe('K8 resolve path error: path NotFound.js not found. classes , ');
   }
});

test('inline modules init', ()=>{
    let testDir = __dirname;
    expect(global.testInit).toBe(undefined);
    K8.init(`${testDir}/test4`);
    expect(global.testInit).toBe(true);
    delete global.testInit;
});

test('npm modules init ', ()=>{
    let testDir = __dirname;
    expect(global.testInit).toBe(undefined);
    K8.init(`${testDir}/test5`);
    expect(global.testInit).toBe(true);
});

test('clear cache', ()=>{
    let testDir = __dirname;
    K8.init(`${testDir}/test6`);
    const Foo = K8.require('Foo');
    expect(Foo.id).toBe(1);

    const Foo2 = K8.require('Foo');
    expect(Foo2.id).toBe(1);

    K8.config.cache.exports = true;
    K8.clearCache();

    const Foo3 = K8.require('Foo');
    expect(Foo3.id).toBe(1);

    K8.config.cache.exports = false;
    K8.clearCache();
    //jest override require, need to use reset modules to invalidate
    jest.resetModules();

    const Foo4 = K8.require('Foo');
    expect(Foo4.id).toBe(2);
});

test('resolveView', ()=>{
   K8.init(`${__dirname}/test7`);
   const viewFile = K8.resolveView('test.html');
   expect(viewFile).toBe(`${__dirname}/test7/application/views/test.html`);
});

