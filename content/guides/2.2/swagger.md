---
aliases:
  - /2.2/guides/swagger.html
title: Swagger
---

### What is Swagger?

[Swagger](http://swagger.wordnik.com) is a specification which allows you to quickly define the functionality of a REST API using JSON documents. But it's more than
just a spec. It provides automatic generation of interactive API docs,
client-side code generation in multiple languages, and server-side code generation
in Java and Scala.

It's not easy to describe, but it is easy to understand once you see it.  Take a look at the Swagger demo app now:

[http://petstore.swagger.wordnik.com](http://petstore.swagger.wordnik.com)

Swagger support is one of the most exciting new features in Scalatra 2.2. This
guide will walk you through the process of taking a simple Scalatra application
and adding Swagger to it, so that your runnable documentation automatically stays
in sync with your API.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="https://github.com/scalatra/scalatra-website-examples/tree/master/2.2/swagger-example">swagger-example</a>
  for a minimal and standalone project containing the example in this guide.
</div>

### Application setup

We'll start with an app looks like this:

#### Controller and data store

```scala
package org.scalatra.example.swagger

import org.scalatra._

// JSON-related libraries
import org.json4s.{DefaultFormats, Formats}

// JSON handling support from Scalatra
import org.scalatra.json._

class FlowersController extends ScalatraServlet with NativeJsonSupport {

  // Sets up automatic case class to JSON output serialization
  protected implicit val jsonFormats: Formats = DefaultFormats

  // Before every action runs, set the content type to be in JSON format.
  before() {
    contentType = formats("json")
  }

  /*
   * Retrieve a list of flowers
   */
  get("/"){
    params.get("name") match {
      case Some(name) => FlowerData.all filter (_.name.toLowerCase contains name.toLowerCase())
      case None => FlowerData.all
    }
  }

  /**
   * Find a flower using its slug.
   */
  get("/:slug") {
    FlowerData.all find (_.slug == params("slug")) match {
      case Some(b) => b
      case None => halt(404)
    }
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
#### Dependencies

Don't forget to add the JSON libraries to your `project/build.scala` file to make this work:

```scala
  "org.scalatra" %% "scalatra-json" % "{{< 2-2-scalatra_version >}}",
  "org.json4s"   %% "json4s-native" % "{{< 2-2-json4s_version >}}",
```

#### Namespacing the controller

Every Scalatra application has a file called `ScalatraBootstrap.scala`, located in the `src/main/scala` directory. This file allows you to mount your controllers at whatever url paths you want.

Set yours so that there's a route namespace for the FlowersController:

```scala
import org.scalatra.example.swagger._
import org.scalatra.LifeCycle
import javax.servlet.ServletContext

class ScalatraBootstrap extends LifeCycle {

  override def init(context: ServletContext) {
    context.mount(new FlowersController, "/flowers/*")
  }
}
```

Hit the url [http://localhost:8080/flowers](http://localhost:8080/flowers) in your browser, and you should see this output:

```json
[{"slug":"yellow-tulip","name":"Yellow Tulip"},{"slug":"red-rose","name":"Red Rose"},{"slug":"black-rose","name":"Black Rose"}]
```

Our application can also take any incoming `?name=foo` parameter off the query string, and make it available to this action as the variable `name`, then filter the FlowerData
list for matching results. If you point your browser at
[http://localhost:8080/flowers?name=rose](http://localhost:8080/flowers?name=rose),
you'll see only the roses.

We can easily retrieve a flower by its slug.  You can see the API's output by
pointing your browser at a slug, e.g.
[http://localhost:8080/flowers/yellow-tulip](http://localhost:8080/flowers/yellow-tulip)

```json
{"slug":"yellow-tulip","name":"Yellow Tulip"}
```

Now let's add some Swagger to this simple application.

### Swagger: a quick introduction

Making an API's methods, parameters, and responses visible, in an engaging, easy to understand way, can transform the process of building REST APIs.

Scalatra's Swagger support allows you to auto-generate runnable documentation
for a REST API - the API's name, what resources it offers, available methods
and their parameters, and return values.

#### Swagger spec files

Before we see the auto-generation of Swagger spec files, though, it makes sense
to understand what's being generated.

If you want to, you can write a Swagger JSON description file by hand. A
Swagger resource description for our FlowersController might look like this:

```json
{"basePath":"http://localhost:8080","swaggerVersion":"1.0","apiVersion":"1","apis":[{"path":"/api-docs/flowers.{format}","description":"The flowershop API. It exposes operations for browing and searching lists of flowers"}]}
```

This file describes what APIs we're offering. Each API has its own JSON descriptor file which details what resources it offers, the paths to those resources, required and optional parameters, and other information.

The descriptor for our `flower` resource might look something like this. We'll
see how to automate this in a moment:

```json
{"resourcePath":"/","listingPath":"/api-docs/flowers","description":"The flowershop API. It exposes operations for browing and searching lists of flowers","apis":[{"path":"/","description":"","secured":true,"operations":[{"httpMethod":"GET","responseClass":"List[Flower]","summary":"Show all flowers","notes":"Shows all the flowers in the flower shop. You can search it too.","deprecated":false,"nickname":"getFlowers","parameters":[{"name":"name","description":"A name to search for","required":false,"paramType":"query","allowMultiple":false,"dataType":"string"}],"errorResponses":[]}]},{"path":"/{slug}","description":"","secured":true,"operations":[{"httpMethod":"GET","responseClass":"Flower","summary":"Find by slug","notes":"Returns the flower for the provided slug, if a matching flower exists.","deprecated":false,"nickname":"findBySlug","parameters":[{"name":"slug","description":"Slug of flower that needs to be fetched","required":true,"paramType":"path","allowMultiple":false,"dataType":"string"}],"errorResponses":[]}]}],"models":{"Flower":{"id":"Flower","description":"Flower","properties":{"name":{"description":null,"enum":[],"required":true,"type":"string"},"slug":{"description":null,"enum":[],"required":true,"type":"string"}}}},"basePath":"http://localhost:8080","swaggerVersion":"1.0","apiVersion":"1"}
```

These JSON files can then be offered to a standard HTML/CSS/JavaScript client,
called the [swagger-ui][ui], to make it easy for people to browse the docs. If
you write them by hand, you can simply put them on any HTTP server, point the
swagger-ui client at them, and start viewing the runnable documentation.

#### Generating API clients

You also get the ability to generate client and server code
in multiple languages, using the [swagger-codegen][codegen] project.

[ui]:https://github.com/wordnik/swagger-ui
[codegen]:https://github.com/wordnik/swagger-codegen

Client code can be generated for Flash, Java, JavaScript, Objective-C, PHP, Python, Python3, Ruby, or Scala.

You may want to
take a moment to view the [Swagger Pet Store][petstore] example. Click on the
route definitions to see what operations are available for each resource. You
can use the web interface to send live test queries to the API, and view the
API's response to each query.

[petstore]: http://petstore.swagger.wordnik.com

Click on the "raw" link next to each API description, and you'll see the
Swagger spec file for the API.

### Scalatra's Swagger integration

Scalatra's Swagger integration allow you to annotate the code within your RESTful
API in order to automatically generate Swagger spec files. This means that once
you annotate your API methods, you get documentation and client code generation
for free.

#### Dependencies

First, add the Swagger dependency to your `project/build.scala` file, then restart your
app to grab the new jars:

```scala
"org.scalatra" %% "scalatra-swagger"  % "{{< 2-2-scalatra_version >}}",
```

You'll now need to import Scalatra's Swagger support into your `FlowersController`:

```scala
// Swagger support
import org.scalatra.swagger._
```

#### Auto-generating the resources.json spec file

Any Scalatra application which uses Swagger support must implement a Swagger
controller. Those JSON specification files, which we'd otherwise need to write
by hand, need to be served by something, after all. Let's add a standard Swagger
controller to our application. Drop this code into a new file next to your
`FlowersController.scala`. You can call it `FlowersSwagger.scala`:

```scala
package org.scalatra.example.swagger

import org.scalatra.swagger.{NativeSwaggerBase, Swagger}

import org.scalatra.ScalatraServlet


class ResourcesApp(implicit val swagger: Swagger) extends ScalatraServlet with NativeSwaggerBase

class FlowersSwagger extends Swagger("1.0", "1")
```

This controller will automatically produce Swagger-compliant JSON specs for
every annotated API method in your application.

The rest of your application doesn't know about it yet, though. In order to
get everything set up properly, you'll need to change your ScalatraBootstrap
file so that the container knows about this new servlet. Currently it looks
like this:

```scala
import org.scalatra.example.swagger._
import org.scalatra._
import javax.servlet.ServletContext

class ScalatraBootstrap extends LifeCycle {
  override def init(context: ServletContext) {
    context.mount(new FlowersController, "/flowers/*")
  }
}

```

Change the class body to look like this:

```scala
class ScalatraBootstrap extends LifeCycle {

  implicit val swagger = new FlowersSwagger

  override def init(context: ServletContext) {
    context mount(new FlowersController, "/flowers/*")
    context mount (new ResourcesApp, "/api-docs/*")
  }
}
```

#### Adding SwaggerSupport to the FlowersController

You'll need to enable Swagger on your `FlowersController`.

Let's add the SwaggerSupport trait to the `FlowersController`, and also make it
aware of Swagger in its constructor.

```scala
class FlowersController(implicit val swagger: Swagger) extends ScalatraServlet
  with NativeJsonSupport with SwaggerSupport {
```

In order to make our application compile again, we'll need to add a name and
description to our `FlowersController`. This allows Swagger to inform clients
what our API is called, and what it does. You can do this by adding the following
code to the body of the `FlowersController` class:

```scala
  override protected val applicationName = Some("flowers")
  protected val applicationDescription = "The flowershop API. It exposes operations for browsing and searching lists of flowers, and retrieving single flowers."
```

That's pretty much it for Swagger setup. Now we can start documenting our API's methods.


#### Annotating API methods

Swagger annotations are quite simple. You decorate each of your routes with a bit of
information, and Scalatra generates the spec file for your route.

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
  val getFlowers =
    (apiOperation[List[Flower]]("getFlowers")
      summary "Show all flowers"
      notes "Shows all the flowers in the flower shop. You can search it too."
      parameter queryParam[Option[String]]("name").description("A name to search for"))

  get("/", operation(getFlowers)) {
    params.get("name") match {
      case Some(name) => FlowerData.all filter (_.name.toLowerCase contains name.toLowerCase)
      case None => FlowerData.all
    }
  }
```

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  Make sure you initialize the val for your apiOperation before attempting to
  use it in as part of a route definition! Otherwise you'll get a 503 error
  when attempting to hit your route.
</div>


Let's go through the annotations in detail.

The `summary` and `notes` should be human-readable messages that you intend to be read by developers of API clients. The summary is a short description, while the notes should offer a longer description and include any noteworthy features which somebody might otherwise miss.

The `nickname` is intended as a machine-readable key which can be used by client code to identify this API action - it'll be used, for instance, by swagger-ui to generate JavaScript method names. You can call it whatever you want, but make sure you don't include any spaces in it, or client code generation will probably fail - so "getFlowers" or "get_flowers" is fine, "get flowers" isn't.

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
  val findBySlug =
    (apiOperation[Flower]("findBySlug")
      summary "Find by slug"
      parameters (
        pathParam[String]("slug").description("Slug of flower that needs to be fetched")
      ))

  get("/:slug", operation(findBySlug)) {
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

#### Browsing your API using swagger-ui

If you browse to [http://petstore.swagger.wordnik.com/](http://petstore.swagger.wordnik.com/), you'll see the default Swagger demo application - a Pet Store - and you'll be able to browse its documentation. One thing which may not be immediately obvious is that you can use this app to browse our local Flower Shop as well.

The Pet Store documentation is showing because http://petstore.swagger.wordnik.com/api/resources.json is entered into the URL field by default.

Paste your Swagger resource descriptor URL - `http://localhost:8080/api-docs/resources.json` - into the URL field, delete the "special-key" key, then press the "Explore" button. You'll be rewarded with a fully Swaggerized view of your API documentation. Try clicking on the "GET /flowers" route to expand the operations underneath it, and then entering the word "rose" into the input box for the "name" parameter. You'll be rewarded with JSON output for the search method we defined earlier.

Also note that the swagger-ui responds to input validation: you can't try out the `/flowers/{slug}` route without entering a slug, because we've marked that as a required parameter in our Swagger annotations. Note that when you enter a slug such as "yellow-tulip", the `"{slug}"` endpoint annotation on this route causes the swagger-ui to fire the request as `/flowers/yellow-tulip`.

If you want to host your own customized version of the docs, you can of course just download the [swagger-ui](https://github.com/wordnik/swagger-ui) code from Github and drop it onto any HTTP server.

### A note on cross-origin security

Interestingly, you are able to use the remotely-hosted documentation browser at http://petstore.swagger.wordnik.com to browse an application on http://localhost. Why is this possible? Shouldn't JavaScript security restrictions have come into play here?

The reason it works is that Scalatra has Cross-Origin Resource Sharing (CORS) support mixed into its SwaggerSupport trait, allowing cross-origin JavaScript requests by default for all requesting domains. This makes it easy to serve JS API clients - but if you want, you can lock down requests to specific domains using Scalatra's CorsSupport trait. See the Scalatra [Helpers](../guides/web-services/cors.html) documentation for more.
