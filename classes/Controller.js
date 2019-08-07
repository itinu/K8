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

      for(let i = 0; i < this.mixins.length; i++){
        await this.mixins[i].execute(action);
      }

      if(!this.headerSent)await this.before();
      if(!this.headerSent)await this[action]();
      if(!this.headerSent)await this.after();

    }catch(err){
      this.serverError(err);
    }

    return this.response;
  }

  /**
   *
   * @param {Error} err
   */
  serverError(err){
    this.output = `<pre>500 / ${ err.message }\n\n ${ err.stack }</pre>`;
    this.exit(500);
  }

  /**
   *
   * @param {string} msg
   */
  notFound(msg){
    this.output = `404 / ${ msg }`;
    this.exit(404);
  }

  /**
   *
   * @param {string} location
   */
  redirect(location){
    this.response.header('location', location);
    this.exit(302);
  }

  /**
   *
   * @param {Number} code
   */
  exit(code){
    this.response.code(code);
    this.headerSent = true;
  }

  async action_index(){
  }
}

module.exports = Controller;