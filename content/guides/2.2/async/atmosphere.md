---
aliases:
  - /2.2/guides/async/atmosphere.html
title: Atmosphere
---

Scalatra has a built-in integration with
[Atmosphere](https://github.com/Atmosphere/atmosphere), the asynchronous
websocket/comet framework. Atmosphere allows you to keep a persistent
connection alive between the server and the user's browser (or other
user-agents). You can push new information to your user at any time,
without a page refresh.

---

### Atmosphere example app

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="https://github.com/scalatra/scalatra-website-examples/tree/master/2.2/async/scalatra-atmosphere-example">scalatra-atmosphere-example</a>
  for a minimal and standalone project containing the example in this guide.
</div>

#### Generating the app

Generate a project using `g8 scalatra/scalatra-sbt`, and call your
initial servlet `ChatController`.

You'll need to do a few things to a default Scalatra project in order
to get it ready for use with Atmosphere.

#### Dependencies

The following dependencies will be needed to make the sample application
work.

```scala
"org.scalatra" %% "scalatra-atmosphere" % "{{< 2-2-scalatra_version >}}",
"org.scalatra" %% "scalatra-json" % "{{< 2-2-scalatra_version >}}",
"org.json4s"   %% "json4s-jackson" % "{{< 2-2-json4s_version >}}",
"org.eclipse.jetty" % "jetty-websocket" % "{{< 2-2-jetty-version >}}" % "container",
```

{{ .Site.Params.highlist_css }}

Scalatra's Atmosphere integration depends on Akka.

You'll need to add the TypeSafe sbt resolver in order to get the
Akka 2.0.x dependency, so make sure you've got this in `project/build.scala`:

```scala
resolvers += "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/"
```

#### Imports

Your imports should look like this:

```scala
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


import scala.concurrent._
import ExecutionContext.Implicits.global
```

#### Writing the ChatController

The basic setup of an Atmosphere-enabled servlet and route looks like
this:

```scala
class ChatController extends ScalatraServlet
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

Inside the `atmosphere` route, you instantiate a `new AtmosphereClient`
and define a `receive` method, which listens for events.

One AtmosphereClient is instantiated per connected user. It's worth
taking a look at the
[ScalaDocs](http://scalatra.org/2.2/api/#org.scalatra.atmosphere.AtmosphereClient) and [source](https://github.com/scalatra/scalatra/blob/develop/atmosphere/src/main/scala/org/scalatra/atmosphere/AtmosphereClient.scala) for AtmosphereClient to see what it can do.

As you can see, there are quite a few kinds of events which Scalatra's
atmosphere integration can deal with:

 * `Connected`
 * `Disconnected`
 * `Error`
 * `TextMessage`
 * `JsonMessage`

Scala pattern matching is used to detect which type of event has
occurred, and the function for each case can be set to do something
about the event. For instance, you might want to broadcast a message
to all connected clients when a new client connects:

```scala
  case Connected =>
```

You can notify clients with an implementation like this:

```scala
  case Connected =>
    println("Client %s is connected" format uuid)
    broadcast(("author" -> "Someone") ~ ("message" -> "joined the room") ~ ("time" -> (new Date().getTime.toString )), Everyone)
```

The `uuid` in that code comes from the AtmosphereClient instance - each
connected user gets its own client with a unique identifier, and
Scalatra keeps a list of atmosphere clients which are connected to
a given `atmosphere` route.

Let's see sample code for all of the Atmosphere event types:

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

The `~` operator is used quite a bit there. It's a JSON operator which
turns `("name" -> "joe") ~ ("age" -> 35)` into `{"name":"joe","age":35}`.

That's pretty much it on the server side.

#### JavaScript client

Browser clients can connect to the `atmosphere` route using a JavaScript
client.

Atmosphere has its own connection library, which will assess the browser client
it's hosted in and figure out which of the available transport types will work, falling back as necessary to maintain connectivity in a wide range of
possible clients.

You're strongly advised to read Atmosphere's
[extensive documentation](https://github.com/Atmosphere/atmosphere/wiki/jQuery.atmosphere.js-API)
in order to understand your connection options.

Besides the basic connectivity provided by the Atmosphere connector,
you'll need to provide your own application-specific logic, also in
JavaScript. Here's an `application.js` file for our chat application:

[https://github.com/scalatra/scalatra-website-examples/blob/master/2.2/async/scalatra-atmosphere-example/src/main/webapp/js/application.js](https://github.com/scalatra/scalatra-website-examples/blob/master/2.2/async/scalatra-atmosphere-example/src/main/webapp/js/application.js)

Drop that code into `webapp/js/atmosphere.js`, and put the
[Atmosphere JavaScript client](https://github.com/scalatra/scalatra-website-examples/blob/master/2.2/async/scalatra-atmosphere-example/src/main/webapp/js/jquery-atmosphere.js)
alongside it, and you've got a working client implementation.

A few key points in `application.js`.

The first part of the code demonstrates the detection of available
capabilities in the user's browser. It loops through an array of
available transports and checks each one to see if it's supported,
then outputs what it finds into the page.

The code then makes an initial request to our `atmosphere` route at
`atmosphere("/the-chat")`, and sets up callbacks for `onOpen`,
`onLocalMessage`, `onTransportFailure`, `onReconnect`, `onMessage`,
`onClose`, and `onError` events. Check the Atmosphere docs to see
what each of these mean.

Lastly, there's a simple key-press detection which sends a chat
message to the server whenever the `enter` key is pressed.

With all of this in place, you can add a few [Scalate views](https://github.com/scalatra/scalatra-website-examples/tree/master/2.2/async/scalatra-atmosphere-example/src/main/webapp/WEB-INF)
to your chat application and it's all done. The example application has
a default layout and action which will serve up a browser-based chat
client.

You should be able to connect to it from any browser which supports
JavaScript. Try opening several different browsers (e.g. Firefox and
Chrome) and signing in as different users, then chat to each other by
going to [http://localhost:8080/](http://localhost:8080/) and hitting
the running application. You can also open multiple tabs in the
same browser to see Atmosphere detect multiple local instances and use
its `onLocalMessage` handler.

### Segmenting message delivery

You can easily decide which connected clients you'd like to send a given
message to.

By default, the AtmosphereClient's `broadcast` method mimics standard
chat server functionality - calling `broadcast(message)` sends the
supplied message to all connected users except the current one.

The `send(message)` method does exactly the opposite: it sends the
message to only the current client.

The AtmosphereClient implements several default filters so that it can
decide which clients should receive a message:

```scala
  final protected def SkipSelf: ClientFilter = _.uuid != uuid
  final protected def OnlySelf: ClientFilter = _.uuid == uuid
  final protected val Everyone: ClientFilter = _ => true
```

If you need to segment message delivery further than this, for example
in order to enforce security rules, you can subclass AtmosphereClient
and implement your own ClientFilters:

```scala
class SecureClient extends AtmosphereClient {

  // adminUuids is a collection of uuids for admin users. You'd need to
  // add each admin user's uuid to the list at connection time.
  final protected def OnlyAdmins: ClientFilter = adminUuids.contains(_.uuid)

  /**
   * Broadcast a message to admin users only.
   */
  def adminBroadcast(msg) {
    broadcast(msg, OnlyAdmins)
  }
}
```

You could then use `SecureClient` in your `atmosphere` route instead of
the default `AtmosphereClient`:

```scala
atmosphere("/the-chat") {
  new SecureClient {
    // your events would go here.
  }
}
```

### Cleaning up the case statements

This subclassing approach is also an excellent way to clean up the code
in your pattern matching blocks. If it starts getting out of hand, you
can put whatever methods you need in your AtmosphereClient subclass and
end up with something like this:

```scala
class MyClient extends AtmosphereClient {

  def broadcastMessage(json: String) {
    println("Got message %s from %s".format((json \ "message").extract[String], (json \ "author").extract[String]))
    val msg = json merge (("time" -> (new Date().getTime().toString)): JValue)
    broadcast(msg)
  }

}
```

And you'd use it like this:

```scala
atmosphere("/the-chat") {
  new MyClient {
    def receive = {
      // Let's use our new broadcastMessage function from MyClient:
      case JsonMessage(json) => broadcastMessage(json)

      // ... implement other message types
    }
  }
}
```

### Broadcasting server-side events

Atmosphere event sources don't necessarily need to be other Atmosphere
connections.

You could, for instance, use an AMQP message queue to
broadcast events to connected browser clients whenever your application receives
a given message type. You could broadcast messages to all connected clients, or
to a selected group of clients, when a database record was updated, or when a
user's friend logged in.

Each Scalatra servlet that registers an Atmosphere route gets access to an
AtmosphereClient object, which can act as a broadcaster.

So if you have a servlet that has 3 Atmosphere routes, and it's mounted
at `/real-time-buzz`, you can send messages to all connected clients
with `AtmosphereClient.broadcast("/real-time-buzz/fizz", message)`, where
`atmosphere("/fizz")` is one of the available routes.

Alternately, you can send to all the connected clients of all 3 endpoints in the
`/real-time-buzz` servlet `AtmosphereClient.broadcast("/real-time-buzz", message)`.

Lastly, you can send a message to all connected clients in all Atmosphere servlets
with `AtmosphereClient.broadcastAll(message)`.

### Pattern matching on Atmosphere messages

It's possible (and in fact encouraged) to do sophisticated pattern matching
on Atmosphere message types in order to simplify your application code.

This gives you a very flat and extensible way of dealing with many messages
without having to serialize them into actual model classes.

```scala
case JsonMessage(JObject(JField("type", JString("event_1")) :: fields) =>
case JsonMessage(args @ JObject(JField("type", JString("event_1")) :: fields) =>
```

### Wire formats

Data travelling between the browser and the websocket server needs to be in a
defined transport format, called a wire format, before it reaches the Atmosphere
client.

You can define your own wire formats by extending the
[WireFormat](https://github.com/scalatra/scalatra/blob/develop/atmosphere/src/main/scala/org/scalatra/atmosphere/wire_format.scala)
trait. To create a new wire format, extend WireFormat and implement its methods
in your subclass.
