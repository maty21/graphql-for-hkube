const { ApolloServer, gql } = require('apollo-server');
const { graphqlSync } = require('graphql');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  type People {
    first: String
    last: String
    myBooks: [Book]
  }

type Job{
    id: String,
    pipelineName: String,
    graph:Graph
}
type Graph{
    name:String,
    graphObj:graphObject,
}

type graphObject{
    name: String
}
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book],
    peoples:[People],
    jobs:[Job],
    # graphs:[Graph]
     getJobs(name:String):Job
  }
`;


const books = [
    {
        title: 'The dgdfgsdg',
        author: 'Kate Chopin',
    },
    {
        title: 'City of Glass',
        author: 'Paul Auster',
    },
];

const peoples = [
    {
        first: 'Maty',
        last: 'Zisserman',
        myBooks: books,
    },
    {
        first: 'Bar',
        last: 'Zisserman',
        myBooks: books
    },
];


const graph = [
    {
        name: 'first',
        graphObj: {
            root: 'asdadad'
        }
    }

]

const jobs = [
    {
        id: "first",
        pipelineName: "name1",
        graph: graph[0]

    }

]

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        books: () => books,
        peoples: () => peoples,
        jobs: () => jobs,
        // graph: () => graph,
        getJobs: (parent, args, context, info) => {
            console.log(`parent ${parent},args${args},context:${context},info:${info}`)
            return jobs
        }
    },
};



// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
}).catch(err => {
    console.log(err);
});
