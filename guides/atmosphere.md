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
alive between the server and the user's browser (or other user-agents). 
You can push new information to your user at any time, without 
refreshing the page.

Atmosphere can use its own JavaScript libraries to accomplish this, or
it can be set up to use the [socket.io](http://socket.io) toolkit. 

It's carefree realtime for the JVM.

### dependency

```scala
  "org.scalatra" % "scalatra-atmosphere" % "2.2.0-SNAPSHOT",
  "org.scalatra" % "scalatra-json" % "2.2.0-SNAPSHOT",
  "org.json4s"   %% "json4s-jackson" % "3.0.0",
```

*TODO*: Check with casualjim. Is this the smallest dependency graph 
needed (are the json libraries necessary)?

You'll need to add the TypeSafe sbt resolver in order to get the
Akka 2.0.x dependency, so drop this into the bottom of build.sbt:

```scala
resolvers += "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/"
```

### imports

Your imports should look like this:

```
// Default imports from a stock Scalatra g8 code generator:
import org.scalatra._
import scalate.ScalateSupport

// Project-specific imports
import org.scalatra.atmosphere._
import org.scalatra.json.{JValueResult, JacksonJsonSupport}
import org.json4s._
import JsonDSL._
import java.util.Date
import java.text.SimpleDateFormat
```

Basic setup of an Atmosphere-enabled route looks like this:

```scala
class NotificationsController extends ScalatraServlet 
  with ScalateSupport with JValueResult 
  with JacksonJsonSupport with SessionSupport 
  with AtmosphereSupport {

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

The AtmosphereSupport trait adds a new kind of route matcher to your
controller, sitting alongside the regular HTTP `get`, `put`, 
`post`, `delete` and friends: you've now got an `atmosphere` route type,
which can be used to bind persistent socket connections to your 
application.

As you can see, there are quite a few kinds of events which Scalatra's 
atmosphere integration can deal with. 

*TODO: is there a full list of these?*

Scala pattern matching is used to detect which type of event has 
occurred, and the function for each case can be set to do something 
about the event. For instance, you might want to broadcast a message 
to all connected clients when a new client connects:

```scala
  case Connected => 
```

And you could notify clients with an implementation like this:

```scala
  case Connected => 
    println("Client %s is connected" format uuid)
    broadcast(("author" -> "Someone") ~ ("message" -> "joined the room") ~ ("time" -> (new Date().getTime.toString )), Everyone)
```

*TODO:* Where did `uuid` come from?

*TODO:* what does `broadcast` mean? Is it "send a message to everybody except the sender?"

*TODO:* list all available socket-related methods. In the example code,
we can see `broadcast()` and `send()`. Are there any others?

*TODO:* what would be necessary to make the compiler happy if I wanted
to pull this implementation code:

```scala
    println("Client %s is connected" format uuid)
    broadcast(("author" -> "Someone") ~ ("message" -> "joined the room") ~ ("time" -> (new Date().getTime.toString )), Everyone)
```
Out into its own `notifyConnect(uuid: String)` method, so that the
pattern match looked like this?

```scala
case Connected => notifyConnect(uuid)
```

Let's see sample code for our Atmosphere events:

```scala
atmosphere("/the-chat") {
    new AtmosphereClient {
      def receive: AtmoReceive = {
        case Connected =>
          println("Client %s is connected" format uuid)
          broadcast(("author" -> "Someone") ~ ("message" -> "joined the room") ~ ("time" -> (new Date().getTime.toString )), Everyone)

        case Disconnected(ClientDisconnected, _) =>
          broadcast(("author" -> "Someone") ~ ("message" -> "has left the room") ~ ("time" -> (new Date().getTime.toString )), Everyone)

        case Disconnected(ServerDisconnected, _) =>
          println("Server disconnected the client %s" format uuid)
        case _: TextMessage =>
          send(("author" -> "system") ~ ("message" -> "Only json is allowed") ~ ("time" -> (new Date().getTime.toString )))

        case JsonMessage(json) =>
          println("Got message %s from %s".format((json \ "message").extract[String], (json \ "author").extract[String]))
          val msg = json merge (("time" -> (new Date().getTime().toString)): JValue)
          broadcast(msg) // by default a broadcast is to everyone but self
          //  send(msg) // also send to the sender
      }
    }
  }

  error {
    case t: Throwable => t.printStackTrace()
  }
```

*TODO:* somebody give me a good explanation of the `~` operator in the
above code. 

