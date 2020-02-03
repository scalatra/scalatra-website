---
title: Logging
layout: guides-2.7
---

By default, Scalatra uses [Logback][logback] for logging.

[logback]:http://logback.qos.ch

You can easily add logging facilities to your project, if you've got the
logging dependency in your `project/build.scala` file:

```scala
"ch.qos.logback" % "logback-classic" % "{{< 2-7-logback_version >}}" % "runtime"
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
libraries you might want to investigate: [scala-logging][scala-logging] and
[grizzled-slf4j][grizzled-slf4j],
which act as Scala wrappers around slf4j.

[scala-logging]:https://github.com/typesafehub/scala-logging
[grizzled-slf4j]:http://software.clapper.org/grizzled-slf4j/

The Scala wrappers use by-name parameters for the log message, and
check to see that the logging level is enabled.  This is a performance
win for complex log messages involving expensive `toString`s or many
concatenations.
