---
aliases:
  - /2.2/guides/async/akka.html
title: Akka and Async
---

### AkkaSupport

Akka is a toolkit and runtime for building highly concurrent, distributed, and
fault tolerant event-driven applications on the JVM. Scalatra allows you to easily
mix it into your application.

In versions of Scalatra before 2.2.0, Akka was an optional dependency,
contained in a scalatra-akka jar. In Scalatra 2.2.0, Akka has been
folded directly into Scalatra core, and the scalatra-akka dependency is no
longer needed. To get access to Akka, all you need to do is mix FutureSupport
into your servlets.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  If you're using Scala 2.9.x, you'll need
  <a href="https://github.com/scalatra/scalatra-website-examples/blob/master/2.2/async/akka-examples/project/build.scala#L24">the Akka resolver</a>
  in your sbt configuration, otherwise you'll get a missing dependency. Add
  <pre>resolvers += "Akka Repo" at "http://repo.akka.io/repository",</pre>
  and you'll be all set.
</div>


### Setting up your Scalatra app with Akka

When you're using Akka, you'll want to start your `Actor`s and `ActorSystem`
from inside the `ScalatraBootstrap` class. You can then pass those into the
constructors of your servlets as necessary:

```scala
import _root_.akka.actor.{ActorSystem, Props}
import com.example.app._
import org.scalatra._
import javax.servlet.ServletContext


class ScalatraBootstrap extends LifeCycle {

  // Get a handle to an ActorSystem and a reference to one of your actors
  val system = ActorSystem()
  val myActor = system.actorOf(Props[MyActor])

  // In the init method, mount your servlets with references to the system
  // and/or ActorRefs, as necessary.
  override def init(context: ServletContext) {
    context.mount(new PageRetriever(system), "/*")
    context.mount(new MyActorApp(system, myActor), "/actors/*")
  }

  // Make sure you shut down
  override def destroy(context:ServletContext) {
    system.shutdown()
  }
}
```

It's also considered good form to shut the ActorSystem down when you're done
with it. Keep in mind that a servlet context destroy does not necessarily mean
a full application shutdown, it might be a reload - so you'll need to release
the `ActorSystem` resources when your Scalatra application is destroyed.


### Akka Futures

Scalatra's Akka support provides a mechanism for adding [Akka][akka]
futures to your routes. Akka support is only available in Scalatra 2.1 and up.

The generic case looks like this (but it won't compile):

```scala
import _root_.akka.dispatch._
import org.scalatra.FutureSupport

class MyAppServlet extends ScalatraServlet with FutureSupport {
  get("/"){
    new AsyncResult { val is =
      Future {
        // Add async logic here
        <html><body>Hello Akka</body></html>
      }
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
package com.example.app

import scala.concurrent.{ExecutionContext, Future, Promise}
import akka.actor.ActorSystem
import dispatch._
import org.scalatra.{ScalatraServlet, FutureSupport, AsyncResult}

object DispatchAkka {

  def retrievePage()(implicit ctx: ExecutionContext): Future[String] = {
    dispatch.Http(url("http://slashdot.org/") OK as.String)
  }
}

class PageRetriever(system: ActorSystem) extends ScalatraServlet with FutureSupport {

  protected implicit def executor: ExecutionContext = system.dispatcher

  get("/") {
    contentType = "text/html"
    new AsyncResult { val is =
      DispatchAkka.retrievePage()
    }
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
package com.example.app

import scala.concurrent.ExecutionContext
import akka.actor.{ActorRef, Actor, ActorSystem}
import akka.util.Timeout
import org.scalatra.{Accepted, AsyncResult, FutureSupport, ScalatraServlet}

class MyActorApp(system:ActorSystem, myActor:ActorRef) extends ScalatraServlet with FutureSupport {

  protected implicit def executor: ExecutionContext = system.dispatcher

  import _root_.akka.pattern.ask
  implicit val defaultTimeout = Timeout(10)

  get("/async") {
    new AsyncResult { val is = myActor ? "Do stuff and give me an answer" }
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
