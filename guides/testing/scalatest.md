---
layout: guide
title: ScalaTest | Testing | Scalatra guides
---

<div class="page-header">
  <h1>ScalaTest</h1>
</div>


Scalatra includes a test framework for writing the unit tests for your Scalatra
application.  The framework lets you send requests to your app and examine the
response.  All HTTP verbs are supported, as well as request parameters and
session tracking.

---

## Integrations

Scalatra can be used with the test framework of your choosing.  A basic
example from each supported framework is shown below.  You may mix and match if
transitioning from one framework to another; sbt will find and run them all by
default.

### [ScalaTest](http://scalatest.org/)

#### Dependency

```scala
"org.scalatra" %% "scalatra-scalatest" % "{{ site.scalatra_version }}" % "test"
```

#### Example

Extend `ScalatraSuite` with your preferred `org.scalatest.Suite` implementation.
You get `ShouldMatchers` and `MustMatchers` for free.

```scala
import org.scalatra.test.scalatest._

class HelloWorldServletTests extends ScalatraSuite with FunSuite {
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

The addServlet method is used here with classOf[HelloWorldServlet] to mount
the HelloWorld servlet into the ScalaTest test.

If you've got a servlet which takes constructor params, you'll need to mount the servlet in your test with a different addServlet method overload, e.g.:

```scala
  implicit val myImplicitHere = new ImplicitConstructorParam
  addServlet(new HelloWorldServlet, "/*")
```

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


### Other test frameworks

#### Dependency

```scala
"org.scalatra" %% "scalatra-test" % "{{ site.scalatra_version }}" % "test"
```

#### Usage guide

Create an instance of `org.scalatra.test.ScalatraTests`.  Be sure to call
`start()` and `stop()` before and after your test suite.


### Maven repository

To make usage of Scalatra as a dependency convenient, Maven hosting is now
available courtesy of
[Sonatype](https://docs.sonatype.com/display/NX/OSS+Repository+Hosting).

* [Releases](https://oss.sonatype.org/content/repositories/releases)
* [Snapshots](https://oss.sonatype.org/content/repositories/snapshots)

### Testing FAQ

#### How do I set a servlet init parameter?

scalatra-test is built on an embedded Jetty server, so it
does not read your `web.xml`.  Most things you can do in a `web.xml` can be
done from the context of the tester object.
Call this in the constructor of your servlet:

```scala
servletContextHandler.setInitParameter("db.username", "ross")
```

[Specs2 Quickstart]: http://etorreborre.github.com/specs2/guide/org.specs2.guide.QuickStart.html

#### How do I test file uploads?

Convenience methods exist for testing file uploads.

Example using Specs2:

```scala
class FileUploadSpec extends MutableScalatraSpec {
  addServlet(classOf[FileUploadServlet], "/*")

  "POST /files" should {
    "return status 200" in {
      // You can also pass headers after the files Map
      post("/files", Map("private" -> "true"), Map("kitten" -> new File("kitten.png"))) {
        status must_== 200
      }
    }
  }

  "PUT /files/:id" should {
    "return status 200" in {
      put("/files/10", Map("private" -> "false"), Map("kitten" -> new File("kitten.png"))) {
        status must_== 200
      }
    }
  }
}
```
