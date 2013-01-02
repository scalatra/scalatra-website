---
layout: guide
title: Specs2 | Testing | Scalatra guides
---

<div class="page-header">
  <h1>Specs2</h1>
</div>

### [Specs2](http://etorreborre.github.com/specs2/)

#### Dependency

```scala
"org.scalatra" %% "scalatra-specs2" % "{{ site.scalatra_version }}" % "test"
```

#### Example

Specs2 supports two basic styles: *unit* and *acceptance*.
Both are supported by Scalatra.

#### Unit testing

From the [Specs2 QuickStart](Specs2 Quickstart):

> unit specifications where the specification text is interleaved with the
> specification code. It is generally used to specify a single class.

```scala
import org.scalatra.test.specs2._

class HelloWorldMutableServletSpec extends MutableScalatraSpec {
  addServlet(classOf[HelloWorldServlet], "/*")

  "GET / on HelloWorldServlet" should {
    "return status 200" in {
      get("/") {
        status must_== 200
      }
    }
  }
}
```

#### Acceptance testing

From the [Specs2 QuickStart](Specs2 Quickstart):

> acceptance specifications where all the specification text stands as one and
> the implementation code is elsewhere.  It is generally used for acceptance or
> integration scenarios

```scala
import org.scalatra.test.specs2._

class HelloWorldServletSpec extends ScalatraSpec { def is =
  "GET / on HelloWorldServlet"                            ^
    "returns status 200"                                  ! getRoot200^
                                                          end

  addServlet(classOf[HelloWorldServlet], "/*")

  def getRoot200 = get("/") {
    status must_== 200
  }
}
```

{% include _under_construction.html %}