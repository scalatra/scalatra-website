---
layout: guide
title: Standalone deployment | Deployment | Scalatra
---

<div class="page-header">
  <h1>Standalone deployment</h1>
</div>

### Launching Scalatra as a servlet

ScalatraServlet is an HttpServlet, we just need some glue code to launch an
embedded Jetty server with this Servlet.

```scala
package com.example  // remember this package in the sbt project definition
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.{DefaultServlet, ServletContextHandler}
import org.eclipse.jetty.webapp.WebAppContext
import org.scalatra.TemplateExample // this is the example Scalatra servlet

object JettyLauncher { // this is my entry object as specified in sbt project definition
  def main(args: Array[String]) {
    val port = if(System.getenv("PORT") != null) System.getenv("PORT").toInt else 8080

    val server = new Server(port)
    val context = new WebAppContext()
    context setContextPath "/"
    context.setResourceBase("src/main/webapp")
    context.addServlet(classOf[TemplateExample], "/*")
    context.addServlet(classOf[DefaultServlet], "/")

    server.setHandler(context)

    server.start
    server.join
  }
}
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
