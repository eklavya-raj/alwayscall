# OpenAI Realtime

With the OpenAI Realtime integration, you can have AI agents join calls running on Stream edge infrastructure. The integration uses WebRTC for both agent and users and guarantees the best quality in poor conditions.

Make sure to check our OpenAI Realtime integration [tutorials](https://getstream.io/video/voice-agents/#tutorials) to get an initial working setup with AI.

### Quickstart

This is what an integration with OpenAI looks like: on your backend you use one of the Stream SDKs and have OpenAI join a call hosted on Stream. After that you can directly use the OpenAI Realtime API to handle events and pass instructions to the AI agent.

### Connecting an AI Agent

The following example shows how to connect an AI agent to your Stream application:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```javascript
// Initialize the SDK with API credentials
const { StreamClient } = require("@stream-io/node-sdk");

const streamClient = new StreamClient("your-api-key", "your-api-secret");

// Create a call object
const call = streamClient.video.call("default", "call-id");

// Connect the OpenAI agent to the call
const openAiApiKey = "your-openai-api-key";

const realtimeClient = await streamClient.video.connectOpenAi({
  call,
  openAiApiKey,
  agentUserId: "lucy",
  model: "gpt-4o-realtime-preview",
});

// Update the session with instructions for the AI agent
realtimeClient.updateSession({
  instructions:
    "You are a helpful assistant that can answer questions and help with tasks.",
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```python
# Make sure you have the Stream package with OpenAI integration installed:
# uv add "getstream[webrtc]" getstream-plugins-openai --prerelease=allow

from getstream import Stream
from getstream.plugins.openai.sts import OpenAIRealtime

# Initialize the SDK with API credentials
client = Stream(
    api_key="your-api-key",
    api_secret="your-api-secret"
)

# Create a bot user
bot_user_id = "1234"
client.upsert_users(bot_user_id, "OpenAI Realtime Speech to Speech Bot")

# Create a call object
call = client.video.call("default", "call-id")
call.get_or_create(data={"created_by_id": bot_user_id})


# Initialize the OpenAI Realtime plugin
sts_bot = OpenAIRealtime(
    api_key="your-openai-api-key",
    model="openai_realtime_model_to_use",
    instructions="You are a friendly assistant; reply verbally in a short sentence.",
)

# Use an async context manager to handle the connection
async with await sts_bot.connect(call, agent_user_id=bot_user_id) as connection:
    # Listen for events here (see below)
```

</tabs-item>

<tabs-item value="go" label="Go">

```go
// OpenAI agent connection for Go SDK coming soon, reach out to support if you want to know more
```

</tabs-item>

<tabs-item value="java" label="Java">

```java
// OpenAI agent connection for Java SDK coming soon, reach out to support if you want to know more
```

</tabs-item>

</tabs>

A full sample Node.js integration project is available on GitHub [here](https://github.com/GetStream/openai-tutorial-node).

A [full sample Python integration project](https://github.com/GetStream/stream-py/tree/webrtc/examples/openai_realtime_speech_to_speech) is available on GitHub as well.

### AI Agent Configuration

The `getstream.plugins.openai.sts.OpenAIRealtime.connect` method (Python) / `connectOpenAI` method (Node.js) returns an instance of `RealtimeClient` from the [OpenAI Realtime API](https://github.com/openai/openai-realtime-api-beta). The following example demonstrates how to:

- Change the AI agent's voice
- Pass custom instructions
- Add a function tool for submitting support tickets
- Send an item and trigger a generation

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```javascript
// After connecting the OpenAI agent as shown above
const realtimeClient = await streamClient.video.connectOpenAi({
  call,
  openAiApiKey,
  agentUserId: "support-agent",
});

// Change the voice to 'alloy'
realtimeClient.updateSession({ voice: "alloy" });

// Set detailed instructions for the AI agent
realtimeClient.updateSession({
  instructions: `You are a friendly customer support agent named Nova. 
  Help customers with questions and create support tickets when needed.`,
});

// Add a function tool for submitting support tickets
realtimeClient.addTool(
  {
    name: "submit_support_ticket",
    description: "Creates a support ticket in the customer service system",
    parameters: {
      type: "object",
      properties: {
        customer_name: {
          type: "string",
          description: "Customer name",
        },
        email: {
          type: "string",
          description: "Customer email",
        },
        issue: {
          type: "string",
          description: "Issue description",
        },
      },
      required: ["customer_name", "email", "issue"],
    },
  },
  async ({ customer_name, email, issue }) => {
    // Call your ticketing system API
    const result = await createTicketInSystem(customer_name, email, issue);
    return { success: true, ticket_id: result.id };
  },
);

// Send a message to trigger a generation
realtimeClient.sendUserMessageContent([
  { type: "input_text", text: "How are you?" },
]);
```

</tabs-item>

<tabs-item value="py" label="Python">

```python
# After connecting the OpenAI Realtime client to the call as shown above:

# Use an async context manager to handle the connection
async with await sts_bot.connect(call, agent_user_id=bot_user_id) as connection:
    # Define a tool to use (you need to make the submit_support_ticket function yourself!)
    tools = [
        {
            "type": "function",
            "name": "submit_support_ticket",
            "description": "Creates a support ticket in the customer service system",
            "parameters": {
              "type": "object",
              "properties": {
                "customer_name": {
                  "type": "string",
                  "description": "Customer name"
                },
                "email": {
                  "type": "string",
                  "description": "Customer email"
                },
                "issue": {
                  "type": "string",
                  "description": "Issue description"
                },
              },
              "required": ["customer_name", "email", "issue"],
            },
        }
    ]

    # Update the session with the tools, change the voice and add detailed instructions
    await sts_bot.update_session(
        voice="alloy",
        tools=tools,
        instructions="""You are a friendly customer support agent named Nova.
        Help customers with questions and create tickets when needed."""
    )

    # Send a message to the API to trigger speech
    await sts_bot.send_user_message("How are you today?")
```

</tabs-item>

</tabs>

### OpenAI events

The OpenAI Realtime API provides an event system that allows you to handle various events during conversations. When using the Stream SDK with OpenAI integration, you have access to the events from the [OpenAI Realtime API](https://github.com/openai/openai-realtime-api-beta#client-events).

#### Handling Events

Here are some basic examples of handling events:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```javascript
realtimeClient.on("conversation.updated", (event) => {
  console.log(`received conversation.updated`, event);
});

realtimeClient.on("conversation.item.completed", ({ item }) => {
  console.log(`received conversation.item.completed`, event);
});

realtimeClient.on("error", (error) => {
  console.log(`received error`, event);
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```python
 async with await sts_bot.connect(call, agent_user_id=bot_user_id) as connection:
    # Process events using an async iterator
    async for event in connection:
        # Handle different event types
        if event.type == "conversation.updated":
            print(f"conversation.updated: {event}")

        elif event.type == "conversation.item.completed":
            print(f"conversation.item.completed: {event}")

        elif event.response.output[0].type == "function_call" and event.response.output[0].name == "submit_support_ticket":
            # Call your function to submit a support ticket
            result = await submit_support_ticket()

            # Return the response to the Realtime API
            await sts_bot.send_function_call_output(tool_call_id, result)

            # Ask the Realtime API to respond appropriately now the call is complete
            await sts_bot.request_assistant_response()

        elif event.type == "error":
            print(f"error: {event}")
```

</tabs-item>

</tabs>

#### Sending Events

You can also send events to OpenAI. The full list of events is available in the [OpenAI Realtime API documentation](https://github.com/openai/openai-realtime-api-beta).

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```javascript
// Send a text message from the user
realtimeClient.sendUserMessageContent([
  { type: "input_text", text: "What can you help me with today?" },
]);
```

</tabs-item>

<tabs-item value="py" label="Python">

```python
# Inside an async function with an active connection:
# Send a text message from the user that the AI will respond to
await sts_bot.send_user_message("What can you help me with today?")
```

</tabs-item>

</tabs>

### Stream Video Events

In addition to OpenAI events, the realtime client also receives events from Stream Video. This allows you to handle both AI-related events and video call events in the same event loop.

The following Stream Video events are available in the realtime client:

- [call.session_participant_joined](/video/docs/api/webhooks/events/#CallSessionParticipantJoinedEvent) - Triggered when a participant joins the call
- [call.session_participant_left](/video/docs/api/webhooks/events/#CallSessionParticipantLeftEvent) - Triggered when a participant leaves the call
- [custom](/video/docs/api/webhooks/events/#CustomEvent) - Custom events that can be sent by participants
- [call.reaction_new](/video/docs/api/webhooks/events/#CallReactionEvent) - Triggered when a participant sends a reaction
- [call.session_ended](/video/docs/api/webhooks/events/#CallSessionEndedEvent) - Triggered when the call session ends
- [call.ended](/video/docs/api/webhooks/events/#CallEndedEvent) - Triggered when the call ends

You can handle these events in the same event loop as OpenAI events:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```javascript
// Listen for Stream Video events
realtimeClient.on("call.session_participant_joined", (event) => {
  console.log(`Participant joined: ${event.participant.user_id}`);
});

realtimeClient.on("call.session_participant_left", (event) => {
  console.log(`Participant left: ${event.participant.user_id}`);
});

realtimeClient.on("call.ended", (event) => {
  console.log("Call ended, disconnecting...");
  // Clean up resources
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```python
 async with await sts_bot.connect(call, agent_user_id=bot_user_id) as connection:
    # Process events using an async iterator
    async for event in connection:
        # Handle OpenAI Realtime events here
        ...

        # Handle Stream Video events
        if event.type == "call.session_participant_joined":
            participant = getattr(event, "participant", {})
            user_id = getattr(participant, "user_id", "unknown")
            print(f"Participant joined: {user_id}")

        elif event.type == "call.session_participant_left":
            participant = getattr(event, "participant", {})
            user_id = getattr(participant, "user_id", "unknown")
            print(f"Participant left: {user_id}")
            break

        elif event.type == "error":
            print(f"error: {event}")
```

</tabs-item>

</tabs>


---

This page was last updated at 2026-04-17T17:34:03.137Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ai-integration/openai-realtime/](https://getstream.io/video/docs/react-native/ai-integration/openai-realtime/).