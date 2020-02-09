---
title: Specs2
layout: guides-2.7
---

[Specs2](http://etorreborre.github.com/specs2/) is a library for writing
executable software specifications. With specs2 you can write software
specifications for one class (unit specifications) or a full system
(acceptance specifications).

#### Dependency

```scala
"org.scalatra" %% "scalatra-specs2" % "{{< 2-7-scalatra_version >}}" % "test"
```

#### Selecting a testing style 

A trait of Scalatra integration is prepared according to the testing style of Specs2.
You can select a trait according to the testing style you want to use.

|Specs2 testing style|trait|
|---|---|
|`MutableScalatraSpec`|`org.specs2.mutable.Specification` (Unit specification)|
|`ScalatraSpec`|`org.specs2.Specification` (Acceptance specification)|

#### Examples

##### Unit testing

From the [Specs2 Structure](https://etorreborre.github.io/specs2/guide/SPECS2-4.0.0/org.specs2.guide.Structure.html):

> you can create a “Unit” specification where the code is interleaved with the text.
> The name “unit” comes from the fact that Unit specifications have a structure which
> is close to unit tests in “classical” frameworks such as JUnit

```scala
import org.scalatra.test.specs2._

class HelloWorldMutableServletSpec extends MutableScalatraSpec {
  addServlet(classOf[HelloWorldServlet], "/*")

  "GET / on HelloWorldServlet" >> {
    "must return status 200" >> {
      get("/") {
        status must_== 200
      }
    }
  }
}
```

##### Acceptance testing

From the [Specs2 Structure](https://etorreborre.github.io/specs2/guide/SPECS2-4.0.0/org.specs2.guide.Structure.html):

> you can create an “Acceptance” specification where all the informal text
> is written in one place and the code is written somewhere else. The name
> “acceptance” comes from the fact that it might be easier for a non-developer
> to just read some text to validate your specification

```scala
import org.scalatra.test.specs2._

class HelloWorldServletSpec extends ScalatraSpec { def is = s2"""
  GET / on HelloWorldServlet
    must return status 200           $getRoot200
"""

  addServlet(classOf[HelloWorldServlet], "/*")

  def getRoot200 = get("/") {
    status must_== 200
  }
}
```
