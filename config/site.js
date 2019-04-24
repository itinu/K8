//copy this to application folder.
delete require.cache[require.resolve('./site')];

module.exports = {
  cache : {
    exports  : true,
    database : true,
    view     : true
  },
  salt : 'theencryptsaltatleast32character',
};