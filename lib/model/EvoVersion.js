/*
 * EvoVersion
 *
 * Mongoose Model for saving data output from the EvoAnalyzer
 *
 * @param {object} options
 * @return {object} mongoose model
 */
function EvoVersionModel(options) {
  'use strict';
  var db;
  var timestamps = require('mongoose-timestamps');
  var config = require('../../config/config.global');
  if (!options.db) {
    throw new Error('mongoose db is required');
  }
  db = options.db;
  var evoSchema = db.Schema({
    mod_id: String,
    adv: {
      mod_id: String,
      published: Date,
      vulnRange: String,
      patchTange: String},
    versionAnalysis: [{
      meta: {prevVersion: String, currVersion: String},
      depType: {status: String, from: String},
      depRange: {
        prevVuln: {
          vuln: Boolean,
          maxSatis: String,
          resolve: Boolean
        },
		currVuln: {
          vuln: Boolean,
          maxSatis: String,
          resolve: Boolean
        },
		compare: {
          status: String
        }
      },
      depUsage: {
        prev: String,
        curr: String
      }
    }],
    snapshots: [
      {
        version: String,
        timeDiff: {
          from: String,
          to: String,
          after: Boolean,
          days: Number
        },
        vuln: Boolean,
        maxSatis: String,
        resolve: Boolean
      }
    ]
  });
  evoSchema.plugin(timestamps);
  return db.model(config.mongo.collection.evo, evoSchema);
}
module.exports = EvoVersionModel;
