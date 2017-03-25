---
title: Deploying to Heroku
---

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

Open `project/build.scala` in the root of your project. You will find two lines like these:

```scala
"org.eclipse.jetty" % "jetty-webapp" % "9.1.5.v20140505" % "container",
"org.eclipse.jetty" % "jetty-plus" % "9.1.5.v20140505" % "container",
```

Those are basically right, but we need to add `compile` scope because Heroku is not a servlet host. It can only run your app via an embedded Jetty server you provide. So replace the two lines above with these two:

```scala
"org.eclipse.jetty" % "jetty-webapp" % "9.1.5.v20140505" % "compile;container",
"org.eclipse.jetty" % "jetty-plus" % "9.1.5.v20140505" % "compile;container",
```

### Add the sbt Native Packager plugin

You don't want to use sbt to run your app in production. We'll install an sbt plugin that will create a start script during compilation. Heroku will use that start script. Tell sbt where to find the plugin by adding this line to `project/plugins.sbt` (you may need to create the file first):

```scala
addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager" % "1.0.0-RC1")
```

Then enable the plugin by calling the `enablePlugins` method on the `Project`
object in your `build.scala`:

```scala
import com.typesafe.sbt.packager.archetypes.JavaAppPackaging
// ...
lazy val project = Project (
// ...
).enablePlugins(JavaAppPackaging)
```

### Create a `main` method

Since Heroku launches your app without a container, you need to create a `main` method that launches the servlet.

Create `src/main/scala/JettyLauncher.scala` with this code:

```scala
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.{ DefaultServlet, ServletContextHandler }
import org.eclipse.jetty.webapp.WebAppContext
import org.scalatra.servlet.ScalatraListener

object JettyLauncher {
  def main(args: Array[String]) {
    val port = if(System.getProperty("http.port") != null) System.getProperty("http.port").toInt else 8080

    val server = new Server(port)
    val context = new WebAppContext()
    context.setContextPath("/")
    context.setResourceBase("src/main/webapp")

    context.setEventListeners(Array(new ScalatraListener))

    server.setHandler(context)

    server.start
    server.join
  }
}
```

And don't forget to set your servlet mapping (you probably already have something like this in `ScalatraBootstrap`):

```scala
context.mount(new MyScalatraServlet, "/*")
```

### Tell Heroku how to run your app (optional)

Heroku will detect the `target/universal/stage/bin/<app-name>` script generated
by sbt-native-packager, so it will know how to run your app by default.

However, you may want to customize how your app starts.  In that case, create
a `Procfile` with contents such as:

```
web: target/universal/stage/bin/<app-name> -Dhttp.port=$PORT -Dother.prop=someValue
```

And replace `<app-name>` with the name of your app defined in `build.scala`.

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
$ heroku create
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

Open your browser to to the URL provided right before `deployed to Heroku` in the output. Or just run:

```bash
$ heroku open
```

For more information on using Scala with Heroku see the [Heroku DevCenter](https://devcenter.heroku.com/articles/scala-support).
