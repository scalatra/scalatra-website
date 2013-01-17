---
layout: guide
title: Akka | Async | Scalatra guides
---

<div class="page-header">
  <h1>Akka</h1>
</div>

### AkkaSupport

Akka is a toolkit and runtime for building highly concurrent, distributed, and
fault tolerant event-driven applications on the JVM. Scalatra allows you to
mix it right into your application.

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

This example code will run in Scalatra 2.2.0 with Scala 2.9.2. In this
combination, Scalatra uses Akka 2.0.5.

When using Akka with Scala 2.10, you get Akka 2.1.x, and some of the imports and class names have changed. Consult the 
[Akka upgrade guide](http://doc.akka.io/docs/akka/snapshot/project/migration-guide-2.0.x-2.1.x.html) to see the differences between the two Akka versions.

[akka]: http://akka.io/

{% include _under_construction.html %}