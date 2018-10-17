# Slack-Alike

## Requirements

### For development

- NodeJS 8+
- NPM 6+
- Git
- MongoDB

### For deployment
- Docker
- Consul
- Fabio
- MongoDB
- NodeJS 8+
- NPM 6+
- Git

## Features

- Real-time chat with multiple users in multiple channels
- Chat edit and removal
- Sharing personal information (email, work, timezone)
- Supports modern browsers (Chrome/Safari/Firefox) on desktop, iPad and iPhone
- Horizontal scaling to support a hundred plus users

## Architecture

### Backend

Beside the application code, the solution integrates with a combination of Consul and Fabio to provide zero-config load
balancing and service discovery orchestration.

Application itself is composed of three major components:

1. A client app frontend built with react, redux and server sent event enabled
1. A RestFUL HTTP server to provide services to the frontend component, such as:

    - Listing channels
    - Retrieve user profiles
    - Updating user's profile
    - Receiving in new chat messages, updated message contents and requests to delete existing chat messages
    
1. A server-sent-event connector server to push updates to client app.

Notice that all these components have multiple instances. The same user can open multiple browsers on different hosts,
each browser can communicate with any of the HTTP server instances and receive updates from multiple SSE connectors. In
this setup:

- Docker (Kubernetes, Swarm) acts as the resource monitor to keep resources up and running.
- Consul is the instance registry within one data-center
- Fabio provides zero-config service discovery and load balancing proxy service
- As multiple instances of SSE connector and HTTP server become available, they register themselves with Consul from
which Fabio retrieves meta service tags to perform proper service routing without reloading itself (as in the case of 
nginx).
- On client side, for each tab, as soon as a channel is subscribed to, the previous subscription is aborted if such
exists in order to maintain at maximum one SSE connection per browser tab. SSE connector will discard the aborted
connection.

### Frontend

Built with a unidirectional data flow design in mind, frontend UI elements establish one end of the flow; the other end
is consisted of user action events (click, data input, navigation) and chat events (new chat messages, edits and
removals).

## Data structure

### Persisted data structure

The three primary entity types are Channel, Message and User (Profile)

- Channels make up the topics for chat users. Each channel maintains a list of chatter identifier.
- Messages are not directly embedded into channels but kept as sequential list in a separate collection known as
ChannelChunk. Each chunk expires after 24 hours. No chunk is created if there is no messages on that day.
- Users are our chatters, basically a repository for personal email, timezone, work information. 

### Redux store data structure

1. Auth: authentication data store. Restored on page load via localStorage.
1. Profile: current login profile
1. Channels: a map of channels keyed by channel ID
1. Users: a map of users keyed by user ID
1. Messages: a map of messages keyed by channel ID
1. Routing: react-router-redux reducer store

For performance purpose, redux store is backed by immutableJS. 

## Limitations

- Limited error handling. Most error messages are generic (some are misleading).
- Lack of UI friendliness. No auto scroll to bottom. No busy indicators.
- Can only edit/remove messages within today
- SSE message delivery pushes latest message only, new messages during interruptions are not delivered.
- SSE connection are not authenticated.