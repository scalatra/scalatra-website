---
aliases:
  - /2.4/guides/deployment/standalone.html
layout: oldguide
title: Standalone deployment
---

### Launching Scalatra as a servlet

We need some glue code to launch an embedded Jetty server with the ScalatraListener.

```scala
package com.example  // remember this package in the sbt project definition
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.{DefaultServlet, ServletContextHandler}
import org.eclipse.jetty.webapp.WebAppContext
import org.scalatra.servlet.ScalatraListener

object JettyLauncher { // this is my entry object as specified in sbt project definition
  def main(args: Array[String]) {
    val port = if(System.getenv("PORT") != null) System.getenv("PORT").toInt else 8080

    val server = new Server(port)
    val context = new WebAppContext()
    context setContextPath "/"
    context.setResourceBase("src/main/webapp")
    context.addEventListener(new ScalatraListener)
    context.addServlet(classOf[DefaultServlet], "/")

    server.setHandler(context)

    server.start
    server.join
  }
}
```

Be sure to define the appropriate [ScalatraBootstrap](configuration.html):

```scala
import org.scalatra.LifeCycle
import javax.servlet.ServletContext
import org.scalatra.TemplateExample // this is the example Scalatra servlet

class ScalatraBootstrap extends LifeCycle {
  override def init(context: ServletContext) {
    context mount (new TemplateExample, "/*")
  }
}
```

The ScalatraBootstrap can be in [the usual place](../../getting-started/project-structure.html),
but if you would like to specify a specific package and class, you can do so
with an init parameter:

```scala
    ...
    context setContextPath "/"
    context.setResourceBase("src/main/webapp")
    context.setInitParameter(ScalatraListener.LifeCycleKey, "org.yourdomain.project.ScalatraBootstrap")
    context.addEventListener(new ScalatraListener)
    ...
```

You'll also need to ensure that the `jetty-webapp` library dependency in `project/build.scala`
contains a `compile` directive. Assuming your jetty-webapp declaration looks something
like this:

```scala
"org.eclipse.jetty" % "jetty-webapp" % "8.1.8.v20121106" % "container",
```

change `container` to `container;compile`:

```scala
"org.eclipse.jetty" % "jetty-webapp" % "8.1.8.v20121106" % "container;compile",
```

With the [sbt-assembly](https://github.com/sbt/sbt-assembly) plugin you can make a launchable jar.
Now save this alongside your Scalatra project as JettyLauncher.scala and run
<code>sbt clean assembly</code>. You'll have the ultimate executable jar file
in the target soon. Try

```bash
java -jar **-assembly-**.jar
```

and see it will launch the embedded Jetty at port 8080 with the example
Scalatra project running. On an OS X 10.6 machine with JVM 1.6, this setup
costs ~38MB memory.
