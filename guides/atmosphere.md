---
layout: default
title: Scalatra Guides | Atmosphere
---

<div class="page-header">
<h1>Atmosphere</h1>
</div>

Scalatra has a built-in integration with 
[Atmosphere](https://github.com/Atmosphere/atmosphere), the asynchronous
websocket/comet framework. Atmosphere allows you to keep a persistent
connection alive between the server and the user's browser (or other 
user-agents). You can push new information to your user at any time, 
without refreshing the page.

Atmosphere can use its own JavaScript libraries to accomplish this, or
it can be set up to use the [socket.io](http://socket.io) toolkit. 

It's carefree realtime for the JVM.

### Sample code

In this Guide, we'll build a fairly simple chat example. A finished
example of this application is available at 
[https://github.com/futurechimp/scalatra-atmosphere-example](https://github.com/futurechimp/scalatra-atmosphere-example)

### Getting started

Generate a project using `g8 scalatra/scalatra-sbt`, and call your
initial servlet `ChatController`.

You'll need to do a few things to a default Scalatra project in order
to get it ready for use with Atmosphere.

First, open up your `web.xml` file. You'll see it's got a listener set:

```xml
<listener>
  <listener-class>org.scalatra.servlet.ScalatraListener</listener-class>
</listener>
```

You'll need to change the default listener so it uses an 
Atmosphere-aware one:

```xml
<listener>
  <listener-class>org.scalatra.atmosphere.ScalatraAtmosphereListener</listener-class>
</listener>  
```

#### dependencies

The following dependencies will be needed to make the sample application
work.

```scala
  "org.scalatra" % "scalatra-atmosphere" % "2.2.0-SNAPSHOT",
  "org.scalatra" % "scalatra-json" % "2.2.0-SNAPSHOT",
  "org.json4s"   %% "json4s-jackson" % "3.0.0",
  "org.eclipse.jetty" % "jetty-websocket" % "8.1.7.v20120910" % "container",
```

Scalatra's Atmosphere integration depends on Akka.

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

### Writing the ChatController

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

You can then decide which connected clients you'd like to send a given
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
class MySecureClient extends AtmosphereClient {

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

The `~` operator is used quite a bit there, it's a JSON operator which
turns `("name" -> "joe") ~ ("age" -> 35)` into `{"name":"joe","age":35}`.

That's pretty much it on the server side.

### JavaScript client

Browser clients can connect to the `atmosphere` route using a JavaScript
client.

Atmosphere has its own connection library, and also supports the use of 
[socket.io](http://socket.io). Whichever connector you choose, the base
library will assess the browser client it's hosted in and figure out 
which of the available transport types will work, falling back as 
necessary to maintain connectivity in a wide range of possible clients.

You're strongly advised to read Atmosphere's 
[extensive documentation](https://github.com/Atmosphere/atmosphere/wiki/jQuery.atmosphere.js-API)
in order to understand your connection options. 

Besides the basic connectivity provided by the Atmosphere connector, 
you'll need to provide your own application-specific logic, also in
JavaScript. Here's an `application.js` file for our chat application:

```javascript
$(function() {
  "use strict";

  var detect = $("#detect");
  var header = $('#header');
  var content = $('#content');
  var input = $('#input');
  var status = $('#status');
  var myName = false;
  var author = null;
  var loggedIn = false;
  var socket = $.atmosphere;
  var subSocket;
  var transport = 'websocket';

  /** 
   * The following code is just here for demonstration purpose and is  
   * not required.
   */

  /**  
   * Used to demonstrate the request.onTransportFailure callback. 
   * Not mandatory.
   */
  var sseSupported = false;

  /**
   * Define a list of transports. The Atmosphere client code will take
   * care of checking whether each of them is supported or not. 
   */
  var transports = [];
  transports[0] = "websocket";
  transports[1] = "sse";
  transports[2] = "jsonp";
  transports[3] = "long-polling";
  transports[4] = "streaming";
  transports[5] = "ajax";

  /**  
   * Loop through the possible transports, and show a message stating
   * whether each transport is supported.
   */
  $.each(transports, function (index, tr) {
     var req = new $.atmosphere.AtmosphereRequest();

     req.url = "/the-chat";
     req.contentType = "application/json";
     req.transport = tr;
     req.headers = { "X-SCALATRA-SAMPLE" : "true" };

     req.onOpen = function(response) {
       detect.append('<p><span style="color:blue">' + tr + 
        ' supported: '  + '</span>' + (response.transport == tr));
     };

     req.onReconnect = function(r) { r.close() };

     socket.subscribe(req)
  });


  /* Below is code that can be re-used */


  // We are now ready to cut the request
  var request = {
    url: "/the-chat",
    contentType: "application/json",
    logLevel: 'debug',
    shared: true,
    transport: transport,
    trackMessageLength : true,
    fallbackTransport: 'long-polling'
  };

  /**
   * This runs when the connection is first made.
   */
  request.onOpen = function(response) {
    content.html($('<p>', {
      text: 'Atmosphere connected using ' + response.transport
    }));
    input.removeAttr('disabled').focus();
    status.text('Choose name:');
    transport = response.transport;

    // If we're using the "local" transport, it means we're probably
    // already connected in another browser tab or window. In this case,
    // ask the user for their name.
    if (response.transport == "local") {
      subSocket.pushLocal("Name?");
    }
  };

  /**  
   * You can share messages between windows/tabs. 
   * 
   * Atmosphere can detect whether a message has come from the same
   * browser instance, and allow you to take action on it.
   * 
   * This keeps your users from getting multiple connections from the 
   * same browser instance, and helps ensure your users can be notified
   * if they happen to crack a few tabs which both point at the same
   * Atmosphere connection.
   */
  request.onLocalMessage = function(message) {
    if (transport != 'local') {
      header.append($('<h4>', {
        text: 'A new tab/window has been opened'
      }).css('color', 'green'));
      if (myName) {
        subSocket.pushLocal(myName);
      }
    } else {
      if (!myName) {
        myName = message;
        loggedIn = true;
        status.text(message + ': ').css('color', 'blue');
        input.removeAttr('disabled').focus();
      }
    }
  };

  /**  
   * Demonstrates how you can customize the fallbackTransport
   * using the onTransportFailure function.
   */
  request.onTransportFailure = function(errorMsg, r) {
    jQuery.atmosphere.info(errorMsg);
    if (window.EventSource) {
      r.fallbackTransport = "sse";
      transport = "see";
    }
    header.html($('<h3>', {
      text: 'Atmosphere Chat. Default transport is WebSocket, fallback is ' +
       r.fallbackTransport
    }));
  };

  /**
   * Runs when the client reconnects to Atmosphere.
   */
  request.onReconnect = function(rq, rs) {
    socket.info("Reconnecting")
  };

  /**
   * This is what runs when an Atmosphere message is pushed from the
   * server to this client.
   */
  request.onMessage = function(rs) {

    // We need to be logged in.
    if (!myName) return;

    var message = rs.responseBody;
    try {
      var json = jQuery.parseJSON(message);
      console.log("got a message")
      console.log(json)
    } catch (e) {
      console.log('This doesn\'t look like a valid JSON object: ', 
        message.data);
      return;
    }

    if (!loggedIn) {
      loggedIn = true;
      status.text(myName + ': ').css('color', 'blue');
      input.removeAttr('disabled').focus();
      subSocket.pushLocal(myName);
    } else {
      input.removeAttr('disabled');
      var me = json.author == author;

      var date = typeof(json.time) == 'string' ? 
        parseInt(json.time) : json.time;

      addMessage(json.author, json.message, me ? 'blue' : 'black', 
        new Date(date));
    }
  };

  /**
   * When the connection closes, run this:
   */
  request.onClose = function(rs) {
    loggedIn = false;
  };

  /**
   * Run this when a connection error occurs.
   */
  request.onError = function(rs) {
    content.html($('<p>', {
      text: 'Sorry, but there\'s some problem with your ' + 
      'socket or the server is down'
    }));
  };

  // Subscribe to receive events from Atmosphere.
  subSocket = socket.subscribe(request);

  /**
   * This is the chat client part.
   */
  input.keydown(function(e) {
    // Send a message when the <enter> key is pressed.
    if (e.keyCode === 13) {
      var msg = $(this).val();

      // The first message is always the author's name.
      if (author == null) {
        author = msg;
      }

      // Format the json message our atmosphere action will receive.
      var json = { author: author, message: msg };

      // Send the message.
      subSocket.push(jQuery.stringifyJSON(json));

      // Reset the chat text field.
      $(this).val('');

      if (myName === false) {
        myName = msg;
        loggedIn = true;
        status.text(myName + ': ').css('color', 'blue');
        input.removeAttr('disabled').focus();
        subSocket.pushLocal(myName);
      } else {
        addMessage(author, msg, 'blue', new Date);
      }
    }
  });

  function addMessage(author, message, color, datetime) {
    content.append('<p><span style="color:' + color + '">' + author + '</span> @ ' + +(datetime.getHours() < 10 ? '0' + datetime.getHours() : datetime.getHours()) + ':' + (datetime.getMinutes() < 10 ? '0' + datetime.getMinutes() : datetime.getMinutes()) + ': ' + message + '</p>');
  }
});
```


*TODO: what would be necessary to make the compiler happy if I wanted
to pull this implementation code:*

```scala
    println("Client %s is connected" format uuid)
    broadcast(("author" -> "Someone") ~ ("message" -> "joined the room") ~ ("time" -> (new Date().getTime.toString )), Everyone)
```
*Out into its own `def notifyConnect(uuid: String) = {}` method, so that the
pattern match looked like this?*

```scala
case Connected => notifyConnect(uuid)
```

*At present, if I try that, I don't have the `broadcast` method in scope.*
  