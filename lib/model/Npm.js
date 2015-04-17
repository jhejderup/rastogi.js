/*
 * npmModel
 *
 * Minimal Mongoose Model for the mirror of the NPM Skimdb database
 *
 * @param {object} options
 * @return {object} mongoose model
 */
function npmModel(options) {
  'use strict';
  var db;
  var timestamps = require('mongoose-timestamps');
  var config = require('../../config/config.global');
  if (!options.db) {
    throw new Error('mongoose db is required');
  }
  db = options.db;
  var npmSchema = db.Schema({
      _id: { type: String, unique: true, index: true },
      versions: [String],
      time: {
        modified: Date,
        created: Date
      }
    }, {
      strict: true
    });
  npmSchema.plugin(timestamps);
  return db.model(config.mongo.collection.npm, npmSchema);
}
module.exports = npmModel;
