const bookshelf = require('bookshelf');
const knex = require('knex');
const config = require('config');
const _ = require('lodash');
const utils = require('../utils/utils');
const schema = require('../data/schema');
var boltBookshelf;

boltBookshelf = bookshelf(knex(config.database));
boltBookshelf.plugin('registry');
boltBookshelf.Model = boltBookshelf.Model.extend({
  hasTimestamps: ['createdAt', 'updatedAt'],

  initialize: function() {
    this.on('creating', this.creating, this);
    this.on('saving', this.saving, this);
  },

  format: function(attrs) {
    return utils.underscored(attrs);
  },

  parse: function(attrs) {
    return utils.camelize(attrs);
  },

  creating: function(newObj, attr, context) {
    this.attributes = this.pick(this.permittedAttributes());
    this._updatedAttributes = newObj.previousAttributes();
    var contextUser = this.contextUser(context);

    if (_(this.permittedAttributes()).contains('createdBy') && !this.get('createdBy') && !!contextUser) {
      this.set('createdBy', contextUser);
    }

    if (_(this.permittedAttributes()).contains('updatedBy') && !this.get('updatedBy') && !!contextUser) {
      this.set('updatedBy', contextUser);
    }
  },

  saving: function(newObj, attr, context) {
    this.attributes = this.pick(this.permittedAttributes());
    this._updatedAttributes = newObj.previousAttributes();

    var contextUser = this.contextUser(context);
    if (_(this.permittedAttributes()).contains('updatedBy') && !!contextUser) {
      this.set('updatedBy', contextUser);
    }
  },

  contextUser: function(context) {
    if (context && context.user) {
      return context.user;
    } else {
      return;
    }
  },

  permittedAttributes: function() {
    var attrsArr = schema.tables[this.tableName];
    var camelizedAttrs = [];
    // Fix race condition between creating&format
    _.each(attrsArr, function(attr) {
      camelizedAttrs.push(_.camelCase(attr));
    });
    return attrsArr.concat(camelizedAttrs);
  },

  getId: function() {
    return this.get('id');
  }
}, {
  add: function* (data, options) {
    return yield this.forge(data).save(null, options);
  },

  addOrUpdate: function* (data, options) {
    return yield this.add(data, options);
  },

  update: function* (data, options) {
    return yield this.add(data, options);
  },

  findOne: function* (id, options) {
    return yield this.where('id', id).fetch(options);
  },

  findOneByProperty: function* (queryParams, options) {
    return yield this.where(queryParams).fetch(options);
  },

  findAll: function* (options) {
    return yield this.fetchAll(options);
  },

  findAllByProperty: function* (queryParams, options) {
    return yield this.where(queryParams).fetchAll(options);
  },

  destroy: function* (id, options) {
    return yield this.forge({id: id}).destroy(options);
  },

  save: function* (model, options) {
    return yield model.save(null, options);
  },

  saveAll: function* (models, options) {
    return yield models.invokeThen('save', null, options);
  }
});

module.exports = boltBookshelf;
