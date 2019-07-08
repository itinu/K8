class Controller{
  /**
   *
   * @param {Request} request
   * @param {Reply} response
   */
  constructor(request, response){
    this.headerSent = false;

    this.request = request;
    this.response = response;
    this.output = '';
    this.mixins = [];

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

  /**
   *
   * @param {ControllerMixin} mixin
   * @returns {ControllerMixin}
   */
  addMixin(mixin){
    this.mixins.push(mixin);
    return mixin;
  }

  async before(){
    for(let i = 0; i < this.mixins.length; i++){
      await this.mixins[i].before();
    }
  }

  async after(){
    for(let i = 0; i < this.mixins.length; i++){
      await this.mixins[i].after();
    }
  }

  async execute(){
    try{
      //guard check function action_* exist
      const action = `action_${this.request.params.action || 'index'}`;

      if(this[action] === undefined){
        this.notFound(`${ this.constructor.name }::${action} not found`);
        return this.response;
      }
      this.response.header('X-ZOPS-Controller-Action', `${ this.constructor.name }::${action}`);

      if(!this.headerSent)await this.before();
      if(!this.headerSent)await this[action]();
      if(!this.headerSent)await this.after();

    }catch(err){
      this.response.code(500);
      this.output = `<pre>500 / ${ err.message }\n\n ${ err.stack }</pre>`;
    }

    return this.response;
  }

  notFound(msg){
    this.response.code(404);
    this.output = `404 / ${ msg }`;

    this.headerSent = true;
  }

  redirect(location){
    this.response.header('location', location);
    this.response.code(302);
    this.headerSent = true;
  }

  async action_index(){
  }
}

module.exports = Controller;