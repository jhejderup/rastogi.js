var config = module.exports = {};
config.env = 'development';

config.mongo = {};
config.mongo.collection = {};
config.mongo.uri = process.env.MONGO_URI || 'mongodb://localhost/npm';
config.mongo.db = 'npm';
config.mongo.collection.npm = 'npmModule';
config.mongo.collection.evo = 'evoVersionNew';

config.neo4j = {};
config.neo4j.uri = process.env.NEO4J_URI ||'http://localhost:7474/db/data/transaction/commit';
config.neo4j.latestTimestamp = 9007199254740992;

config.neo4j.query = {};
config.neo4j.query.findModules = 'MATCH (p:Package)-[s:`SNAPSHOT`]->(ps1:PackageState)-[d:`DEPENDS_ON`]->(pDep:Package{_id:{vuln_id}}) \n WHERE s.from <= {adv_time} AND s.to > {adv_time} AND d.type = "dep" \n RETURN DISTINCT p';
config.neo4j.query.getAllVersions = 'MATCH (p:Package{_id:{mod_id}})-[s:`SNAPSHOT`]->(ps1:PackageState) \n WHERE s.to >= {adv_time} \n RETURN ps1, s' //restrict to packagestates from the advisory time to now
config.neo4j.query.getAllDependencies = 'MATCH (ps:PackageState{_id:{_id}})-[d:`DEPENDS_ON`]->(pDep:Package) \n WHERE d.type = "dep" \n RETURN d, pDep._id';

config.adv = {};

config.adv.defaultFolder = __dirname.replace('config', 'adv');

// qs
//all: 344
//from adv: 308
//from and to :266

//connect
//fromt/to: 1089