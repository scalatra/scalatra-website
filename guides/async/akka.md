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
  protected implicit val executionContext = system.dispatcher

  get("/") {
    DispatchAkka.retrievePage()
  }

}

```

[akka]: http://akka.io/

{% include _under_construction.html %}