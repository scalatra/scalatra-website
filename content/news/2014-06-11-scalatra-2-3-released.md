---
title: "Scalatra 2.3.0 released"
author: Dave Hrycyszyn
twitter: futurechimp
date: 2014-06-11
aliases:
    - /2014/06/11/scalatra-2-3-released.html
---

The Scalatra team is pleased to announce the release of Scalatra 2.3.0.

<!--more-->

### Core

* Breaking: Scalatra 2.3.x drops support for Scala 2.9.
* Breaking: Require java 7
* Breaking: if you have custom route transformer hooks the function now needs a param type

Before:

```
protected def swaggerMeta(s: Symbol, v: Any): RouteTransformer = { route ⇒
    route.copy(metadata = route.metadata + (s -> v))
}
```

Now:

```
protected def swaggerMeta(s: Symbol, v: Any): RouteTransformer = { (route: Route) ⇒
    route.copy(metadata = route.metadata + (s -> v))
}
```

* Updates to servlet 3.1
* Change FutureSupport.timeout from a Timeout to a Duration.
* Add a timeout to AsyncResult.
* Run callbacks before render in renderResponseBody.
* Redirect returns Nothing, not unit.
* Allow calling halt from trap handler.
* Remove Akka dependency. Only scala.concurrent is needed.
* Stack trace of uncaught exceptions only renders in development mode by default. Hook renderUncaughtException is now protected.
* Render unhandled exceptions from failed Futures.
* Fix #342: Verify that gzip Content-Encoding header gets added only once
* Fix #349: Fix css mime type detection
* Fix #351: Fix ScalatraServlet.requestPath for encoded unicode URI
* Added support for loadOnStartup when mounting servlets
* Moved function to retrieve environment to RichServletContext
* Fix #277: Only catch ClassNotFoundException in ScalatraBootstrap
* Fix #319: responseFormat crashes with unrecognized MIME type
* Fix #296: Check for http again when generating a full url

### Atmosphere

* Make ScalatraBroadcaster a trait for custom broadcasters.
* Add RedisScalatraBroadcaster.
* Support ClientFilter with Redis Atmosphere plugin.
* Don’t kill httpsession on atmosphere disconnect.
* Fix Atmosphere: raise the connected event a little bit later to avoid a race
* Scalatra broadcaster logs at trace level instead of info level
* Update to atmosphere 2.1
* Fix #271: Make atmoshpere client Serializable
* Make connection string for RedisScalatraBroadcaster configurable
* improve error message when no Get route is defined while using AtmosphereSupport
* Fix NPE in AtmosphereClient when looking up an unknown broadcaster
* simplify TrackMessageSizeInterceptor configuration

### Commands

* Ensure ordering of properties on body parameters from a command by adding a position method.

### I18n

* Provide a way to implement custom Messages resolver.

### JSON

* Support custom serializers in JValueResult.
* Check if response is JSON or XML in renderJson.
* Update json4s to 3.2.10
* Use the character encoding from the request to read the json input stream.

### Scalate

* Don’t always render the Scalate Error page.
* Fix #336: Only use a single scalate template engine

### Spring

* New support module for Spring.

### Swagger

* BREAKING Use 1.2 spec.
* Add naive exclusion based on simple class name and known model ID.
* Add apiOperation and parameter methods that use a swagger model declaration directly.
* Fix detection of default value.
* Fix Option data type on models.
* Fix NPE when the model property has a default value of null.
* Fix URL generation when a context path is set.
* Fix serialization of data type for operations and parameters.
* Fix Option[List[_]] reflection.
* Output position in Swager spec so model properties have a stable order.
* Annotated properties are required by default.
* Force compilation error for apiOperation without type param.
* Add a form param to swagger support
* Fix swagger to support application names that have a ‘/’ in them
* Fix #354: Don’t stackoverflow in swagger with a self-referencing model
