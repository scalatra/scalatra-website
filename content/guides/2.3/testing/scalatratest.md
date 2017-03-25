---
aliases:
  - /2.3/guides/testing/scalatratest.html
title: ScalatraTest
---

#### Dependency

```scala
"org.scalatra" %% "scalatra-test" % "{{< 2-3-scalatra_version >}}" % "test"
```

#### Usage guide

Create an instance of `org.scalatra.test.ScalatraTests`.  Be sure to call
`start()` and `stop()` before and after your test suite.



### Testing FAQ

#### How do I set a servlet init parameter?

scalatra-test is built on an embedded Jetty server, so it
does not read your `web.xml`.  Most things you can do in a `web.xml` can be
done from the context of the tester object.
Call this in the constructor of your servlet:

```scala
servletContextHandler.setInitParameter("db.username", "ross")
```
