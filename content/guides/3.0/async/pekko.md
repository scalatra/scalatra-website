---
title: Apache Pekko
layout: guides-3.0
---

### Pekko integration

[Apache Pekko](https://pekko.apache.org/) is a toolkit and runtime for building highly concurrent, 
distributed, and fault tolerant event-driven applications on the JVM. Scalatra 
allows you to easily mix it into your application.

#### Dependencies

The following dependencies will be needed to make the sample application work.

```scala
"org.apache.pekko" %% "pekko-actor" % "{{< 3-0-pekko_version >}}",
"com.softwaremill.sttp.client3" %% "core" % "3.9.0",
```

### Setting up your Scalatra app with Pekko

When you're using Pekko, you'll want to start your `Actor`s and `ActorSystem`
from inside the `ScalatraBootstrap` class. You can then pass those into the
constructors of your servlets as necessary:

```scala
import org.apache.pekko.actor.{Props, ActorSystem}
import com.example.app._
import org.scalatra._
import jakarta.servlet.ServletContext


class ScalatraBootstrap extends LifeCycle {

  val system = ActorSystem()
  val myActor = system.actorOf(Props.apply[MyActor]())

  override def init(context: ServletContext) = {
    context.mount(new PageRetriever(system), "/*")
    context.mount(new MyActorApp(system, myActor), "/actors/*")
  }

  override def destroy(context:ServletContext) = {
    system.terminate()
  }
}
```

It's also considered good form to shut the ActorSystem down when you're done
with it. Keep in mind that a servlet context destroy does not necessarily mean
a full application shutdown, it might be a reload - so you'll need to release
the `ActorSystem` resources when your Scalatra application is destroyed.


### Using Scala Futures

Scalatra's `FutureSupport` trait provides a mechanism for adding [Futures](http://docs.scala-lang.org/overviews/core/futures.html)
to your routes. At the point where you

The generic case looks like this (but it won't compile):

```scala
import org.apache.pekko.dispatch._
import org.scalatra.FutureSupport

class MyAppServlet extends ScalatraServlet with FutureSupport {
  get("/"){
    new AsyncResult { val is =
      Future {
        // Add async logic here
        <html><body>Hello Pekko</body></html>
      }
    }
  }
}
```

### Async request example

<div class="alert alert-info">
  <span class="badge badge-info"><i class="glyphicon glyphicon-flag"></i></span>
  See
  <a href="https://github.com/scalatra/scalatra-website-examples/tree/master/{{< 3-0-scalatra_short_version >}}/async/pekko-examples">pekko-examples</a>
  for a minimal and standalone project containing the examples in this guide.
</div>

As a more concrete example, here's how you'd make an asynchronous HTTP
request from inside one of your actions, using the
[Dispatch](https://dispatchhttp.org/Dispatch.html) http client and an
Pekko `ActorSystem`.

```scala
package com.example.app

import org.apache.pekko.actor.ActorSystem
import sttp.client3._

import org.scalatra._

import scala.concurrent.{ExecutionContext, Future, Promise}
import scala.util.{Failure, Success, Try}

class FutureController(system: ActorSystem) extends ScalatraServlet with FutureSupport {

  protected implicit def executor: ExecutionContext = system.dispatcher

  get("/") {
    new AsyncResult { val is =
      HttpClient.retrievePage()
    }
  }

}

object HttpClient {

  def retrievePage()(implicit ctx: ExecutionContext): Future[String] = {
    Future {
      val backend = HttpClientSyncBackend()
      val request = basicRequest.get(uri"https://scalatra.org/").response(asStringAlways)
      val response = request.send(backend)
      response.body
    }
  }
}
```

`AsyncResult` isn't strictly necessary. It's a way to ensure that if you close your
Future over mutable state (such as a `request` object or a `var`) that the state is
captured at the point you hand off to the Future.

If you attempt to use mutable
state inside your Future without AsyncResult (e.g. calling `request.headers` or something),
you'll get an exception. If you use AsyncResult, it'll work. So, you're trading a bit
of boilerplate code for a bit of safety. If you can remember not to close over mutable
state, don't bother with `AsyncResult`.


### Actor example

<div class="alert alert-info">
  <span class="badge badge-info"><i class="glyphicon glyphicon-flag"></i></span>
  See
  <a href="https://github.com/scalatra/scalatra-website-examples/tree/master/{{< 3-0-scalatra_short_version >}}/async/pekko-examples">pekko-examples</a>
  for a minimal and standalone project containing the examples in this guide.
</div>

When you use Scalatra with Pekko, you most likely want to return a result of some sort. So you're probably going to send a message to an Actor which will reply to you. The method you use for that returns a Future. Typically, this involves Pekko's [ask pattern](https://pekko.apache.org/docs/pekko/current//actors.html#ask-send-and-receive-future).

When the request you get just needs to trigger something on an Actor using the fire-and-forget [tell pattern](https://pekko.apache.org/docs/pekko/current//actors.html#tell-fire-forget), then you don't need a Future. In this case, you probably you want to reply with the Accepted status or something like it.

Here's some example code:

```scala
package com.example.app

import org.apache.pekko.actor.{Actor, ActorRef, ActorSystem}
import org.apache.pekko.pattern.ask
import org.apache.pekko.util.Timeout
import org.scalatra.{Accepted, FutureSupport, ScalatraServlet}

import scala.concurrent.ExecutionContext
import scala.concurrent.duration._

class MyActorApp(system:ActorSystem, myActor:ActorRef) extends ScalatraServlet with FutureSupport {

  implicit val timeout = new Timeout(2 seconds)
  protected implicit def executor: ExecutionContext = system.dispatcher

  // You'll see the output from this in the browser.
  get("/ask") {
    myActor ? "Do stuff and give me an answer"
  }

  // You'll see the output from this in your terminal.
  get("/tell") {
    myActor ! "Hey, you know what?"
    Accepted()
  }

}

class MyActor extends Actor {
  def receive = {
    case "Do stuff and give me an answer" => sender() ! "The answer is 42"
    case "Hey, you know what?" => println("Yeah I know... oh boy do I know")
  }

}
```

Once again, if we wanted to ensure that it was safe to close over mutable state, we could
have used `AsyncResult` with out Actors.
