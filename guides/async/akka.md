---
layout: guide
title: Akka | Async | Scalatra guides
---

<div class="page-header">
  <h1>Akka</h1>
</div>

---


### AkkaSupport

Akka is a toolkit and runtime for building highly concurrent, distributed, and
fault tolerant event-driven applications on the JVM. Scalatra allows you to
mix it right into your application.

#### Dependency:

```scala
// Put this in build.sbt:
"org.scalatra" % "scalatra-akka" % "{{ site.scalatra_version }}"
```

Provides a mechanism for adding [Akka][akka] futures to your routes. Akka support
is only available in Scalatra 2.1 and up.

```scala
import _root_.akka.dispatch._
import org.scalatra.akka.AkkaSupport

class MyAppServlet extends ScalatraServlet with AkkaSupport {
  get("/"){
    Future {
      // Add other logic here

      <html><body>Hello Akka</body></html>
    }
  }
}
```

[akka]: http://akka.io/

{% include _site/_under_construction.html %}