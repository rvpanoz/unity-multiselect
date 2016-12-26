define(function () {
  return function () {

    var cfg = {
      root: {
        items: [{
          xtype: 'grid',
          items: [{
            model: this.model,
            collection: this.countries,
            label: 'Select countries',
            xtype: 'multiSelectCompoBox',
            template: "<%= CODE %> - <%= NAME %>",
            displayAttribute: 'NAME',
            searchAttributes: ['NAME', 'CODE'],
            fieldName: 'countries'
          }]
        }]
      }
    }
    return cfg;
  };

});
