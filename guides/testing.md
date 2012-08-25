---
layout: default
title: Scalatra Guides | Testing
---

Testing
=======

Scalatra includes a test framework for writing the unit tests for your Scalatra
application.  The framework lets you send requests to your app and examine the
response.  All HTTP verbs are supported, as well as request parameters and
session tracking.

### Integrations

scalatra-test can be used with the test framework of your choosing.  A basic
example from each supported framework is shown below.  You may mix and match if
transitioning from one framework to another; sbt will find and run them all by
default.

### [ScalaTest](http://scalatest.org/)

#### Dependency

    "org.scalatra" %% "scalatra-scalatest" % "2.1.0" % "test"

#### Example

Extend ScalatraSuite with your preferred Suite implementation.  You get
ShouldMatchers and MustMatchers for free.

{pygmentize:: scala}
import org.scalatra.test.scalatest._

class MyScalatraServletTests extends ScalatraSuite with FunSuite {
  // `MyScalatraServlet` is your app which extends ScalatraServlet
  addServlet(classOf[MyScalatraServlet], "/*")

  test("simple get") {
    get("/path/to/something") {
      status should equal (200)
      body should include ("hi!")
    }
  }
}
{pygmentize}

Convenience traits are provided for many Suite implementations:

* ScalatraSpec
* ScalatraFlatSpec
* ScalatraFreeSpec
* ScalatraWordSpec
* ScalatraFunSuite
* ScalatraFeatureSpec
* ScalatraJUnit3Suite
* ScalatraJUnitSuite (JUnit 4)
* ScalatraTestNGSuite

### [Specs2](http://etorreborre.github.com/specs2/)

#### Dependency

    "org.scalatra" %% "scalatra-specs2" % "2.1.0" % "test"

#### Example

Specs2 supports two basic styles: Unit and Acceptance.  Both are supported
by scalatra-test.

#### Unit testing

From the [Specs2 QuickStart][Specs2 Quickstart]:

> unit specifications where the specification text is interleaved with the
> specification code. It is generally used to specify a single class.

{pygmentize:: scala }
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
{pygmentize}

#### Acceptance testing

From the [Specs2 QuickStart][Specs2 Quickstart]:

> acceptance specifications where all the specification text stands as one and
> the implementation code is elsewhere.  It is generally used for acceptance or
> integration scenarios

{pygmentize:: scala }
import org.scalatra.test.specs2._

class HelloWorldServletSpec extends ScalatraSpec { def is =
  "GET / on HelloWorldServlet"                     ^
    "return status 200"                            ! getRoot200^
                                                   end

  addServlet(classOf[HelloWorldServlet], "/*")

  def getRoot200 = get("/") {
    status must_== 200
  }
}
{pygmentize}

### [Specs](http://code.google.com/p/specs/)

Specs is now in maintenance mode.  The author recommends that new projects
begin with Specs2.

#### Dependency

    "org.scalatra" %% "scalatra-specs" % "2.1.0" % "test"

#### Example

{pygmentize:: scala}
import org.scalatra.test.specs._

object MyScalatraServletTests extends ScalatraSpecification {
  addServlet(classOf[MyScalatraServlet], "/*")

  "MyScalatraServlet when using GET" should {
    "/path/to/something should return 'hi!'" in {
      get("/") {
        status mustEqual(200)
        body mustEqual("hi!")
      }
    }
  }
}
{pygmentize}


### Other test frameworks

#### Dependency

    "org.scalatra" %% "scalatra-test" % "2.1.0" % "test"

#### Usage guide

Create an instance of `org.scalatra.test.ScalatraTests`.  Be sure to call
`start()` and `stop()` before and after your test suite.


### Maven Repository

To make usage of Scalatra as a dependency convenient, Maven hosting is now
available courtesy of
[Sonatype](https://docs.sonatype.com/display/NX/OSS+Repository+Hosting).

* [Releases](https://oss.sonatype.org/content/repositories/releases)
* [Snapshots](https://oss.sonatype.org/content/repositories/snapshots)

### Testing FAQ

#### How do I set a servlet init parameter?

scalatra-test is built on Jetty's [ServletTester] [ServletTester], so it
does not read your web.xml.  Most things you can do in a web.xml can be
done from the context on the tester object.  In this case, call this in
the constructor of your servlet:

    tester.getContext.setInitParameter("db.username", "ross")

[Specs2 Quickstart]: http://etorreborre.github.com/specs2/guide/org.specs2.guide.QuickStart.html
[ServletTester]: http://download.eclipse.org/jetty/stable-7/apidocs/org/eclipse/jetty/testing/ServletTester.html

#### How do I test file uploads?

Convenience methods exist for testing file uploads.

Example based on Specs2:

{pygmentize:: scala}
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
{pygmentize}
