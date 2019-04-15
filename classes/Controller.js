const {Request, Reply} = require('fastify');
const K8 = require('../K8');

const ORM = K8.require('ORM');

class Controller{
  /**
   *
   * @param {Request} request
   * @param {Reply} response
   */
  constructor(request, response){
    this.showDefaultText = true;

    this.request = request;
    this.response = response;
    this.instances = [];
    this.instance = null;
    this.output = '';
    this.model = ORM;
    this.response.type('text/html; charset=utf-8');
  }

  before(){}

  after(){}

  execute(){
    //guard check function action_* exist
    const action = `action_${this.request.params.action || 'index'}`;

    if(this[action] === undefined){
      this.not_found(`${ this.constructor.name }::${action} not found`);
      return this.response;
    }

    this.before();
    this.response.header('X-ZOPS-Controller-Action', `${ this.constructor.name }::${action}`);

    this[action]();
    this.after();

    return this.response;
  }

  not_found(msg){
    this.response.code(404).type('text/html');
    this.output = `404 / ${ msg }`;
  }

  action_index(){
    this.instances = ORM.all(this.model);

    if(this.showDefaultText){
      this.instances.forEach(x => (this.output += `<li>${x.name || x.handle || x.id}</li>\n`))
    }
  }

  action_read(){
    this.instance = ORM.get(this.model, this.request.params.id);

    if(this.showDefaultText){
      this.output += `read ${this.instance.constructor.name} (${this.instance.id}) created at ${this.instance.created_at}`;
    }
  }
}

module.exports = Controller;