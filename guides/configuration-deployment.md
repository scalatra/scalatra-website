---
layout: default
title: Scalatra Guides | Configuration and Deployment
---


Logging
=======

By default, Scalatra uses [Logback][logback] for logging.

[logback]:http://logback.qos.ch

You can easily add logging facilities to your project, if you've got the
logging dependency in your `build.sbt` file:

      "ch.qos.logback" % "logback-classic" % "1.0.0" % "runtime"

In your servlet or filter class:

{pygmentize:: scala}

import org.slf4j.{Logger, LoggerFactory}

class YourServlet extends ScalatraServlet {

  val logger =  LoggerFactory.getLogger(getClass)

  def get("/") {
    logger.info("foo")
    // whatever else you want to put in the body of the action
  }
}

{pygmentize}

This will get you basic logging support. There are some additional logging
libraries you might want to investigate: [slf4s][slf4s] and
[grizzled-slf4j][grizzled-slf4j],
which act as Scala wrappers around slf4j.

[slf4s]:https://github.com/weiglewilczek/slf4s
[grizzled-slf4j]:http://software.clapper.org/grizzled-slf4j/

The Scala wrappers use by-name parameters for the log message, and
check to see that the logging level is enabled.  This is a performance
win for complex log messages involving expensive `toString`s or many
concatenations.



Production Deployment
=====================

### As a War to Jetty/Tomcat/Etc


    $ sbt package
    $ mv target/example-1.0.war target/example.war
    $ scp target/example.war user@example.com:/usr/share/jetty/webapp


### As a Single Jar

Thanks to Riobard for this
[post](http://groups.google.com/group/scalatra-user/msg/7df47d814f12a45f) to
the mailing list.

### Extend sbt project definition:

Copy [this piece of code](http://bit.ly/92NWdu)
(Note the link doesn't work anymore !) into your sbt project definition
(/project/build/src/your project.scala) and extend your project with the
AssemblyProject, so you should have something like this:

** SBT 0.7.X **
{pygmentize::scala}
class JettyScalatraProject(info: ProjectInfo) extends DefaultProject(info) with AssemblyProject {
    override def mainClass = Some("com.example.JettyLauncher") #point this to your entry object
  val jettytester = "org.mortbay.jetty" % "jetty-servlet-tester" % "6.1.22" % "provided->default"
  val scalatest = "org.scalatest" % "scalatest" % "1.0" % "provided->default"
}
{pygmentize}

** SBT 0.11.x **

Create a runner for Jetty.
{pygmentize::scala}
import org.eclipse.jetty.server._
import org.eclipse.jetty.servlet.ServletContextHandler
import org.eclipse.jetty.webapp.WebAppContext
object JettyLauncher {
  def main(args: Array[String]) {
    val Array(path, port) = args
    val server = new Server(port.toInt)
    val context = new
ServletContextHandler(ServletContextHandler.SESSIONS)
    server.setHandler(context)
    val web = new WebAppContext(path, "/")
    server.setHandler(web)
    server.start()
    server.join()
  }
}
{pygmentize}

Include the "webapp" directory in the assembly Jar.
{pygmentize::scala}
resourceGenerators in Compile <+= (resourceManaged, baseDirectory) map { (managedBase, base) =>
  val webappBase = base / "src" / "main" / "webapp"
  for {
    (from, to) <- webappBase ** "*" x rebase(webappBase, managedBase / "main" / "webapp")
  } yield {
    Sync.copy(from, to)
    to
  }
}
{pygmentize}

Then launch sbt or reload it if it is already running. This should give you a
new sbt command called "assembly". Try that in the sbt interactive prompt and
it should produce a ****-assembly-**.jar file in your sbt /target/scala-2.7.7
folder. All dependencies (like scala-library.jar) are included in this jar
file and you can run it directly, e.g.

{pygmentize::}
java -jar ***-assembly-**.jar
{pygmentize}

### Launch Scalatra as a servlet

ScalatraServlet is an HttpServlet, we just need some glue code to launch an
embedded Jetty server with this Servlet.

{pygmentize::scala}
package com.example  // remember this package in the sbt project definition
import org.mortbay.jetty.Server
import org.mortbay.jetty.servlet.{Context, ServletHolder}
import org.scalatra.TemplateExample // this is the example Scalatra servlet

object JettyLauncher { // this is my entry object as specified in sbt project definition
  def main(args: Array[String]) {
    val server = new Server(8080)
    val root = new Context(server, "/", Context.SESSIONS)
    root.addServlet(new ServletHolder(new TemplateExample), "/*")
    server.start()
    server.join()
  }
}
{pygmentize}

Now save this alongside your Scalatra project as JettyLauncher.scala and run
<code>sbt clean assembly</code>. You'll have the ultimate executable jar file
in the target soon. Try

{pygmentize::}
java -jar **-assembly-**.jar
{pygmentize}

and see it will launch the embedded Jetty at port 8080 with the example
Scalatra project running. On my machine (OS X 10.6 with JVM 1.6) this setup
costs 38MB memory.

### Scalatra on Heroku

This is pretty easy to get up and running. The only thing you really need to do
is start Jetty directly, and add a script to execute this. You don't want to
have to rely on SBT to start your application.

The easiest way to do this is create a Main method to start Jetty. See
JettyLauncher.scala (listing at bottom of this section) - save this in your
src/main/scala dir, setting the filter to your applications filter. Then
use Typesafe's start script plugin to generate a script to start the app.

To enable the plugin, add the following to project/plugins/build.sbt

{pygmentize::scala}
resolvers += Classpaths.typesafeResolver

addSbtPlugin("com.typesafe.startscript" % "xsbt-start-script-plugin" % "0.5.0")
{pygmentize}

And the following to your build.sbt

{pygmentize::scala}
import com.typesafe.startscript.StartScriptPlugin

seq(StartScriptPlugin.startScriptForClassesSettings: _*)
{pygmentize}

Once this is done, you are ready to deploy to Heroku. Create a Procfile in
the root of your project containing

    web: target/start

Commit your changes to git and make sure you have the heroku gem installed
(see Heroku's general [Scala instructions](http://devcenter.heroku.com/articles/scala)).
You can then create and push the app.

    heroku create appname --stack cedar
    git push heroku master

{pygmentize::scala}
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.{DefaultServlet, ServletContextHandler}
import org.eclipse.jetty.webapp.WebAppContext

object JettyLauncher {
  def main(args: Array[String]) {
    val port = if(System.getenv("PORT") != null) System.getenv("PORT").toInt else 8080

    val server = new Server(port)
    val context = new WebAppContext()
    context setContextPath "/"
    context.setResourceBase("src/main/webapp")
    context.addServlet(classOf[MyCedarServlet], "/*")
    context.addServlet(classOf[DefaultServlet], "/")

    server.setHandler(context)

    server.start
    server.join
  }

}
{pygmentize}

### Including Scala Compiler

If you need the Scala compiler included within a WAR file add the declaration
below to your SBT build file.

{pygmentize::scala}
override def webappClasspath = super.webappClasspath +++ buildCompilerJar
{pygmentize}
