---
aliases:
  - /2.4/guides/http/routes.html
layout: oldguide
title: Routes
---

All web applications need a way to match up the incoming HTTP request with some code to execute on the server. In Scalatra, this is done using _routes_ and _actions_.

If somebody makes a POST request to your application, at `http://www.yourapp.org/articles`, you might want to invoke code on the server which will look at the information contained in the incoming request, and use it to create a new `Article` object. The fact that it's a POST request, and the request path is `/articles`, are _route_ information. The code that you execute is the _action_.

Actions are dealt with in the [next guide](actions.html).

---

### A simple example

In Scalatra, a route is an HTTP method (GET, PUT, POST, or DELETE) paired with a URL matching pattern. If you set up your application using RESTful conventions, your controller might look something like this:

```scala
class Articles extends ScalatraServlet {

  get("/articles/:id") {  //  <= this is a route matcher
    // this is an action
    // this action would show the article which has the specified :id
  }

  post("/articles") {
    // submit/create an article
  }

  put("/articles/:id") {
    // update the article which has the specified :id
  }

  delete("/articles/:id") {
    // delete the article with the specified :id
  }
}
```

Those four example routes, and the actions inside the route blocks, could be the basis of a simple blogging system. The examples just stub out the actions - in a real application, you'd replace the `// comments` with code to save and retrieve models, and show HTML views.

### Named parameters

Route patterns may include named parameters (see below for more on parameter handling):

```scala
get("/hello/:name") {
  // Matches "GET /hello/foo" and "GET /hello/bar"
  // params("name") is "foo" or "bar"
  <p>Hello, {params("name")}</p>
}
```

### Wildcards

Route patterns may also include wildcard parameters, accessible through the
`splat` key.

```scala
get("/say/*/to/*") {
  // Matches "GET /say/hello/to/world"
  multiParams("splat") // == Seq("hello", "world")
}

get("/download/*.*") {
  // Matches "GET /download/path/to/file.xml"
  multiParams("splat") // == Seq("path/to/file", "xml")
}
```

### Regular expressions

The route matcher may also be a regular expression.  Capture groups are
accessible through the `captures` key.

```scala
get("""^\/f(.*)/b(.*)""".r) {
  // Matches "GET /foo/bar"
  multiParams("captures") // == Seq("oo", "ar")
}
```

It's likely that you'll want to anchor your regex (e.g. `^/this/that`) to make
sure that the matched URL pattern starts at the beginning of the incoming path.
There could be cases where you wouldn't want this, but they're hard to imagine.

### Rails-like pattern matching

By default, route patterns parsing is based on Sinatra.  Rails has a similar,
but not identical, syntax, based on Rack::Mount's Strexp.  The path pattern
parser is resolved implicitly, and may be overridden if you prefer an
alternate syntax:

```scala
import org.scalatra._

class RailsLikeRouting extends ScalatraFilter {
  implicit override def string2RouteMatcher(path: String) =
    RailsPathPatternParser(path)

  get("/:file(.:ext)") { // matched Rails-style }
}
```

### Path patterns in the REPL

If you want to experiment with path patterns, it's very easy in the [REPL][repl].
Simply use a Scalatra project, like one created by our
[giter8 template]({{site.baseurl}}getting-started/first-project.html).

```
$ cd [project root]
$ ./sbt
> console

scala> import org.scalatra.SinatraPathPatternParser
import org.scalatra.SinatraPathPatternParser

scala> val pattern = SinatraPathPatternParser("/foo/:bar")
pattern: PathPattern = PathPattern(^/foo/([^/?#]+)$,List(bar))

scala> pattern("/y/x") // doesn't match
res1: Option[MultiParams] = None

scala> pattern("/foo/x") // matches
res2: Option[MultiParams] = Some(Map(bar -> ListBuffer(x)))
```

Alternatively, you may use the `RailsPathPatternParser` in place of the
`SinatraPathPatternParser`.

[repl]: http://www.scala-lang.org/node/2097

### Conditions

Routes may include conditions.  A condition is any expression that returns
Boolean.  Conditions are evaluated by-name each time the route matcher runs.

```scala
get("/foo") {
  // Matches "GET /foo"
}

get("/foo", request.getRemoteHost == "127.0.0.1") {
  // Overrides "GET /foo" for local users
}
```

Multiple conditions can be chained together.  A route must match all
conditions:

```scala
get("/foo", request.getRemoteHost == "127.0.0.1", request.getRemoteUser == "admin") {
  // Only matches if you're the admin, and you're localhost
}
```

No path pattern is necessary.  A route may consist of solely a condition:

```scala
get(isMaintenanceMode) {
  <h1>Go away!</h1>
}
```

### Enabling support for PUT and DELETE requests

Scalatra supports all of the HTTP verbs: `GET` and `POST`, which are supported by
browser clients, but also `PUT` and `DELETE`, which are not.

Many client libraries use non-standard but simple conventions to indicate
that they would like the request to be considered as a `PUT` or `DELETE` instead of
a POST: for example, jQuery adds a `X-HTTP-METHOD-OVERRIDE` header to the request.

Other clients and frameworks often indicate the same thing by adding a
`_method=put` or `_method=delete` parameter to a POST body.

Scalatra will look for these conventions on incoming requests and transform
the request method automatically if you add the `MethodOverride` trait into your
servlet or filter:

```scala
class MyFilter extends ScalatraFilter with MethodOverride {

  // POST to "/foo/bar" with params "id=2" and "_method=put" will hit this route:
  put("/foo/bar/:id") {
    // update your resource here
  }
}
```


### Route order

The first matching route is invoked. Routes are matched from the *bottom up*, i.e. from the bottom of the Scala class defining your servlet to the top.
<span class="label label-warning"><i class="icon-warning-sign icon-white"></i> Watch out!</span> This is the opposite of Sinatra.
Route definitions are executed as part of a Scala constructor; by matching
from the bottom up, routes can be overridden in child classes.


### Parameter handling

Incoming HTTP request parameters become available to your actions through
two methods: `multiParams` and `params`.

<dl class="dl-horizontal">
  <dt>multiParams</dt>
  <dd>a result of merging the standard request params (query
    string or post params) with the route parameters extracted from the route
    matchers of the current route. The default value for an unknown param is the
    empty sequence. Keys return <code>Seq</code>uences of values.</dd>
  <dt>params</dt>
  <dd>a special, simplified view of <code>multiParams</code>, containing only the
    head element for any known param, and returning the values as Strings.</dd>
</dl>

#### A params example

As an example, let's hit a URL with a GET like this:

```
/articles/52?foo=uno&bar=dos&baz=three&foo=anotherfoo
```

<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
Look closely: there are two "foo" keys in there.

Assuming there's a matching route at `/articles/:id`, we get the following
results inside the action:

```scala
get("/articles/:id") {
  params("id") // => "52"
  params("foo") // => "uno" (discarding the second "foo" parameter value)
  params("unknown") // => generates a NoSuchElementException
  params.get("unknown") // => None - this is what Scala does with unknown keys in a Map

  multiParams("id") // => Seq("52")
  multiParams("foo") // => Seq("uno", "anotherfoo")
  multiParams("unknown") // => an empty Seq
}
```

#### params.getOrElse

You can set defaults for parameter values easily by using `params.getOrElse`.

Let's say you wanted to require an :author name param, and set a :page value
to 1 by default. If you don't receive an :author, you want to stop execution.
You could do it like this:

```scala
get("/articles-by/:author/:page") {
  val author:String = params.getOrElse("author", halt(400))
  val page:Int = params.getOrElse("page", "1").toInt
  // now do stuff with your params
}
```

#### GET and POST params, and where's my JSON?

Both GET and POST params end up in the `params` bag - you shouldn't need to read
anything off the `request.body`.

If you put data directly into the POST body of your request, e.g.
`'{"some":"object"}'` by itself as a JSON hash, then the JSON itself
becomes an empty key in the `params` Map.

### Filters

Scalatra offers a way for you too hook into the request chain of your
application via `before` and `after` filters, which both accept a
block to yield. Filters optionally take a URL pattern to match to the request.


#### before

The `before` method will let you pass a block to be evaluated **before** _each_
and _every_ route gets processed.

```scala
before() {
  MyDb.connect
  contentType="text/html"
}

get("/") {
  val list = MyDb.findAll()
  templateEngine.layout("index.ssp", list)
}
```

In this example, we've set up a `before` filter to connect using a contrived
`MyDb` module, and set the `contentType` for all requests to `text/html`.

#### after

The `after` method lets you pass a block to be evaluated **after** _each_ and
_every_ route gets processed.

```scala
after() {
  MyDb.disconnect
}
```

As you can see from this example, we're asking the `MyDB` module to
disconnect after the request has been processed.

#### Pattern matching

Filters optionally take a pattern to be matched against the requested URI
during processing. Here's a quick example you could use to run a contrived
`authenticate!` method before accessing any "admin" type requests.

```scala
before("/admin/*") {
  basicAuth
}

after("/admin/*") {
  user.logout
}
```


### Processing order for actions, errors, and filters

Route actions, errors and filters run in the following order:

1. `before` filters.
2. Routes and actions.
3. If an exception is thrown during the `before` filter or route actions, it is
   passed to the `errorHandler` function, and its result becomes the action result.
4. `after` filters.
5. The response is rendered.


### Handlers

Handlers are top-level methods available in Scalatra to take care of common HTTP
routines.

#### Redirects

There is a handler for redirection:

```scala
get("/"){
  redirect("/someplace/else")
}
```

This will return a redirect response, with HTTP status 302, pointing to
`/someplace/else`.

_Caution:_ `redirect` is implemented as a `HaltException`.  You probably don't
want to catch it in an action.

Although there's no built-in handler for permanent redirects, if you'd like to
do a 301 permanent redirect, you can do something like this:

```scala
halt(status = 301, headers = Map("Location" -> "http://example.org/"))
```

#### Halting

To immediately stop a request within a filter or route:

```scala
halt()
```

You can also specify the [HTTP status][statuses]:

[statuses]: http://en.wikipedia.org/wiki/List_of_HTTP_status_codes

```scala
halt(403)
```

Or the status and the body:

```scala
halt(403, <h1>Go away!</h1>)
```

Or even the HTTP status reason and headers. For more complex invocations, you can
use named arguments:

```scala
halt(status = 403,
     reason = "Forbidden",
     headers = Map("X-Your-Mother-Was-A" -> "hamster",
                   "X-And-Your-Father-Smelt-Of" -> "Elderberries"),
     body = <h1>Go away or I shall taunt you a second time!</h1>)

```

The `reason` argument is ignored unless `status` is not null.  If you don't pass
arguments for `status`, `reason`, or `body`, those parts of the response will
be left unchanged.

#### Passing

A route can punt processing to the next matching route using `pass()`.  Remember,
unlike Sinatra, routes are matched from the bottom up.

```scala
get("/guess/*") {
  "You missed!"
}

get("/guess/:who") {
  params("who") match {
    case "Frank" => "You got me!"
    case _ => pass()
  }
}
```

The route block is immediately exited and control continues with the next
matching route.  If no matching route is found, the `notFound` handler is
invoked.

#### Not Found (404)

The `notFound` handler allows you to execute code when there is no matching
route for the current request's URL.

The default behavior is:

```scala
notFound {
  <h1>Not found. Bummer.</h1>
}
```

What happens next differs slightly based on whether you've set your application
up using ScalatraServlet or ScalatraFilter.

* `ScalatraServlet`: sends a 404 response
* `ScalatraFilter`: passes the request to the servlet filter chain, which may
  then throw a 404 or decide to do something different with it.

### Routing FAQ

#### How can I make Scalatra ignore trailing slashes on routes?
If you'd like `foo/bar` and `foo/bar/` to be equivalent, simply append `/?` to your URL matching pattern.
For example:

```scala
get("foo/bar/?") {
  //...
}
```
