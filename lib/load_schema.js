'use strict';

const fs = require('fs');
const path = require('path');
const {
	makeExecutableSchema,
} = require('graphql-tools');
const _ = require('lodash');

const { fileExistsSync } = require('./util');

const SYMBOL_SCHEMA = Symbol('Applicaton#schema');

module.exports = app => {
	const basePath = path.join(app.baseDir, 'app/graphql');
	const types = fs.readdirSync(basePath);
	
	const schemas = [];
	const resolverMap = {};
	const directiveMap = {};
	
	types.forEach(type => {
		// 加载schema
		const schemaFile = path.join(basePath, type, 'schema.graphql');
  /* istanbul ignore else */
	if (fs.existsSync(schemaFile)) {
		const schema = fs.readFileSync(schemaFile, {
			encoding: 'utf8',
		});
		schemas.push(schema);
	}
	
	// 加载resolver
	let resolverFile = path.join(basePath, type, 'resolver');
	resolverFile = fileExistsSync(resolverFile, app.config.graphql.srcExtensions);
	if (resolverFile !== false) {
		const resolver = require(resolverFile);
		_.merge(resolverMap, resolver);
	}
	
	// 加载directive resolver
	let directiveFile = path.join(basePath, type, 'directive');
	directiveFile = fileExistsSync(directiveFile, app.config.graphql.srcExtensions);
	if (directiveFile !== false) {
		const directive = require(directiveFile);
		_.merge(directiveMap, directive);
	}
});
	
	Object.defineProperty(app, 'schema', {
		get() {
			if (!this[SYMBOL_SCHEMA]) {
				this[SYMBOL_SCHEMA] = makeExecutableSchema({
					typeDefs: schemas,
					resolvers: resolverMap,
					directiveResolvers: directiveMap,
				});
			}
			return this[SYMBOL_SCHEMA];
		},
	});
};