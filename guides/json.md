Scalatra makes JSON handling quick and easy. By adding a few library imports and several lines of code, you can get automatic JSON serialization and deserialization for any Scala case class.

Let's say you've generated a brand-new Scalatra project, and accepted all the defaults, except you've used "FlowersController" instead of "MyScalatraServlet" for the servlet name. Then you trim things down so you've got a bare controller like this one:

```scala
package com.example.app

import org.scalatra._

class FlowersController extends ScalatraServlet {

}
```

This assumes that your ScalatraBootstrap file, in `src/main/scala/ScalatraBootstrap.scala, looks like this:

```scala
import com.example.app._
import org.scalatra._
import javax.servlet.ServletContext

class ScalatraBootstrap extends LifeCycle {
  override def init(context: ServletContext) {
    context.mount(new FlowersController, "/*")
  }
}
```

We can quickly add a Flower model underneath our controller class, so that we've got a data model to play with:

```scala
// A Flower object to use as a faked-out data model
case class Flower(slug: String, name: String)
```

If you wanted your application to be more structured, you might put that into a `models` directory. However, we're not too concerned about that for the purposes of this tutorial, so let's just put it in FlowersController.scala file for now.

Now that you've got a model, let's add a data store. To keep things as simple as possible, we can just make a List of Flower objects, and hang them off of an object. Put this at the bottom of FlowersController.scala:

```scala
object FlowerData {

  /**
   * Some fake flowers data so we can simulate retrievals.
   */
  var all = List(
      Flower("yellow-tulip", "Yellow Tulip"),
      Flower("red-rose", "Red Rose"),
      Flower("black-rose", "Black Rose"))
}
```

Let's see if everything is working. Add the following action to your FlowersController:

```scala
get("/"){
  FlowerData.all
}
```

If you hit your local server on [http://localhost:8080](http://localhost:8080), you should see the following output:

```scala
List(Flower(yellow-tulip,Yellow Tulip), Flower(red-rose,Red Rose), Flower(black-rose, Black Rose))
```

What's going on here? Scalatra has converted the `FlowerData.all` value to a string and rendered its Scala source representation as the response. This is the default behaviour, but in fact we don't want things to work this way - we want to use JSON as our data interchange format.

Let's get that working.

In order to use Scalatra's JSON features, we'll need to add a couple of library dependencies so that our application can access some new code. 

The first thing you'll need is Scalatra's JSON handling library. The second thing you'll need is [json4s](http://json4s.org/), which is a unified wrapper around the various Scala JSON libraries. We'll use the json4s-jackson variant, which uses the [jackson](http://jackson.codehaus.org/) library as the basis of its json support. 

In the root of your generated project, you'll find a file called `build.sbt`. Open that up, and add the following two lines to the `libraryDependencies` sequence, after the other scalatra-related lines:

```scala
  "org.scalatra" % "scalatra-json" % "2.2.0",
  "org.json4s"   %% "json4s-jackson" % "3.0.0",
```

Restart sbt to download the new jars. 

Add the following imports to the top of your FlowersController file, in order to make the new JSON libraries available:

```
// JSON-related libraries
import org.json4s.{DefaultFormats, Formats}

// JSON handling support from Scalatra
import org.scalatra.json._
```

Now we can add a bit of magic to the FlowersController. Putting this line of code right underneath the controller class definition will allow your controller to automatically convert Scalatra action results to JSON:

```
  // Sets up automatic case class to JSON output serialization, required by
  // the JValueResult trait.
  protected implicit val jsonFormats: Formats = DefaultFormats
```

Just like its Sinatra forebear, Scalatra has a rich set of constructs for running things before and after requests to your controllers. A `before` filter runs before all requests. Add a `before` filter to set all output for this controller to set the content type for all action results to JSON:

```scala
  // Before every action runs, set the content type to be in JSON format.
  before() {
    contentType = formats("json")
  }
```

Now mix `JacksonJsonSupport` and `JValueResult` into your servlet so your controller declaration looks like this:

```
class FlowersController extends ScalatraServlet with JacksonJsonSupport with JValueResult {
```

Your code should compile again at this point. Refresh your browser at [http://localhost:8080/flowers](http://localhost:8080/flowers), and suddenly the output of your `/` action has changed to JSON:

```json
[{"slug":"yellow-tulip","name":"Yellow Tulip"},{"slug":"red-rose","name":"Red Rose"},{"slug":"black-rose","name":"Black Rose"}]
```

The `JValueResult` and `JsonJacksonSupport` traits which we mixed into the controller, combined with the `implicit val jsonFormats`, are now turning all Scalatra action result values into JSON.

Inbound JSON can work the same way.

TODO: find out how to make it work :).

