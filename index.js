
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const express = require('express');
const http = require('http');
const { graphqlSync, GraphQLScalarType } = require('graphql');
const stubs = require('./stub.json');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const mergedSchemaObj = require('./graphqlSchema');

















async function startApolloServer() {
    // Required logic for integrating with Express
    const app = express();
    const httpServer = http.createServer(app);


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
            jobsByExperimentName: (parent, args, context, info) => {
                return stubs.jobs.filter(job => job.pipeline.experimentName === args.experimentName);
            },
            pipelines: () => stubs.pipelines,
            algorithmBuilds: () => stubs.algorithmBuilds,
        }

    };

    const schema = makeExecutableSchema({ typeDefs: mergedSchemaObj, resolvers });
    // Same ApolloServer initialization as before, plus the drain plugin.
    const server = new ApolloServer({
        schema,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    // More required logic for integrating with Express
    await server.start();
    server.applyMiddleware({
        app,

        // By default, apollo-server hosts its GraphQL endpoint at the
        // server root. However, *other* Apollo Server packages host it at
        // /graphql. Optionally provide this to match apollo-server.
        path: '/'
    });

    // Modified server startup
    await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}



// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.


// const server = new ApolloServer({ schema });

// // The `listen` method launches a web server.
// server.listen().then(({ url }) => {
//     console.log(`🚀  Server ready at ${url}`);
// }).catch(err => {
//     console.log(err);
// });
startApolloServer().catch(err => {
    console.log(err);
});
