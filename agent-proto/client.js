/**
 * gRPC Agent Client - Example implementation
 * 
 * Run: node client.js
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

const TARGET = process.env.TARGET || 'localhost:50051';

function main() {
  const client = new proto.AgentService(TARGET, grpc.credentials.createInsecure());
  
  // Test 1: SendMessage
  console.log('\n--- Test 1: SendMessage ---');
  client.sendMessage({
    id: 'msg-' + Date.now(),
    sender_id: 'agent-001',
    receiver_id: 'agent-002',
    type: proto.MessageType.MESSAGE_TYPE_REQUEST,
    payload: Buffer.from('Hello from agent 001'),
    timestamp: Date.now() * 1000,
    metadata: { source: 'client' },
  }, (err, response) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Response:', JSON.stringify(response, null, 2));
    }
    
    // Test 2: SubmitTask
    console.log('\n--- Test 2: SubmitTask ---');
    client.submitTask({
      task_id: 'task-' + Date.now(),
      agent_id: 'agent-001',
      description: 'Process data',
      parameters: { data: 'sample' },
      priority: 1,
      deadline: Date.now() * 1000 + 3600,
    }, (err, response) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Response:', JSON.stringify(response, null, 2));
      }
      
      // Test 3: HealthCheck
      console.log('\n--- Test 3: HealthCheck ---');
      client.healthCheck({ agent_id: 'agent-001' }, (err, response) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('Response:', JSON.stringify(response, null, 2));
        }
        
        // Test 4: StreamTaskUpdates
        console.log('\n--- Test 4: StreamTaskUpdates ---');
        const stream = client.streamTaskUpdates({
          task_id: 'task-stream-' + Date.now(),
          agent_id: 'agent-001',
          description: 'Long running task',
          parameters: {},
          priority: 0,
          deadline: 0,
        });
        
        stream.on('data', (response) => {
          console.log('Update:', JSON.stringify(response, null, 2));
        });
        
        stream.on('end', () => {
          console.log('Stream ended');
          
          // Test 5: Bidirectional Stream
          console.log('\n--- Test 5: Bidirectional Stream ---');
          const bidirectionalStream = client.streamMessages();
          
          let messageCount = 0;
          const maxMessages = 3;
          
          const sendMessage = () => {
            if (messageCount >= maxMessages) {
              bidirectionalStream.end();
              return;
            }
            
            messageCount++;
            console.log(`Sending message ${messageCount}`);
            
            bidirectionalStream.write({
              stream_id: 'stream-' + Date.now(),
              agent_id: 'agent-001',
              data: Buffer.from(`Message ${messageCount}`),
              is_final: messageCount === maxMessages,
            });
          };
          
          bidirectionalStream.on('data', (response) => {
            console.log('Received:', response.data.toString());
            setTimeout(sendMessage, 500);
          });
          
          bidirectionalStream.on('end', () => {
            console.log('All tests completed!');
            process.exit(0);
          });
          
          // Start sending messages
          setTimeout(sendMessage, 500);
        });
      });
    });
  });
}

main();
