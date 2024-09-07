##### Client-side Requirements
```javascript

// data
user_id: int;
jwt: string;
socket: WebSocket;
is_staff: bool;
open_channels: Array<int>;

// functions
send(message, channel_id);
receive(message, channel_id);
retrieve_history(channel_id);
```

##### Server-side requirements
```javascript
// data
clients: Map<string, Client>;

//functions
send_over_channel(message, channel_id);
receive(message, channel_id);
on_disconnect(); // what cleanup needs to happen when a user disconnects?

// could be more specific, filterByActiveChannels
filter_clients(val, predicate); // -> Array<clients>
```
