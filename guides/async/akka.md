---
layout: guide
title: Akka | Async | Scalatra guides
---

<div class="page-header">
  <h1>Akka</h1>
</div>

### AkkaSupport

Akka is a toolkit and runtime for building highly concurrent, distributed, and
fault tolerant event-driven applications on the JVM. Scalatra allows you to easily
mix it into your application.

#### Dependency:

```scala
// Put this in build.sbt:
"org.scalatra" % "scalatra-akka" % "{{ site.scalatra_version }}"
```

You'll also need to add the Typesafe resolver in build.sbt if you're using
Scala 2.9.x:

```scala
resolvers += "Typesafe" at "http://repo.typesafe.com/typesafe/releases/",
```

### Akka futures

Scalatra's Akka support provides a mechanism for adding [Akka][akka]
futures to your routes. Akka support is only available in Scalatra 2.1 and up.

The generic case looks like this:

```scala
import _root_.akka.dispatch._
import org.scalatra.akka.AkkaSupport

class MyAppServlet extends ScalatraServlet with AkkaSupport {
  get("/"){
    Future {
      // Add async logic here
      <html><body>Hello Akka</body></html>
    }
  }
}
```

### Async request example

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="{{site.examples}}async/akka-examples">akka-examples</a>
  for a minimal and standalone project containing the examples in this guide.
</div>

As a more concrete example, here's how you'd make an asynchronous HTTP
request from inside one of your actions, using the
[Dispatch](http://dispatch.databinder.net/Dispatch.html) http client and an
Akka `ActorSystem`.

```scala
import _root_.akka.actor.ActorSystem
import _root_.akka.dispatch.{Future, ExecutionContext}
import _root_.akka.dispatch.{Promise => AkkaPromise}

import org.scalatra._
import akka.AkkaSupport

import dispatch._

object DispatchAkka {

  def retrievePage()(implicit ctx: ExecutionContext): Future[String] = {
    val prom = AkkaPromise[String]()
    dispatch.Http(url("http://slashdot.org/") OK as.String) onComplete {
      case r => prom.complete(r)
    }
    prom.future
  }
}


class PageRetriever extends ScalatraServlet with AkkaSupport {

  implicit val system = ActorSystem()
  protected implicit def executor: ExecutionContext = system.dispatcher

  get("/") {
    DispatchAkka.retrievePage()
  }

}

```

This example code will run in Scalatra 2.2.x with Scala 2.9.2. In this
combination, Scalatra uses Akka 2.0.5.

When using Akka with Scala 2.10, you get Akka 2.1.x, and some of the imports and class names have changed. Consult the
[Akka upgrade guide](http://doc.akka.io/docs/akka/snapshot/project/migration-guide-2.0.x-2.1.x.html) to see the differences between the two Akka versions.


### Actor example

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="{{site.examples}}async/akka-examples">akka-examples</a>
  for a minimal and standalone project containing the examples in this guide.
</div>

When you use Scalatra with Akka, you most likely want to return a result of some sort so you're probably going to send a message to an Actor which will reply to you. The method you use for that returns a Future.

When the request you get just needs to trigger something on an Actor (fire and forget) then you don't need a Future and probably you want to reply with the Accepted status or something like it.

Here's some example code:

```scala
import akka.actor.{Actor, Props, ActorSystem}
import akka.dispatch.ExecutionContext
import akka.util.Timeout
import org.scalatra.akka.AkkaSupport
import org.scalatra.{Accepted, ScalatraServlet}

class MyActorApp extends ScalatraServlet with AkkaSupport {

  import _root_.akka.pattern.ask
  protected implicit def executor: ExecutionContext = system.dispatcher

  val system = ActorSystem()
  implicit val timeout = Timeout(10)

  val myActor = system.actorOf(Props[MyActor])

  get("/async") {
    myActor ? "Do stuff and give me an answer"
  }

  get("/fire-forget") {
    myActor ! "Hey, you know what?"
    Accepted()
  }

}

class MyActor extends Actor {
  def receive = {
    case "Do stuff and give me an answer" => sender ! "The answer is 42"
    case "Hey, you know what?" => println("Yeah I know... oh boy do I know")
  }

}
```

[akka]: http://akka.io/