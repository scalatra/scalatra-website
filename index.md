---
layout: home
title: Scalatra | A tiny, Sinatra-like web framework for Scala
---

<div class="hero-unit">
  <div class="row">
    <div class="span4">
      <img src="assets/img/logo-x.png" class="img-rounded">
    </div>
    <div class="span6">
      <p>Scalatra is a simple, accessible and free web micro-framework.</p>
      <p> It combines the power of the JVM with the beauty and brevity of Scala,
          helping you quickly build high-performance web sites and APIs.</p>
    </div>
  </div>
</div>

<div class="row">
  <div class="span4">
    <h2>Ready</h2>
    <p><img src="assets/img/glyphicons/glyphicons_339_rabbit.png"> Get
      set up in <a href="getting-started/installation.html">3 easy steps</a>
      with our quick installation guide. There's a good chance that you already
      have most of the software you need.</p>
    <p><a href="getting-started" class="btn btn-primary">Get started »</a></p>
  </div>
  <div class="span4">
    <h2>Steady</h2>
    <p><img src="assets/img/glyphicons/glyphicons_064_lightbulb.png"> We're
      working hard on all aspects of our framework, from the non-blocking
      I/O through to an async future. We've documented our progress so far
      in a handy set of reference guides, to quickly answer your questions.</p>
    <p><a href="guides" class="btn btn-primary">View the guides »</a></p>
  </div>
  <div class="span4">
    <h2>Code</h2>
    <p><img src="assets/img/glyphicons/glyphicons_043_group.png"> We have a
      small but active community, and an enthusiastic group of
      developers working on the next version.</p>
    <p><a href="community" class="btn btn-primary">Get involved »</a></p>
  </div>
</div>

### Why would you want to use Scalatra?

* It's been proven in production - [LinkedIn][linkedin], the
[Guardian newspaper][guardian], games website [IGN][ign], and the
[UK government][govuk] all rely on it.
* It can help you quickly build high-performance, scalable HTTP APIs for web
and mobile applications.
* It's a perfect server-side counterpart to in-browser client development
frameworks such as [backbone.js](http://backbonejs.org/),
[ember.js](http://emberjs.com) or [angular.js](http://angularjs.org).
* It's a simple, fun, and practical way to learn
[Scala](http://www.scala-lang.org), a new programming language with advanced
features.
* It will help you use all available cores of that new 16-core server. It
also gives you easy access to Scala's new concurrency-management constructs:
Akka Actors.

[linkedin]: http://www.linkedin.com
[guardian]: http://www.guardian.co.uk
[ign]: http://www.ign.com
[govuk]: http://www.gov.uk

### Start small

You will need to [install a few things](getting-started/installation.html)
before you can get started, but first, here's a Scalatra app:

{% highlight scala %}

  package com.example.app
  import org.scalatra._

  class HelloWorldApp extends ScalatraFilter {
    get("/") {
      <h1>Hello, {params("name")}</h1>
    }
  }
{% endhighlight %}

Notice a few things about it:

 * It's small - a full web application in 7 lines of code.
 * It uses a [Sinatra](http://sinatrarb.com)-style DSL.
 * It defines a single method, an HTTP GET to the path "/".
 * It renders a response, in this case the text _Hello world!_

This is the essence of Scalatra - a simple, easy to understand way to make
web systems, which embrace HTTP's stateless nature. You can build anything
you want with Scalatra, but one of the things it's been most successful at
is the construction of RESTful APIs.

### Scale up and customize

Scalatra is a micro-framework, so you start small and build upwards.

You can easily add exactly the libraries you want - for data models, templating,
unit and integration testing, async request handling, or server-push.

We can't predict what you'll want to build, or how you'll want to build it.
Instead of prescribing a set of libraries for you to use, and building the
framework around that, we let _you_ choose.

## Versions

<table class="table table-striped table-bordered">
  <thead>
    <tr>
      <th>Scalatra Version</th>
      <th>Status</th>
      <th>Source</th>
      <th>Scala versions</th>
      <th>Servlet</th>
      <th>Netty</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2.0.4</td>
      <td>Stable</td>
      <td><a href="http://github.com/scalatra/scalatra/tree/master">master</td></td>
      <td>
        <ul class="scala-versions">
          <li>2.9.1</li>
          <li>2.9.0-1</li>
          <li>2.8.2</li>
          <li>2.8.1</li>
        </ul>
      </td>
      <td>2.5</td>
      <td>N/A</td>
    </tr>
    <tr>
      <td>2.0.5-SNAPSHOT</td>
      <td>Testing</td>
      <td><a href="http://github.com/scalatra/scalatra/tree/support/2.0.x">support/2.0.x</td></td>
      <td>
        <ul class="scala-versions">
          <li>2.9.1</li>
          <li>2.9.0-1</li>
          <li>2.8.2</li>
          <li>2.8.1</li>
        </ul>
      </td>
      <td>2.5</td>
      <td>N/A</td>
    </tr>
    <tr>
      <td>2.1.0</td>
      <td>Stable</td>
      <td><a href="http://github.com/scalatra/scalatra/tree/support/2.1.x">support/2.1.x</td></td>
      <td>
        <ul class="scala-versions">
          <li>2.9.x</li>
        </ul>
      </td>
      <td>3.0</td>
      <td>N/A</td>
    </tr>
    <tr>
      <td>2.2.0-SNAPSHOT</td>
      <td>Development</td>
      <td><a href="http://github.com/scalatra/scalatra/tree/develop">develop</td>
      <td>
        <ul class="scala-versions">
          <li>2.9.x</li>
        </ul>
      </td>
      <td>3.0</td>
      <td>N/A</td>
    </tr>
  </tbody>
</table>