
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const express = require('express');
const { createServer } = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { GraphQLScalarType, execute, subscribe } = require('graphql');
const stubs = require('./stub.json');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const typeDefs = require('./graphqlSchema');


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

// async function startApolloServer(typeDefs, resolvers) {
//     // Required logic for integrating with Express
//     const app = express();
//     const httpServer = http.createServer(app);
//     const schema = makeExecutableSchema({ typeDefs, resolvers });
//     const subscriptionServer = SubscriptionServer.create({ schema, execute, subscribe }, { server: httpServer, path: server.graphqlPath });

//     const server = new ApolloServer({
//         schema, plugins:
//             [{
//                 async serverWillStart() {
//                     return {
//                         async drainServer() {
//                             subscriptionServer.close();
//                         }
//                     };
//                 }
//             }],
//     });
//     // More required logic for integrating with Express
//     await server.start();
//     server.applyMiddleware({
//         app,
//         // By default, apollo-server hosts its GraphQL endpoint at the
//         // server root. However, *other* Apollo Server packages host it at
//         // /graphql. Optionally provide this to match apollo-server.
//         path: '/'
//     });

//     await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve));
//     console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
// }


// startApolloServer(mergedSchemaObj, resolvers).catch(err => {
//     console.log(err);
// });


async function startApolloServer(typeDefs, resolvers) {
    const app = express();

    const httpServer = createServer(app);

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
    });

    const subscriptionServer = SubscriptionServer.create(
        { schema, execute, subscribe },
        { server: httpServer, path: '/subscriptions' },
    );

    const server = new ApolloServer({
        schema,
        plugins: [{
            async serverWillStart() {
                return {
                    async drainServer() {
                        subscriptionServer.close();
                    }
                };
            }
        }],
    });
    await server.start();
    server.applyMiddleware({ app });

    const PORT = 4000;
    httpServer.listen(PORT, () =>
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
    );
}

startApolloServer(typeDefs, resolvers).catch(err => {
    console.log(err);
});
