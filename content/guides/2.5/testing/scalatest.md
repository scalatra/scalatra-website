---
title: ScalaTest
---

[ScalaTest](http://scalatest.org/) supports three main styles of testing out of
the box: test-driven development (TDD), behavior-driven development (BDD), and
acceptance testing. ScalaTest also supports writing JUnit and TestNG tests in
Scala.

Scalatra has an integration to make the use of ScalaTest more convenient.

Convenience traits are provided for many `Suite` implementations:

* `ScalatraSpec`
* `ScalatraFlatSpec`
* `ScalatraFreeSpec`
* `ScalatraWordSpec`
* `ScalatraFunSuite`
* `ScalatraFeatureSpec`
* `ScalatraJUnit3Suite`
* `ScalatraJUnitSuite` (JUnit 4)
* `ScalatraTestNGSuite`


#### Dependency

```scala
"org.scalatra" %% "scalatra-scalatest" % "{{< 2-5-scalatra_version >}}" % "test"
```

#### Example

Extend `ScalatraSuite` with your preferred `org.scalatest.Suite` implementation.
You get `ShouldMatchers` and `MustMatchers` for free.

```scala
import org.scalatra.test.scalatest._
import org.scalatest.FunSuiteLike

class HelloWorldServletTests extends ScalatraSuite with FunSuiteLike {
  // `HelloWorldServlet` is your app which extends ScalatraServlet
  addServlet(classOf[HelloWorldServlet], "/*")

  test("simple get") {
    get("/path/to/something") {
      status should equal (200)
      body should include ("hi!")
    }
  }
}
```

The addServlet method is used here with `classOf[HelloWorldServlet]` to mount
the HelloWorld servlet into the ScalaTest test.

If you've got a servlet which takes constructor params, you'll need to mount the servlet in your test with a different `addServlet` method overload, e.g.:

```scala
  implicit val myImplicitHere = new ImplicitConstructorParam
  addServlet(new HelloWorldServlet, "/*")
```
