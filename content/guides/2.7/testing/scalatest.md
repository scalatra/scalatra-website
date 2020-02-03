---
title: ScalaTest
layout: guides-2.7
---

[ScalaTest](http://scalatest.org/) supports three main styles of testing out of
the box: test-driven development (TDD), behavior-driven development (BDD), and
acceptance testing. ScalaTest also supports writing JUnit and TestNG tests in
Scala.

#### Dependency

```scala
"org.scalatra" %% "scalatra-scalatest" % "{{< 2-7-scalatra_version >}}" % "test"
```

#### Selecting a testing style

A trait of Scalatra integration is prepared according to the testing style of ScalaTest.
You can select a trait according to the testing style you want to use.

|ScalaTest testing style|trait|
|---|---|
|`FunSpec`|`ScalatraSpec`|
|`FlatSpec`|`ScalatraFlatSpec`|
|`FreeSpec`|`ScalatraFreeSpec`|
|`WordSpec`|`ScalatraWordSpec`|
|`FunSuite`|`ScalatraFunSuite`|
|`FeatureSpec`|`ScalatraFeatureSpec`|
|`JUnit3Suite`|`ScalatraJUnit3Suite`|
|`JUnitSuite` (JUnit 4)|`ScalatraJUnitSuite`|
|`TestNGSuite`|`ScalatraTestNGSuite`|

At this time, traits for PropSpec and RefSpec are not prepared.

#### Example

When creating a test class, extend Scalatra's trait according to
[the testing style of ScalaTest](http://www.scalatest.org/user_guide/selecting_a_style).
At this time, ScalaTest's [`Matcher`](http://www.scalatest.org/user_guide/using_matchers)
trait is already in effect, so you do not need to mix-in.

The following code shows an example of code when FunSuite is selected as the testing style.

```scala
import org.scalatra.test.scalatest._

class HelloWorldServletTests extends ScalatraFunSuite {
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
