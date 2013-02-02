---
layout: guide
title: Specs2 | Testing | Scalatra guides
---

<div class="page-header">
  <h1>Specs2</h1>
</div>

[Specs2](http://etorreborre.github.com/specs2/) is a library for writing 
executable software specifications. With specs2 you can write software 
specifications for one class (unit specifications) or a full system 
(acceptance specifications).

#### Dependency

```scala
"org.scalatra" %% "scalatra-specs2" % "{{ site.scalatra_version }}" % "test"
```

#### Examples

Specs2 supports two basic styles: *unit* and *acceptance*.
Both are supported by Scalatra.

##### Unit testing

From the [Specs2 QuickStart][Quickstart]:

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

##### Acceptance testing

From the [Specs2 QuickStart][Quickstart]:

> acceptance specifications where all the specification text stands as one and
> the implementation code is elsewhere.  It is generally used for acceptance or
> integration scenarios

[Quickstart]: http://etorreborre.github.com/specs2/guide/org.specs2.guide.QuickStart.html

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

The `addServlet` method is used here with `classOf[HelloWorldServlet]` to mount
the HelloWorld servlet into the Specs2 test.

If you've got a servlet which takes constructor params, you'll need to mount the
servlet in your test with a different `addServlet` method overload, e.g.:

```scala
  implicit val myImplicitHere = new ImplicitConstructorParam
  addServlet(new HelloWorldServlet, "/*")
```

{% include _under_construction.html %}