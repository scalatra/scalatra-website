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

Save this as JettyLauncher.scala

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

The <i>TemplateExample</i> should be the <i>class</i> that <i>extends</i> the <b>Scalatra[name of module]Stack</b> <i>trait</i> 
you created inside your scala org(/src/main/scala/[your org name]/) folder. 

With the [sbt-assembly](https://github.com/sbt/sbt-assembly) plugin you can make a launchable jar.

<b>Steps before:</b>

change <code>container</code> for the <b>jetty-webapp</b> to <code>container; compile</code> inside <b>project/build.scala</b>

create a build.sbt inside the root folder with:
```scala
import AssemblyKeys._ // put this at the top of the file

assemblySettings

mergeStrategy in assembly <<= (mergeStrategy in assembly) { (old) =>
  {
    case "about.html" => MergeStrategy.rename
    case x => old(x)
  }
}
```
this fixes a bug inside the jetty jars where all of them containing a "about.html" in the root folder 
which causes conflicts.

Now you can run:
<code>sbt clean assembly</code>
and you'll will have the ultimate executable jar file
in the target soon. Try

```bash
java -jar **-assembly-**.jar
```

and see it will launch the embedded Jetty at port 8080 with the example
Scalatra project running. On an OS X 10.6 machine with JVM 1.6, this setup
costs ~38MB memory.
