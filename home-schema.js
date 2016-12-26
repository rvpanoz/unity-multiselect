define(function () {

  var baseModel = Ext.define(null, {
    extend: app.classes.model,
    mk_fields: {
      countries: 'string'
    }
  });

  var model = Ext.define(null, {
    extend: app.classes.model,
    idAttribute: 'ID',
    mk_fields: {
      ID: {
        type: 'string'
      },
      NAME: 'string',
      CODE: 'string'
    }
  });

  var collection = Ext.define(null, {
    extend: app.classes.collection,
    model: model
  });

  return {
    country: model,
    countries: collection,
    baseModel: baseModel
  };

});
