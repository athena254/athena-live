/**
 * gRPC Agent Server - Example implementation
 * 
 * Run: node server.js
 */

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'agent.proto');

// Load the proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition).agent;

// In-memory storage for agents and tasks
const agents = new Map();
const tasks = new Map();

// Server implementation
const agentService = {
  // Send a single message
  sendMessage: (call, callback) => {
    const message = call.request;
    console.log(`[Server] Received message: ${message.id} from ${message.sender_id} to ${message.receiver_id}`);
    
    // Echo back with server timestamp
    message.timestamp = Date.now() * 1000; // nanoseconds
    callback(null, message);
  },

  // Submit a task
  submitTask: (call, callback) => {
    const request = call.request;
    console.log(`[Server] Task submitted: ${request.task_id} by agent ${request.agent_id}`);
    
    // Simulate task processing
    const taskResponse = {
      task_id: request.task_id,
      agent_id: request.agent_id,
      status: proto.TaskStatus.TASK_STATUS_COMPLETED,
      result: Buffer.from(JSON.stringify({ message: 'Task processed successfully' })),
      error_message: '',
      completed_at: Date.now() * 1000,
    };
    
    callback(null, taskResponse);
  },

  // Bidirectional streaming
  streamMessages: (call) => {
    console.log('[Server] Client connected to stream');
    
    call.on('data', (streamMessage) => {
      console.log(`[Server] Stream message: ${streamMessage.stream_id} from ${streamMessage.agent_id}`);
      
      // Echo back the message
      call.write({
        stream_id: streamMessage.stream_id,
        agent_id: 'server',
        data: streamMessage.data,
        is_final: streamMessage.is_final,
      });
      
      if (streamMessage.is_final) {
        console.log('[Server] Stream completed');
        call.end();
      }
    });
    
    call.on('end', () => {
      console.log('[Server] Stream ended by client');
    });
  },

  // Server-side streaming for task updates
  streamTaskUpdates: (call) => {
    const request = call.request;
    console.log(`[Server] Streaming task updates for: ${request.task_id}`);
    
    // Send initial status
    call.write({
      task_id: request.task_id,
      agent_id: request.agent_id,
      status: proto.TaskStatus.TASK_STATUS_RUNNING,
      result: Buffer.from(''),
      error_message: '',
      completed_at: 0,
    });
    
    // Simulate progress updates
    setTimeout(() => {
      call.write({
        task_id: request.task_id,
        agent_id: request.agent_id,
        status: proto.TaskStatus.TASK_STATUS_COMPLETED,
        result: Buffer.from(JSON.stringify({ progress: 100, message: 'Done!' })),
        error_message: '',
        completed_at: Date.now() * 1000,
      });
      call.end();
    }, 2000);
  },

  // Health check
  healthCheck: (call, callback) => {
    const request = call.request;
    console.log(`[Server] Health check for agent: ${request.agent_id}`);
    
    callback(null, {
      agent_id: request.agent_id || 'unknown',
      healthy: true,
      status: 'OK',
      last_heartbeat: Date.now() * 1000,
    });
  },
};

function main() {
  const server = new grpc.Server();
  
  server.addService(proto.AgentService.service, agentService);
  
  const port = process.env.PORT || '50051';
  const address = `0.0.0.0:${port}`;
  
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Server failed to start:', err);
      return;
    }
    
    console.log(`[Server] Agent gRPC Server running on port ${port}`);
    console.log(`[Server] Endpoints:`);
    console.log(`  - SendMessage`);
    console.log(`  - SubmitTask`);
    console.log(`  - StreamMessages (bidirectional)`);
    console.log(`  - StreamTaskUpdates (server streaming)`);
    console.log(`  - HealthCheck`);
  });
}

main();
