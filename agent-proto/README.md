# Agent gRPC Scaffold

gRPC scaffold for inter-agent communication.

## Quick Start

### Run the Server
```bash
npm start
# or with Docker
docker-compose up -d
```

### Run the Client
```bash
npm run client
# or with Docker
docker-compose --profile test up agent-client
```

## Proto Definition

Located at: `agent.proto`

### Messages
- **AgentMessage**: Inter-agent message with sender/receiver, type, payload
- **TaskRequest**: Task submission with parameters and deadline
- **TaskResponse**: Task result with status and result data
- **StreamMessage**: Bidirectional streaming message

### Services
| Method | Type | Description |
|--------|------|-------------|
| SendMessage | Unary | Send a single message |
| SubmitTask | Unary | Submit task and get response |
| StreamMessages | Bidirectional | Continuous streaming |
| StreamTaskUpdates | Server Streaming | Task progress updates |
| HealthCheck | Unary | Health monitoring |

## Docker

```bash
# Build and run server
docker build -t agent-grpc .
docker run -p 50051:50051 agent-grpc

# Or use docker-compose
docker-compose up -d
```

## Environment Variables

- `PORT`: Server port (default: 50051)
- `TARGET`: Client target address (default: localhost:50051)

## Example Usage

```javascript
const client = new proto.AgentService('localhost:50051', grpc.credentials.createInsecure());

// Send a message
client.sendMessage({
  id: 'msg-1',
  sender_id: 'agent-001',
  receiver_id: 'agent-002',
  type: proto.MessageType.MESSAGE_TYPE_REQUEST,
  payload: Buffer.from('Hello'),
}, callback);

// Submit a task
client.submitTask({
  task_id: 'task-1',
  agent_id: 'agent-001',
  description: 'Process data',
}, callback);

// Stream task updates
const stream = client.streamTaskUpdates({ task_id: 'task-1' });
stream.on('data', (update) => console.log(update));
```
