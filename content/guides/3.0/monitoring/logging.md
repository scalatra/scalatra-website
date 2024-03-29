---
title: Logging
layout: guides-3.0
---

By default, Scalatra uses [Logback][logback] for logging.

[logback]:http://logback.qos.ch

You can easily add logging facilities to your project, if you've got the
logging dependency in your `build.sbt` file:

```scala
"ch.qos.logback" % "logback-classic" % "{{< 3-0-logback_version >}}" % "runtime"
```

In your servlet or filter class:

```scala
import org.slf4j.{Logger, LoggerFactory}

class YourServlet extends ScalatraServlet {

  val logger =  LoggerFactory.getLogger(getClass)

  get("/") {
    logger.info("foo")
    // whatever else you want to put in the body of the action
  }
}
```

This will get you basic logging support. There are some additional logging
libraries you might want to investigate like [scala-logging][scala-logging],
which act as Scala wrappers around slf4j.

[scala-logging]:https://github.com/lightbend-labs/scala-logging

The Scala wrappers use by-name parameters for the log message, and
check to see that the logging level is enabled.  This is a performance
win for complex log messages involving expensive `toString`s or many
concatenations.
