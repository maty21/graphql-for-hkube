const { ApolloServer, gql } = require('apollo-server');
const { graphqlSync, GraphQLScalarType } = require('graphql');
const stubs = require('./stub.json');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const mergedSchemaObj = require('./graphqlSchema');


const ObjectScalarType = new GraphQLScalarType({
    name: 'Object',
    description: 'Arbitrary object',
    parseValue: (value) => {
        return typeof value === 'object' ? value
            : typeof value === 'string' ? JSON.parse(value)
                : null
    },
    serialize: (value) => {
        return typeof value === 'object' ? value
            : typeof value === 'string' ? JSON.parse(value)
                : null
    },
    parseLiteral: (ast) => {
        switch (ast.kind) {
            case Kind.STRING: return JSON.parse(ast.value)
            case Kind.OBJECT: throw new Error(`Not sure what to do with OBJECT for ObjectScalarType`)
            default: return null
        }
    }
})





const resolvers = {
    Object: ObjectScalarType,
    Query: {
        jobs: () => stubs.jobs,
        algorithms: () => stubs.algorithms,
        algorithmsByName: (parent, args, context, info) => {
            return stubs.algorithms.find(algorithm => algorithm.name === args.name);
        },
        pipelines: () => stubs.pipelines,
        algorithmBuilds: () => stubs.algorithmBuilds,
    }

};



const schema = makeExecutableSchema({ typeDefs: mergedSchemaObj, resolvers });
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ schema });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
}).catch(err => {
    console.log(err);
});
