define([
  'home-schema',
  'home-cfg'
], function (schema, cfg) {

  var HomeHandler = app.define(null, {
    extend: 'app.classes.ContentHandler',
    view: cfg,
    initialize: function () {
      this.model = new schema.baseModel();
      this.countries = new schema.countries();

      //load data
      $.ajax({
        url: './countries.json',
        dataType: 'json',
        success: _.bind(function(countries) {
          var models = [];
          _.each(countries, function(c) {
            var country = new schema.country({
              ID: _.uniqueId(),
              CODE: c.CODE,
              NAME: c.NAME
            });
            models.push(country);
          }, this);
          if(models.length) {
            this.countries.reset(models);
          }

          var cfg = this.view.call(this);
          this.root = cfg.root;
          this.ready();
        }, this)
      })

      this.listenTo(this.model, 'change', function(model) {
        console.log(model.attributes);
      });

    }
  });

  return HomeHandler;

});
