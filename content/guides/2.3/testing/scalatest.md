---
aliases:
  - /2.3/guides/testing/scalatest.html
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

<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
Notice that all the above traits are based on `ScalatraSuite` which mixes in `BeforeAndAfterAll`. It overrides both `beforeAll()` and `afterAll()` so it can start/stop the embedded HTTP server. Because of that, if your test classes also need to override `beforeAll` and/or `afterAll` just remember to call `super.beforeAll()` and/or `super.afterAll()`.

#### Dependency

```scala
"org.scalatra" %% "scalatra-scalatest" % "{{< 2-3-scalatra_version >}}" % "test"
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

    get("/path/to/something", ("param1" -> "value"), ("param2" -> "value2")) {
      status should equal (200)
      body should include ("hi!")
    }

    get("/path/to/something",
        Map("param1" -> "value", "param2" -> "value2"),
        Map("Header1" -> "header_value", "Header2" -> "header_value2")) {
      status should equal (200)
      body should include ("hi!")
    }
  }
}
```

You can see all the available http different methods in the [API docs](/2.3/api/#org.scalatra.test.Client)

The addServlet method is used here with `classOf[HelloWorldServlet]` to mount
the HelloWorld servlet into the ScalaTest test.

If you've got a servlet which takes constructor params, you'll need to mount the servlet in your test with a different `addServlet` method overload, e.g.:

```scala
  implicit val myImplicitHere = new ImplicitConstructorParam
  addServlet(new HelloWorldServlet, "/*")
```
