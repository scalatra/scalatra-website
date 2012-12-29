---
layout: default
title: Deploying to Heroku | Deployment | Scalatra
---

<div class="page-header">
  <h1>Deploying to Heroku</h1>
</div>

[Heroku](http://www.heroku.com/) is a cloud application platform that makes it easy to deploy and scale applications. With the right project setup, deploying your application becomes as easy as `git push`.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="{{site.examples}}deployment/scalatra-heroku">scalatra-heroku</a>
  for a minimal and standalone project containing the example in this guide.
</div>

----

## 1. Sign up for a free a [free account](https://api.heroku.com/signup).

## 2. Install the [Heroku Toolbelt](https://toolbelt.herokuapp.com/).

## 3. Set up a project.

Create a Scalatra project from the usual Scalatra giter8 template.
Check out the the [installation]({{site.baseurl}}getting-started/installation.html) and [first project]({{site.baseurl}}getting-started/first-project.html) guides if this isn't familiar.

```bash
$ g8 scalatra/scalatra-sbt -b develop
```

## 4. Tweak the app for Heroku

### Make Jetty embeddable

Open `build.sbt` in the root of your project. You will find two lines like these:

```scala
"org.eclipse.jetty" % "jetty-webapp" % "{{ site.jetty_version }}" % "container",
"org.eclipse.jetty.orbit" % "javax.servlet" % "{{ site.servlet_version }}" % "container;provided;test" artifacts (Artifact("javax.servlet", "jar", "jar"))
```

Those are basically right, but we need to add `compile` scope because Heroku is not a servlet host. It can only run your app via an embedded Jetty server you provide. So replace the two lines above with these two:

```scala
"org.eclipse.jetty" % "jetty-webapp" % "{{ site.jetty_version }}" % "compile;container",
"org.eclipse.jetty.orbit" % "javax.servlet" % "{{ site.servlet_version }}" % "compile;container;provided;test" artifacts (Artifact("javax.servlet", "jar", "jar"))
```

### Escape sbt

You don't want to use sbt to run your app in production. We'll install an sbt plugin that will create a start script during compilation. Heroku will use that start script.

Tell sbt where to find the plugin by adding this line to `project/plugins.sbt` (you may need to create the file first):

```scala
addSbtPlugin("com.typesafe.startscript" % "xsbt-start-script-plugin" % "{{ site.start_script_plugin_version }}")
```

Tell sbt how to use the plugin by adding this line to `build.sbt`:

```scala
seq(com.typesafe.startscript.StartScriptPlugin.startScriptForClassesSettings: _*)
```

### Tell Heroku to use the generated start script

Create a file named `Procfile` in the root of your application.
Add this line:

```
web: target/start
```

### Create a `main` method

Since Heroku launches your app as a vanilla Java/Scala project, you need to create a `main` method that launches the servlet.

Create `src/main/scala/JettyLauncher.scala` with this code:

```scala
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.{ DefaultServlet, ServletContextHandler }
import org.eclipse.jetty.webapp.WebAppContext

object JettyLauncher {
  def main(args: Array[String]) {
    val port = if(System.getenv("PORT") != null) System.getenv("PORT").toInt else 8080

    val server = new Server(port)
    val context = new WebAppContext()
    context setContextPath "/"
    context.setResourceBase("src/main/webapp")
    context.addServlet(classOf[com.example.app.MyScalatraServlet], "/*")
    context.addServlet(classOf[DefaultServlet], "/")

    server.setHandler(context)

    server.start
    server.join
  }
}
```

## 5. Deploy

If you haven't set up your project as a Git repo, do so.

```bash
$ cd [app root]
$ chmod u+x sbt
$ git init
$ git add .
$ git commit -m 'first commit'
```

Log into Heroku.

```bash
$ heroku login
```

Create your Heroku endpoint and deploy to it.

```bash
$ cd [app root]
$ heroku create --stack cedar
$ git push heroku master
```

After a couple minutes of streaming output, the last few lines will look like this:

```
-----> Discovering process types
       Procfile declares types -> web
-----> Compiled slug size: 43.4MB
-----> Launching... done, v5
       http://polar-atoll-9149.herokuapp.com deployed to Heroku
              
To git@heroku.com:polar-atoll-9149.git
* [new branch]      master -> master
```

Open your browser to to the URL provided right before `deployed to Heroku` in the output.

## 6. Limitations
No app host is perfect. You should be aware of two limitations as you develop on Heroku:

- Heroku ["slugs"](https://devcenter.heroku.com/articles/slug-compiler) (deployed apps with their dependencies) are limited to 200MB.
If your project has a large number of dependencies, you may exceed this limit.
- At present, Heroku [does not support WebSockets](https://devcenter.heroku.com/articles/http-routing#websockets).

[Jelastic](jelastic.html) is another app host that does not have these limitations.
However, Jelastic does not have Heroku's special access to AWS products.
