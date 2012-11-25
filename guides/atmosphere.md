---
layout: default
title: Scalatra Guides | Atmosphere
---

<div class="page-header">
<h1>Atmosphere</h1>
</div>

Scalatra has a built-in integration with 
[Atmosphere](https://github.com/Atmosphere/atmosphere), the asynchronous
websocket/comet framework. Atmosphere allows you to keep a persistent connection
alive between the server and the user's browser (or other user-agents). You can
push new information to your user at any time, without refreshing the page.

Atmosphere can use its own JavaScript libraries to accomplish this, or
it can be set up to use the [socket.io](http://socket.io) toolkit. It's carefree
realtime for the JVM.

### dependency

```scala
TODO: atmo dependency here
```

Basic setup of an Atmosphere-enabled route looks like this:

```scala
class MyAtmoServlet {
  atmosphere("/the-chat") {
    new AtmosphereClient {
      def receive = {
          case Connected =>
          case Disconnected(disconnector, Some(error)) =>
          case Error(Some(error)) =>
          case TextMessage(text) => send("ECHO: " + text)
          case JsonMessage(json) => broadcast(json)
        }
      }
    }
  }
```

Scala pattern matching is used to detect which type of event has occurred, and
the function for each case can be set to do something about the event. For
instance, you might want to broadcast a message to all connected clients when
a new client connects:

```scala
  case Connected =>
    println("Client %s is connected" format uuid)
    broadcast(("author" -> "Someone") ~ 
      ("message" -> "joined the room") ~ 
      ("time" -> (new Date().getTime.toString )), Everyone)
```


