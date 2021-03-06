const { ApolloServer, gql } = require('apollo-server');
const { graphqlSync } = require('graphql');
const { Kind } = require('graphql/language')
const { mergeTypeDefs } = require('@graphql-tools/merge');


const jobTypeDefs = gql`

scalar Object

type Results { 
    startTime: Float
    pipeline: String
    status: String
    timestamp: Float
    timeTook: Float
    data: Data 
}

  type Discovery { host: String port: String }



  type Metadata { values: Object }

  type StorageInfo { path: String size: Int }

  type Output { 
      taskId: String
    discovery: Discovery
    metadata: Metadata
    storageInfo: StorageInfo
 }

  type NodeInput { path: String }

  type JobNodes { 
    nodeName: String
    algorithmName: String
    taskId: String
    podName: String
    status: String
    startTime: Float
    endTime: Float
    level: Int
    batch: String
    boards: [String ]
    output: Output
    input: [NodeInput ] }

  type Value { types: [String ] }

  type Edges { from: String to: String value: Value }

  type Graph { jobId: String
    timestamp: Float
    nodes: [JobNodes ]
    edges: [Edges ] }

  type States { succeed: Int }

  type Data { progress: Int details: String states: States }

  type Status { timestamp: Float
    status: String
    level: String
    pipeline: String
    data: Data }

  type LastRunResult { timestamp: Float status: String timeTook: Float }



  type FlowInputMetadata { storageInfo: StorageInfo metadata: Metadata }

  type Cron { enabled: Boolean pattern: String }

  type Triggers { cron: Cron }

  type Options { batchTolerance: Int
    progressVerbosityLevel: String
    ttl: Int }

  type Files { link: String }

  type FlowInput { files: Files }

  type Pipeline { name: String
    experimentName: String
    kind: String
    priority: Int
    startTime: Float
    types: [String ]
    lastRunResult: LastRunResult
    flowInputMetadata: FlowInputMetadata
    triggers: Triggers
    options: Options
    flowInput: FlowInput
    nodes: [JobNodes ] 
}

  type UserPipeline { name: String
    experimentName: String
    triggers: Triggers
    options: Options
    flowInput: FlowInput
    nodes: [JobNodes ] }

  type Jobs { key: String
    results: Results
    graph: Graph
    status: Status
    pipeline: Pipeline
    userPipeline: UserPipeline }

  type AutogeneratedMainType { jobs: [Jobs ] }

  # Types with identical fields:
  # Green FlowInputfileslink

`
const discoveryTypeDefs = gql`

type Pipelinedriver {
     driverId: String
    paused: Boolean
    driverStatus: String
    jobStatus: String
    podName: String }

  type Workers { total: Int stats: [String ] }

  type Labels { 
    betaubernetesioarch: String
    betakubernetesioinstancetype: String
    betakubernetesioos: String
    failuredomainbetakubernetesioregion: String
    failuredomainbetakubernetesiozone: String
    kopsk8sioinstancegroup: String
    kubernetesioarch: String
    kubernetesiohostname: String
    kubernetesioos: String
    kubernetesiorole: String
    noderolekubernetesionode: String
    noderolekubernetesiospotworker: String
    nodekubernetesioinstancetype: String
    ondemand: String
    topologykubernetesioregion: String
    topologykubernetesiozone: String }

  type WorkersTotal { cpu: Int gpu: Int mem: Int }

  type Other { cpu: Float gpu: Int mem: Int }

  type Requests { cpu: Float gpu: Int mem: Int }

  type Total { cpu: Int gpu: Int mem: Float }

  type DiscoveryNodes { name: String
    workers: Workers
    workers2: [String ]
    labels: Labels
    workersTotal: WorkersTotal
    other: Other
    requests: Requests
    total: Total }

  type ResourcePressure { cpu: Float gpu: Int mem: Float }

  type Stats { algorithmName: String count: Int results: Int }

  type Actual { total: Int stats: [Stats ] }

  type TaskExecutor { 
    nodes: [DiscoveryNodes ]
    resourcePressure: ResourcePressure
    actual: Actual 
}

  type StreamingDiscovery { host: String port: Int }

  type Worker { 
    workerStatus: String
    isMaster: Boolean
    workerStartingTime: String
    jobCurrentTime: String
    workerPaused: Boolean
    hotWorker: Boolean
    error: String
    workerId: String
    algorithmName: String
    podName: String
    streamingDiscovery: StreamingDiscovery }

  type Discovery { pipelinedriver: [Pipelinedriver ]
    TaskExecutor: [TaskExecutor ]
    worker: [Worker ] }

  type AutogeneratedMainType { discovery: Discovery }
`
const algorithmTypeDefs = gql`
type Options { debug: Boolean pending: Boolean }

type Commit { id: String timestamp: String message: String }

type GitRepository { gitKind: String
  url: String
  branchName: String
  webUrl: String
  cloneUrl: String
  commit: Commit }

type Algorithms { 
 name: String
  cpu: Int
  created: Float
  entryPoint: String
  env: String
  gpu: Int
  mem: String
  minHotWorkers: Int
  modified: Float
  reservedMemory: String
  type: String
  algorithmImage: String
  version: String
  options: Options
  gitRepository: GitRepository }

type AutogeneratedMainType { algorithms: [Algorithms ] }
`
const pipelineTypeDefs = gql`
type Cron { enabled: Boolean pattern: String }

type Triggers { cron: Cron }

type ConcurrentPipelines { amount: Int rejectOnFailure: Boolean }

type Options { batchTolerance: Int
  ttl: Int
  progressVerbosityLevel: String
  concurrentPipelines: ConcurrentPipelines }

type Metrics { tensorboard: Boolean }

type Retry { policy: String limit: Int }

type PipelineNodes { 
  nodeName: String
  algorithmName: String
  ttl: Int
  includeInResult: Boolean
  batchOperation: String
  metrics: Metrics
  retry: Retry
 # input: [String ]
 }

type FlowInput { mul: Int data: Int }

type Pipelines { modified: Float
  kind: String
  name: String
  priority: Int
  experimentName: String
  triggers: Triggers
  options: Options
  nodes: [PipelineNodes ]
  flowInput: FlowInput }

type AutogeneratedMainType { pipelines: [Pipelines ] }
`
const experimentTypeDefs = gql`
type Experiments {
     name: String 
     description: String
      created: Int 
    }

type AutogeneratedMainType { 
    experiments: [Experiments ]
 }
`
const nodeStatisticTypeDefs = gql` 
type AlgorithmsData { name: String amount: Int size: Float }

type Results { name: String algorithmsData: [AlgorithmsData ] }

type NodeStatistics { metric: String
  legend: [String ]
  results: [Results ] }
`
const diskSpaceTypeDefs = gql`
type DiskSpace { size: Int free: Int }
`
const pipelineStatsTypeDefs = gql`
type Stats { status: String count: Int }
type PipelinesStats { name: String stats: [Stats ] }
`
const dataSourcesTypeDefs = gql`

type DataSources { 
    versionDescription: String
    name: String
    filesCount: Int
    avgFileSize: Float
    totalSize: Int
    id: String
    fileTypes: [String ]
 }
`
const algorithmBuildsTypeDefs = gql`
type Result { data: String warnings: String errors: String }

type Commit { id: String timestamp: String message: String }

type GitRepository { gitKind: String
  url: String
  branchName: String
  webUrl: String
  cloneUrl: String
  commit: Commit }

type Options { debug: Boolean pending: Boolean }

type Algorithm { name: String
  cpu: Int
  gpu: Int
  mem: String
  reservedMemory: String
  minHotWorkers: Int
  env: String
  entryPoint: String
  type: String
  options: Options
  gitRepository: GitRepository }


"algorithmBuilds is a list of AlgorithmBuilds"
type AlgorithmBuild {
    "algorithmBuilds is a list of AlgorithmBuilds"
     buildId: String
  imageTag: String
  env: String
  algorithmName: String
  type: String
  status: String
  progress: Int
  error: String
  trace: String
  endTime: Float
  startTime: Float
  timestamp: Float
  algorithmImage: String
  buildMode: String
  result: Result
  gitRepository: GitRepository
  algorithm: Algorithm
 }
 `

const SubscriptionIncNumbersTypeDefs = gql`
type Subscription {
    numberIncremented: Int
  }
  `


const Query = gql`  
type Query {
    currentNumber: Int
    jobs: [Jobs]
    job(id: String!): Jobs
    jobsByExperimentName(experimentName: String!): [Jobs]
    algorithms:[Algorithms]
    algorithmsByName(name: String): Algorithms
    pipelines:[Pipelines]
    algorithmBuilds:[AlgorithmBuild]
    experiments:[Experiments]
    nodeStatistics:[NodeStatistics]
    dataSources:[DataSources]
    pipelineStats:[PipelinesStats]  
  }  
  `
const Subscription = gql`
type Subscription {
    numberIncremented: Int
    numberIncrementedOdd(number: Int): Int
  }

  
  `


const types = [

    dataSourcesTypeDefs,
    algorithmBuildsTypeDefs,
    jobTypeDefs,
    algorithmTypeDefs,
    pipelineTypeDefs,
    experimentTypeDefs,
    nodeStatisticTypeDefs,
    diskSpaceTypeDefs,
    pipelineStatsTypeDefs,
    SubscriptionIncNumbersTypeDefs,
    Query,
    Subscription
];







module.exports = types;