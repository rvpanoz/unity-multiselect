"use strict";

define([
  'lib',
  'app',
  'css!./multiSelectCompoBox'
], function() {

  /**
  ** multiSelectCompoBox component
  **/
  app.define('app.classes.multiSelectCompoBox', {
    extend: 'app.classes.component',
    _values: [],
    events: {
      'keyup': '_onKeyUp',
      'click .mscb-trigger': '_onToggle',
      'click a.mscb-listItem': '_onSelect',
      'click span.close': '_onRemove'
    },
    config: {
      animations: true
    },
	  
    constructor: function() {
      app.classes.multiSelectCompoBox.__super__.constructor.apply(this, arguments);
      $(document).on('click.'+this.id, _.bind(this._onShowHide, this));
    },

    initialize: function() {
      _.bindAll(this, '_resetCollection');
      var o = this.options;

      if (!o.collection) {
        throw new Error('multiSelectCompoBox needs a collection parameter');
      }

      if (!o.displayAttribute) {
        throw new Error('multiSelectCompoBox needs a displayAttribute parameter');
      }

      if (!o.template) {
        throw new Error('multiSelectCompoBox needs a template parameter');
      }

      this.collection = o.collection;
      this.initialModels = o.collection.models;

      //component's template
      this.template = ['<div class="mscb-container form-control mscb-focus">',
        '<span class="mscb-helper" style="display: none;"></span>',
        '<div class="mscb-sel">',
        '<input type="text" class="mscb-input"></div>',
        '<div style="display: none" class="mscb-input-values"></div>',
        '<div class="mscb-trigger">',
        '<div class="mscb-trigger-ico"></div>',
        '</div></div>'
      ].join("");

      this.listenTo(app, 'app:resize', this._onResize);
    },

    inParent: function() {
      this._buildDropdown();
	  this._label();
    },

    renderThis: function() {
      this.$el.append(this._tpl(this.template));
    },
    
    _animateList: function (top) {
      this.$('.mscb-dropdown').animate({
        scrollTop: 0
      }, 'fast');
    },
	
    _onShowHide: function(e) {
      var target = e.target;
      if(!$(target).closest('.xtype-multiSelectCompoBox').length) {
        this._hideDropdown();
      }
    },
	  
    _onKeyUp: function(e) {
      var o = this.options;
      var value = this.$('.mscb-input').val().trim();

      if (!value.length) {
        this._clearResults();
        this._hideDropdown();
        return;
      }

      this._filterCollection(value);
      return false;
    },

    _filterCollection: function(value) {
      var o = this.options;
      var value = value.toLowerCase();

      this._clearResults();
      var searchFields = o.searchAttributes;

      if (!searchFields) {
        throw new Error('searchAttributes parameter is missing.');
      }

      //filter collection based on search fields
      var filtered = _.filter(this.collection.models, function(model) {
        return _.some(searchFields, function(field) {
          var v = model.get(field).toLowerCase();
          return (v.indexOf(value) !== -1);
        });
      }, this);

      var results = (filtered.length < 2) ? 'result'.t() : 'results'.t() + ".";

      if (filtered.length) {
        this._resetCollection(filtered);
        this._showDropdown();
        this.$('.mscb-helper').html('<span>' + filtered.length + '&nbsp;' + results + '</span>').show();

      } else {
        // restore dropdown's collection
        this._resetCollection(this.initialModels);
        this._hideDropdown();
        this.$('.mscb-input').focus();
        this.$('.mscb-helper').text('No results found.').show();
      }
    },

    _addValue: function(id, model) {
      var o = this.options;
      var i = this._values.indexOf(id);

      //clear results
      this._clearResults();

      if(i == -1) {
	       this._values.push(id);
         var $i = $("<div/>", {
           'data-id': id,
           class: 'mscb-sel-item',
           text: model.get(o.displayAttribute)
         });
         $i.append("<span class='close'>&times;</span>");
         this.$('.mscb-input').val('').focus();
         this._hideDropdown();
         this.$('.mscb-input').before($i);
         this.$('.mscb-input-values').append("<input type='hidden' class = 'mscb-hidden' data-id=" + id + ">");
      } else {
        this.$('.mscb-helper').text('Value already exists.').show();
      }

      this._fixWidth();
      this.updateValue(this._values.join(","));
    },

    _onRemove: function(e) {
      e.preventDefault();

      //clear results
      this._clearResults();

      var id = this.$(e.currentTarget).parent().data('id').toString();
      var i = this._values.indexOf(id);
      if(i != -1) {
        this._values.splice(i, 1);
        this.$(e.currentTarget).parent().remove();
      }

      this._fixWidth();
      this.updateValue(this._values.join(","));
    },

    _onSelect: function(e) {
      e.preventDefault();
      var o = this.options;
      var model = app.getClosestModel(e);

      if (model) {
        var id = model.idAttribute || 'ID';
        var idValue = model.get(id);
        this._addValue(idValue, model);
      } else {
        throw new Error('Error updating model.');
      }
      return false;
    },

    _onResize: function() {
      this._fixWidth();
    },

    _showDropdown: function() {
      this.dropdown.$el.removeClass('fadeOut').addClass('fadeIn').show();
    },

    _hideDropdown: function() {
      this.dropdown.$el.removeClass('fadeIn').addClass('fadeOut').hide();
    },

    _onToggle: function(e) {
      e.preventDefault();
      this.dropdown.$el.removeClass('fadeOut').removeClass('fadeIn');
      this.dropdown.$el.toggle();
      return false;
    },

    _clearResults: function(e) {
      if (e) {
        e.preventDefault();
      }
      this._resetCollection(this.initialModels);
      this.$('.mscb-helper').html('').hide();

    },

    _resetCollection: function(initialModels) {
      this.collection.reset(initialModels, {
        silent: true //avoid rendering
      });
      this.dropdown.render();
    },

    _buildDropdown: function() {
      var o = this.options;

      this.dropdown = app.create({
        className: 'mscb-dropdown animated',
        items: [{
          className: 'list-container',
          items: [{
            xtype: 'list',
            itemId: 'list-box',
            className: 'search-list',
            collection: this.collection,
            items: [{
              body: "<a href='#' class=''mscb-listItem'>" + o.template + "</a>"
            }]
          }]
        }]
      }).render();

      //append dropdown
      this.$el.append(this.dropdown.$el);
    },

    _fixWidth: function() {
      var input = this.$('.mscb-input'),
        container = this.$('.mscb-container');
      input.width(0);
      var inputOffset = input.offset().left - container.offset().left;
      var w = container.width() - inputOffset - 42;
      input.width(w);
    },
	  
    destructor: function() {
      $(document).off('click.'+this.id);
    }

  })
});
