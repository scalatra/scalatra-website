---
title: Standalone deployment
layout: guides-3.0
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
  def main(args: Array[String]): Unit = {
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
import jakarta.servlet.ServletContext
import org.scalatra.TemplateExample // this is the example Scalatra servlet

class ScalatraBootstrap extends LifeCycle {
  override def init(context: ServletContext) = {
    context.mount(new TemplateExample, "/*")
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

You'll also need to ensure that the `jetty-webapp` library dependency in `build.sbt`
contains a `compile` directive. Assuming your jetty-webapp declaration looks something
like this:

```scala
"org.eclipse.jetty" % "jetty-webapp" % "{{<3-0-jetty_version>}}" % "container",
```

change `container` to `container;compile`:

```scala
"org.eclipse.jetty" % "jetty-webapp" % "{{<3-0-jetty_version>}}" % "container;compile",
```

Note: If sbt complains that `configuration 'container'` doesn't exist, add and enable the `sbt-scalatra` to your project.   

With the [sbt-assembly](https://github.com/sbt/sbt-assembly) plugin you can make a launchable jar.
Now save this alongside your Scalatra project as JettyLauncher.scala and run
<code>sbt clean assembly</code>. You'll have the ultimate executable jar file
in the target soon. Try

```bash
java -jar **-assembly-**.jar
```

and see it will launch the embedded Jetty at port 8080 with the example Scalatra project running.
