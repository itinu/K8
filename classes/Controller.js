const K8 = require('../K8');
const ORM = K8.require('ORM');

class Controller{
  /**
   *
   * @param {Request} request
   * @param {Reply} response
   */
  constructor(request, response){
    this.request = request;
    this.response = response;
    this.instances = [];
    this.instance = null;
    this.output = '';
    this.model = ORM;

    this.view = null;

    this.format = this.request.params.format || 'html';

    switch(this.format){
      case 'json':
        this.response.type('text/json; charset=utf-8');
        break;
      case 'png':
        this.response.type('image/png');
        break;
      case 'jpg':
      case 'jpeg':
        this.response.type('image/jpeg');
        break;
      default:
        this.response.type('text/html; charset=utf-8');
    }
  }

  async before(){

  }

  async after(){

  }

  async execute(){
    //guard check function action_* exist
    const action = `action_${this.request.params.action || 'index'}`;

    if(this[action] === undefined){
      this.not_found(`${ this.constructor.name }::${action} not found`);
      return this.response;
    }
    this.response.header('X-ZOPS-Controller-Action', `${ this.constructor.name }::${action}`);

    await this.before();
    this[action]();
    await this.after();

    return this.response;
  }

  not_found(msg){
    this.response.code(404);
    this.output = `404 / ${ msg }`;
  }

  redirect(location){
    this.response.header('location', location);
    this.response.code(302);
  }

  action_index(){
    this.instances = ORM.all(this.model);
  }

  action_read(){
    this.instance = ORM.get(this.model, this.request.params.id);
  }
}

module.exports = Controller;