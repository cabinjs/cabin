const autoBind = require('auto-bind');

class Cabin {
  constructor(config) {
    this.config = Object.assign(
      {
        logger: console,
        idField: 'id',
        emailField: 'email',
        usernameField: 'full_name'
      },
      config
    );
    autoBind(this);
  }
  middleware() {}
}

module.exports = Cabin;
