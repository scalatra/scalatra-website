---
layout: default
title: Scalatra Guides | Configuration & deployment
---

<div class="page-header">
  <h1>Configuration & deployment</h1>
</div>

## Configuration

The environment is defined by:

1. The `org.scalatra.environment` system property.
2. The `org.scalatra.environment` init parameter.

<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
The default is `development`.

You can set the application's environment in the following ways:

1. As a system property: this is most commonly set with a `-D` option on the
command line: `java -Dorg.scalatra.environment=development`
2. As an init-param in the Scalatra Bootstrap file.
3. As an init-param in web.xml.

If the environment starts with "dev", then `isDevelopmentMode` returns true.

In development mode, a few things happen.

1. In a ScalatraServlet, the notFound handler is enhanced so that it dumps the
effective request path and the list of routes it tried to match. This does not
happen in a ScalatraFilter, which just delegates to the filterChain when no
route matches.
2. Meaningful error pages are enabled (e.g. on 404s, 500s).
3. The [Scalate console][console] is enabled.

[console]: http://scalate.fusesource.org/documentation/console.html

## Configuring your app using the Scalatra bootstrap file

The Scalatra bootstrap file, new in Scalatra 2.1.x, is the recommended way
of configuring your application. It allows you to easily mount different
servlets, set application parameters, and run initialization code for your
app, without touching much in the way of XML.

If you've started your project in Scalatra 2.1.x, using the giter8 template,
all of this will already be set up for you. However, if you're upgrading from
2.0.x, or you just want to understand what's going on, read on.

First, the bad news: there *is* some XML involved, because this is one of the
points where Scalatra needs to interface with Java servlets, the underlying
technology it's sitting on top of.

All Scalatra projects have a `web.xml` file, in `src/main/webapp/WEB-INF/`.
Find yours and open it.

In a regular Java servlet application, most application configuration is done
inside `web.xml`. However, Scalatra applications can drop in some standard
config code, and use regular Scala code for configuration afterwards.

The XML which allows you to do this is as follows:

{% highlight xml %}

  <?xml version="1.0" encoding="UTF-8"?>
  <web-app xmlns="http://java.sun.com/xml/ns/javaee"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
        version="3.0">
      <listener>
        <listener-class>org.scalatra.servlet.ScalatraListener</listener-class>
      </listener>

      <servlet-mapping>
        <servlet-name>default</servlet-name>
        <url-pattern>/img/*</url-pattern>
        <url-pattern>/css/*</url-pattern>
        <url-pattern>/js/*</url-pattern>
        <url-pattern>/assets/*</url-pattern>
      </servlet-mapping>
  </web-app>

{% endhighlight %}

Note that there are no servlet-names, servlet classes, etc. That stuff's all
handled dynamically by that ScalatraListener class, which will supply our actual
configuration to the underlying servlet container.

Note that there is also a file called Scalatra.scala in your `src/main/scala`
directory. The simplest version of this file, which gets generated when you
make a new project using the giter8 template, looks like this:

{% highlight scala %}

    import org.scalatra.LifeCycle
    import javax.servlet.ServletContext
    import org.yourdomain.projectname._

    class Scalatra extends LifeCycle {

      override def init(context: ServletContext) {

        // set init params like this:
        org.scalatra.cors.allowedOrigins = "http://example.com:8080 http://foo.example.com"

        // mount servlets like this:
        context mount (new ArticlesServlet, "/articles/*")
      }
    }

{% endhighlight %}

### Mounting multiple servlets (or filters)

If you've got more than one servlet or filter in your application, you'll
need to mount them.

This Scalatra class allows you to mount either servlets or filters (or both)
into your application, and define path patterns that they'll respond to.

### Setting init params

The Scalatra bootstrap file is also a good place to put things like database
initialization code, which need to be set up once in your application.

## Configuring your app using web.xml

If you're an old Java hand, you'll be quite comfortable mounting servlets
through the `web.xml` file in traditional servlet style, so you may not want
to use the Scalatra bootstrap file.

### Mounting multiple servlets (or filters)



### Setting init params

{pygmentize:: xml}
<servlet>
  <init-param>
    <param-name>org.scalatra.environment</param-name>
    <param-value>development</param-value>
  </init-param>
</servlet>
{pygmentize}


## Logging

By default, Scalatra uses [Logback][logback] for logging.

[logback]:http://logback.qos.ch

You can easily add logging facilities to your project, if you've got the
logging dependency in your `build.sbt` file:

      "ch.qos.logback" % "logback-classic" % "1.0.0" % "runtime"

In your servlet or filter class:

{% highlight scala %}

import org.slf4j.{Logger, LoggerFactory}

class YourServlet extends ScalatraServlet {

  val logger =  LoggerFactory.getLogger(getClass)

  def get("/") {
    logger.info("foo")
    // whatever else you want to put in the body of the action
  }
}

{% endhighlight %}

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


## Production deployment

### As a war file to Jetty/Tomcat/Etc

    $ sbt package
    $ mv target/example-1.0.war target/example.war
    $ scp target/example.war user@example.com:/usr/share/jetty/webapp


### As a single jar

Thanks to Riobard for this
[post](http://groups.google.com/group/scalatra-user/msg/7df47d814f12a45f) to
the mailing list.

#### Extend sbt project definition:

Copy [this piece of code](http://bit.ly/92NWdu)
(Note the link doesn't work anymore !) into your sbt project definition
(/project/build/src/your project.scala) and extend your project with the
AssemblyProject, so you should have something like this:

** SBT 0.7.X **

{% highlight scala %}

class JettyScalatraProject(info: ProjectInfo) extends DefaultProject(info) with AssemblyProject {
    override def mainClass = Some("com.example.JettyLauncher") #point this to your entry object
  val jettytester = "org.mortbay.jetty" % "jetty-servlet-tester" % "6.1.22" % "provided->default"
  val scalatest = "org.scalatest" % "scalatest" % "1.0" % "provided->default"
}

{% endhighlight %}

** SBT 0.11.x **

Create a runner for Jetty.

{% highlight scala %}

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

{% endhighlight %}

Include the "webapp" directory in the assembly Jar.

{% highlight scala %}

  resourceGenerators in Compile <+= (resourceManaged, baseDirectory) map { (managedBase, base) =>
    val webappBase = base / "src" / "main" / "webapp"
    for {
      (from, to) <- webappBase ** "*" x rebase(webappBase, managedBase / "main" / "webapp")
    } yield {
      Sync.copy(from, to)
      to
    }
  }

{% endhighlight %}


Then launch sbt or reload it if it is already running. This should give you a
new sbt command called "assembly". Try that in the sbt interactive prompt and
it should produce a ****-assembly-**.jar file in your sbt /target/scala-2.7.7
folder. All dependencies (like scala-library.jar) are included in this jar
file and you can run it directly, e.g.

{% highlight bash %}

  java -jar ***-assembly-**.jar

{% endhighlight %}

### Launching Scalatra as a servlet

ScalatraServlet is an HttpServlet, we just need some glue code to launch an
embedded Jetty server with this Servlet.

{% highlight scala %}

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

{% endhighlight %}

Now save this alongside your Scalatra project as JettyLauncher.scala and run
<code>sbt clean assembly</code>. You'll have the ultimate executable jar file
in the target soon. Try

{% highlight bash %}

  java -jar **-assembly-**.jar

{% endhighlight %}

and see it will launch the embedded Jetty at port 8080 with the example
Scalatra project running. On an OS X 10.6 machine with JVM 1.6, this setup
costs ~38MB memory.

### Heroku

This is pretty easy to get up and running. The only thing you really need to do
is start Jetty directly, and add a script to execute this. You don't want to
have to rely on SBT to start your application.

The easiest way to do this is create a Main method to start Jetty. See
JettyLauncher.scala (listing at bottom of this section) - save this in your
src/main/scala dir, setting the filter to your applications filter. Then
use Typesafe's start script plugin to generate a script to start the app.

To enable the plugin, add the following to project/plugins/build.sbt


{% highlight bash %}

  resolvers += Classpaths.typesafeResolver

  addSbtPlugin("com.typesafe.startscript" % "xsbt-start-script-plugin" % "0.5.0")

{% endhighlight %}


And the following to your build.sbt

{% highlight bash %}

  import com.typesafe.startscript.StartScriptPlugin

  seq(StartScriptPlugin.startScriptForClassesSettings: _*)

{% endhighlight %}

Once this is done, you are ready to deploy to Heroku. Create a Procfile in
the root of your project containing

    web: target/start

Commit your changes to git and make sure you have the heroku gem installed
(see Heroku's general [Scala instructions](http://devcenter.heroku.com/articles/scala)).
You can then create and push the app.

    heroku create appname --stack cedar
    git push heroku master

{% highlight scala %}

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

{% endhighlight %}

### Including the Scala compiler

If you need the Scala compiler included within a WAR file add the declaration
below to your SBT build file.

{% highlight scala %}

  override def webappClasspath = super.webappClasspath +++ buildCompilerJar

{% endhighlight %}