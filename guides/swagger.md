---
layout: default
title: Scalatra Guides | Swagger
---

<div class="page-header">
  <h1>Swagger Support</h1>
</div>

## What is Swagger?

[Swagger](http://swagger.wordnik.com) is a specification which allows you to quickly define the functionality of a REST API using JSON documents. But it's more than just a spec. It provides automatic generation of interactive API docs, client-side code generation in multiple languages, and server-side code generation in Java and Scala.

It's not easy to describe, but it is easy to understand once you see it.  Take a look at the Swagger demo app now:

[http://petstore.swagger.wordnik.com](http://petstore.swagger.wordnik.com)

Swagger support is one of the most exciting new features in Scalatra 2.2. Let's take a look at how it all works. We can use the JSON demonstration app from the JSON guide as a starting point. That app looks like this:

```scala
package com.example.app

import org.scalatra._

// JSON-related libraries
import org.json4s.{DefaultFormats, Formats}

// JSON handling support from Scalatra
import org.scalatra.json._

class FlowersController extends ScalatraServlet with JacksonJsonSupport with JValueResult {

  // Sets up automatic case class to JSON output serialization, required by
  // the JValueResult trait.
  protected implicit val jsonFormats: Formats = DefaultFormats

  // Before every action runs, set the content type to be in JSON format.
  before() {
    contentType = formats("json")
  }

  get("/"){
    FlowerData.all
  }

}


// A Flower object to use as a faked-out data model
case class Flower(slug: String, name: String)

// An amazing datastore!
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

Don't forget to add the JSON libraries to your build.sbt file to make this work:

```scala
  "org.scalatra" % "scalatra-json" % "2.2.0-SNAPSHOT",
  "org.json4s"   %% "json4s-jackson" % "3.0.0",
```

The output from hitting this app on [http://localhost:8080/](http://localhost:8080), looks like this:

```json
[{"slug":"yellow-tulip","name":"Yellow Tulip"},{"slug":"red-rose","name":"Red Rose"},{"slug":"black-rose","name":"Black Rose"}]
```

Scalatra has found all the flowers for us and returned the data. Looking at what we've got so far, though, it's not a very descriptive API. What resource is actually being retrieved? It's not possible to tell by looking at the URL. Let's change that.

## Setting the mount path for better API clarity

Every Scalatra application has a file called `ScalatraBootstrap.scala`, located in the `src/main/scala` directory. This file allows you to mount your controllers at whatever url paths you want. If you open yours right now, it'll look something like this:

```scala
import com.example.swagger.sample._
import org.scalatra._
import javax.servlet.ServletContext

class ScalatraBootstrap extends LifeCycle {
  override def init(context: ServletContext) {
    context.mount(new FlowersController, "/*")
  }
}
```

Let's change it a bit, adding a route namespace to the FlowersController:

```scala
import com.example.swagger.sample._
import org.scalatra._
import javax.servlet.ServletContext

class ScalatraBootstrap extends LifeCycle {

  override def init {
    context.mount(new FlowersController, "/flowers")
  }
}
```

The only change was to replace the "/*" mount point with "/flowers". Easy enough. Let's make sure it works. Hit the url [http://localhost:8080/flowers](http://localhost:8080/flowers) in your browser, and you should once again see the same results as before:

```json
[{"slug":"yellow-tulip","name":"Yellow Tulip"},{"slug":"red-rose","name":"Red Rose"},{"slug":"black-rose","name":"Black Rose"}]
```

This is a much more descriptive URL path. Clients can now understand that they're operating on a `flower` resource.


## Making the flowers API searchable

Next, let's make our API searchable. We want to be able to search for flowers by name and get a list of results matching the query. The easiest way to do this is with some pattern matching inside the `/` in our controller.

Currently that route looks like this:

```scala
  get("/"){
    FlowerData.all
  }
```

We can change it to read a query string parameter, and search inside our list of flowers.

```scala
  /*
   * Retrieve a list of flowers
   */
  get("/"){
    params.get("name") match {
      case Some(name) => FlowerData.all filter (_.name.toLowerCase contains name.toLowerCase())
      case None => FlowerData.all
    }
  }
```

Scalatra can now take any incoming `?name=foo` parameter off the query string, and make it available to this action as the variable `name`, then filter the FlowerData list for matching results.

If you refresh your browser at [http://localhost:8080/flowers](http://localhost:8080/flowers), you should see no change - all flowers are returned. However, if you point your browser at [http://localhost:8080/flowers?name=rose](http://localhost:8080/flowers?name=rose), you'll see only the roses.

## Retrieving a single flower by its slug

The last controller method we'll create for the moment is one that retrieves a specific flower. We can easily retrieve a flower by its slug, like this:

```scala
  get("/:slug") {
    FlowerData.all find (_.slug == params("slug")) match {
      case Some(b) => b
      case None => halt(404)
    }
  }
```

Once again, we're using Scala's pattern matching to see whether we can find a matching slug. If we can't find the desired flower, the action returns a 404 and halts processing.

You can see the API's output by pointing your browser at a slug, e.g. [http://localhost:8080/flowers/yellow-tulip](http://localhost:8080/flowers/yellow-tulip)

```json
{"slug":"yellow-tulip","name":"Yellow Tulip"}
```

## Swagger: A quick introduction

Making the API's methods, parameters, and responses visible, in an engaging, easy to understand way, can transform the process of building REST APIs. The people at [Wordnik][wordnik], the word meanings site, have built a toolset called [Swagger][swagger], which can help with this.

[wordnik]: http://wordnik.com
[swagger]: http://swagger.wordnik.com

Swagger is a specification for documenting the behaviour of a REST API - the API's name, what resources it offers, available methods and their parameters, and return values. The specification can be used in a standalone way to describe your API using simple JSON files. With a little help from annotations, Swagger-compatible frameworks can also generate all the Swagger output necessary to give you auto-generated, functional documentation.

### The Swagger resources file

If you want to, you can write a Swagger JSON description file by hand. A Swagger resource description for our FlowersController might look like this (don't bother doing so, though, because we'll see how to automate this in a moment):

```json
{"basePath":"http://localhost:8080","swaggerVersion":"1.0","apiVersion":"1","apis":[{"path":"/api-docs/flowers.{format}","description":"The flowershop API. It exposes operations for browing and searching lists of flowers"}]}
```

This file describes what APIs we're offering. Each API has its own JSON descriptor file which details what resources it offers, the paths to those resources, required and optional parameters, and other information.

### A sample Swagger resource file

The descriptor for our `flower` resource might look something like this. Again,
we'll see how to automate the generation of this code in a moment:

```json
{"resourcePath":"/","listingPath":"/api-docs/flowers","description":"The flowershop API. It exposes operations for browing and searching lists of flowers","apis":[{"path":"//","description":"","secured":true,"operations":[{"httpMethod":"GET","responseClass":"List[Flower]","summary":"Show all flowers","notes":"Shows all the flowers in the flower shop. You can search it too.","deprecated":false,"nickname":"getFlowers","parameters":[{"name":"name","description":"A name to search for","required":false,"paramType":"query","allowMultiple":false,"dataType":"string"}],"errorResponses":[]}]},{"path":"//{slug}","description":"","secured":true,"operations":[{"httpMethod":"GET","responseClass":"Flower","summary":"Find by slug","notes":"Returns the flower for the provided slug, if a matching flower exists.","deprecated":false,"nickname":"findBySlug","parameters":[{"name":"slug","description":"Slug of flower that needs to be fetched","required":true,"paramType":"path","allowMultiple":false,"dataType":"string"}],"errorResponses":[]}]}],"models":{"Flower":{"id":"Flower","description":"Flower","properties":{"name":{"description":null,"enum":[],"required":true,"type":"string"},"slug":{"description":null,"enum":[],"required":true,"type":"string"}}}},"basePath":"http://localhost:8080","swaggerVersion":"1.0","apiVersion":"1"}
```

These JSON files can then be offered to a standard HTML/CSS/JavaScript client to make it easy for people to browse the docs. It's extremely impressive - take a moment to view the [Swagger Pet Store][petstore] example. Click on the route definitions to see what operations are available for each resource. You can use the web interface to send live test queries to the API, and view the API's response to each query.

[petstore]: http://petstore.swagger.wordnik.com

### Swagger integration

Let's get back to the spec files. In addition to enabling automatic documentation as in the Pet Store example, these JSON files allow client and server code to be automatically generated, in multiple languages.

Scalatra's Swagger integration allow you to annotate the code within your RESTful API in order to automatically generate JSON descriptors which are valid Swagger specs. This means that once you annotate your API methods, you get some very useful (and pretty) documentation capabilities for free, using the [swagger-ui][ui]. You also get the ability to generate client and server code in multiple languages, using the [swagger-codegen][codegen] project. Client code can be generated for Flash, Java, JavaScript, Objective-C, PHP, Python, Python3, Ruby, or Scala.

[ui]:https://github.com/wordnik/swagger-ui
[codegen]:https://github.com/wordnik/swagger-codegen

## Setting up the Scalatra Flower Shop with Swagger

Let's annotate our Scalatra flowershop with Swagger, in order to auto-generate runnable API documentation.

### Add the dependencies

First, add the Swagger dependencies to your `build.sbt` file, then restart your app to grab the new jars:

```scala
"com.wordnik"  % "swagger-core_2.9.1"  % "1.1-SNAPSHOT",
"org.scalatra" % "scalatra-swagger"  % "2.2.0-SNAPSHOT",
```

You'll now need to import Scalatra's Swagger support into your FlowersController:

```scala
// Swagger support
import org.scalatra.swagger._
```

### Auto-generating the resources.json spec file

Any Scalatra application which uses Swagger support must implement a Swagger controller. Those JSON specification files, which we'd otherwise need to write by hand, need to be served by something, after all. Let's add a standard Swagger controller to our application. Drop this code into a new file next to your FlowersController.scala. You can call it FlowersSwagger.scala

_FlowersSwagger.scala_

```scala
package com.example.swagger.sample

import org.scalatra.swagger.{JacksonSwaggerBase, Swagger, SwaggerBase}

import org.scalatra.ScalatraServlet
import com.fasterxml.jackson.databind._
import org.json4s.jackson.Json4sScalaModule
import org.json4s.{DefaultFormats, Formats}

class ResourcesApp(implicit val swagger: Swagger) extends ScalatraServlet with JacksonSwaggerBase

class FlowersSwagger extends Swagger("1.0", "1")
```

That code basically gives you a new controller which will automatically produce Swagger-compliant JSON specs for every Swaggerized API method in your application.

The rest of your application doesn't know about it yet, though. In order to get everything set up properly, you'll need to change your ScalatraBootstrap file so that the container knows about this new servlet. Currently it looks like this:

```scala
import com.example.swagger.sample._
import org.scalatra._
import javax.servlet.ServletContext

class ScalatraBootstrap extends LifeCycle {
  override def init(context: ServletContext) {
    context.mount(new FlowersController, "/flowers")
  }
}

```

Change the class body to look like this:

```scala
class ScalatraBootstrap extends LifeCycle {

  implicit val swagger = new FlowersSwagger

  override def init(context: ServletContext) {
    context mount(new FlowersController, "/flowers")
    context mount (new ResourcesApp, "/api-docs")
  }
}
```

### Adding SwaggerSupport to the FlowersController

Then we can add some code to enable Swagger on your FlowersController. Currently, your FlowersController declaration should look like this:

```scala
class FlowersController extends ScalatraServlet with JacksonJsonSupport 
  with JValueResult {
```

Let's add the SwaggerSupport trait, and also make the FlowerController aware of Swagger in its constructor.

```scala
class FlowersController(implicit val swagger: Swagger) extends ScalatraServlet 
  with JacksonJsonSupport with JValueResult with SwaggerSupport {
```

In order to make our application compile again, we'll need to add a name and description to our FlowersController. This allows Swagger to inform clients what our API is called, and what it does. You can do this by adding the following code to the body of the FlowersController class:

```scala
  override protected val applicationName = Some("flowers")
  protected val applicationDescription = "The flowershop API. It exposes operations for browsing and searching lists of flowers, and retrieving single flowers."
```

That's pretty much it for setup. Now we can start documenting our API's methods.


### Annotating API methods

Swagger annotations are quite simple in Scalatra. You decorate each of your routes with a bit of information, and Scalatra generates the JSON spec for your route.

Let's do the `get("/")` route first.

Right now, it looks like this:

```scala
  get("/"){
    params.get("name") match {
      case Some(name) => FlowerData.all filter (_.name.toLowerCase contains name.toLowerCase)
      case None => FlowerData.all
    }
  }
```

We'll need to add some information to the method in order to tell Swagger what this method does, what parameters it can take, and what it responds with.

```scala
  get("/",
    summary("Show all flowers"),
    nickname("getFlowers"),
    responseClass("List[Flower]"),
    parameters(Parameter("name", "A name to search for", DataType.String, paramType = ParamType.Query, required = false)),
    endpoint(""),
    notes("Shows all the flowers in the flower shop. You can search it too.")){
    params.get("name") match {
      case Some(name) => FlowerData.all filter (_.name.toLowerCase contains name.toLowerCase)
      case None => FlowerData.all
    }
  }
```

Let's go through the annotations in detail.

The `summary` and `notes` should be human-readable messages that you intend to be read by developers of API clients. The summary is a short description, while the notes should offer a longer description and include any noteworthy features which somebody might otherwise miss.

The `nickname` is intended as a machine-readable key which can be used by client code to identify this API action - it'll be used, for instance, by swagger-ui to generate method names. You can call it whatever you want, but make sure you don't include any spaces in it, or client code generation will probably fail - so "getFlowers" or "get_flowers" is fine, "get flowers" isn't.

The `responseClass` is essentially a type annotation, so that clients know what data types to expect back. In this case, clients should expect a List of Flower objects.

The `parameters` details any parameters that may be passed into this route, and whether they're supposed to be part of the path, post params, or query string parameters. In this case, we define an optional query string parameter called `name`, which matches what our action expects.

Lastly, the `endpoint` annotation defines any special parameter substitution or additional route information for this method. This particular route is pretty straightforward, so we can leave this blank.

We can do the same to our `get(/:slug)` route. Change it from this:

```scala
  get("/:slug") {
    FlowerData.all find (_.slug == params("slug")) match {
      case Some(b) => b
      case None => halt(404)
    }
  }
```

to this:

```scala
  get("/:slug",
    summary("Find by slug"),
    nickname("findBySlug"),
    responseClass("Flower"),
    endpoint("{slug}"),
    notes("Returns the flower for the provided slug, if a matching flower exists."),
    parameters(
      Parameter("slug", "Slug of flower that needs to be fetched",
        DataType.String,
        paramType = ParamType.Path))) {
    FlowerData.all find (_.slug == params("slug")) match {
      case Some(b) => b
      case None => halt(404)
    }
  }
```

The Swagger annotations here are mostly similar to those for the `get("/")` route. There are a few things to note.

The `endpoint` this time is defined as `{slug}`. The braces tell Swagger that it should substitute the contents of a path param called `{slug}` into any generated routes (see below for an example). Also note that this time, we've defined a `ParamType.Path`, so we're passing the `slug` parameter as part of the path rather than as a query string. Since we haven't set the `slug` parameter as `required = false`, as we did for the `name` parameter in our other route, Swagger will assume that slugs are required.

Now let's see what we've gained.

Adding Swagger support to our application, and the Swagger annotations to our FlowersController, means we've got some new functionality available. Check the following URL in your browser:

[http://localhost:8080/api-docs/resources.json](http://localhost:8080/api-docs/resources.json)

You should see an auto-generated Swagger description of available APIs (in this case, there's only one, but there could be multiple APIs defined by our application and they'd all be noted here):

```json
{"basePath":"http://localhost:8080","swaggerVersion":"1.0","apiVersion":"1","apis":[{"path":"/api-docs/flowers.{format}","description":"The flowershop API. It exposes operations for browing and searching lists of flowers"}]}
```

### Browsing your API using swagger-ui

If you browse to [http://petstore.swagger.wordnik.com/](http://petstore.swagger.wordnik.com/), you'll see the default Swagger demo application - a Pet Store - and you'll be able to browse its documentation. One thing which may not be immediately obvious is that you can use this app to browse our local Flower Shop as well.

The Pet Store documentation is showing because http://petstore.swagger.wordnik.com/api/resources.json is entered into the URL field by default.

Paste your Swagger resource descriptor URL - `http://localhost:8080/api-docs/resources.json` - into the URL field, delete the "special-key" key, then press the "Explore" button. You'll be rewarded with a fully Swaggerized view of your API documentation. Try clicking on the "GET /flowers" route to expand the operations underneath it, and then entering the word "rose" into the input box for the "name" parameter. You'll be rewarded with JSON output for the search method we defined earlier.

Also note that the swagger-ui responds to input validation: you can't try out the `/flowers/{slug}` route without entering a slug, because we've marked that as a required parameter in our Swagger annotations. Note that when you enter a slug such as "yellow-tulip", the `"{slug}"` endpoint annotation on this route causes the swagger-ui to fire the request as `/flowers/yellow-tulip`.

If you want to host your own customized version of the docs, you can of course just download the [swagger-ui](https://github.com/wordnik/swagger-ui) code from Github and drop it onto any HTTP server.

### A note on cross-origin security

Interestingly, you are able to use the remotely-hosted documentation browser at http://petstore.swagger.wordnik.com to browse an application on http://localhost. Why is this possible? Shouldn't JavaScript security restrictions have come into play here?

The reason it works is that Scalatra has Cross-Origin Resource Sharing (CORS) support built-in, allowing cross-origin JavaScript requests by default for all requesting domains. This makes it easy to serve JS API clients - but if you want, you can lock down requests to specific domains using Scalatra's CorsSupport trait. See the Scalatra [Helpers](http://scalatra.org/2.2/guides/helpers.html) documentation for more.

## Sample code

You can download and run a working version of this application by doing a `git clone https://github.com/futurechimp/flowershop.git`, and running `sbt` in the top-level of the project. 
