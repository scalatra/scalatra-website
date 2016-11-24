---
title: Atmosphere Hits Develop Branch
author: Dave Hrycyszyn
twitter: futurechimp
date: 2012-09-13
aliases:
    - /2012/09/13/scalatra-roundup-atmosphere-hits-develop-branch.html
---

Another busy week in the world of Scalatra. The [ScalaQuery][scalaquery] library, renamed to [Slick](http://slick.typesafe.com/) for Scala 2.10, is [TypeSafe](http://www.typesafe.com)'s answer to Scala data persistence, and it's a library with a bright future. [Jos Dirksen](http://twitter.com/josdirksen) has once again been at it with the tutorials, this time demonstrating [how to integrate Scalatra and Scalaquery][smartjava-scalaquery] in part 3 of his ongoing Scalatra series.

<!--more-->


[smartjava-scalaquery]:http://www.smartjava.org/content/tutorial-getting-started-scala-and-scalatra-part-iii
[scalaquery]:http://www.scalaquery.org/

Scalatra's integration with [Swagger](http://swagger.wordnik.com) got a nod from [Kin Lane](https://twitter.com/kinlane) of [apievangelist.com](http://apievangelist.com), with his article on the process of using what the Wordniks are calling "interface-driven design" to [build out an API using Swagger and Scalatra](http://apievangelist.com/2012/09/18/generate-api-server,-docs-and-client-code-using-swagger/). This one's interesting because it focuses not on the low-level technical details, but on the human and design processes involved.

Lastly, there's been a really big present for Scalatra users landing on the Scalatra 2.2 develop branch this week. [Ivan Porto Carrero](https://twitter.com/casualjim), who's been working with [Jean-Francois Arcand](https://twitter.com/jfarcand) of the [Atmosphere framework](https://github.com/Atmosphere/atmosphere), has [merged Atmosphere 1.0 support](https://twitter.com/casualjim/status/248945198850273281) into the Scalatra 2.2 codebase. While Scalatra has had support for Atmosphere's Meteor chat for a long time, this merge brings full support for the latest Atmosphere release, which is itself only a few weeks old.

A working code example of an Atmosphere chat server is available in the Scalatra examples in the 2.2 branch. Source code for that is [on Github](https://github.com/scalatra/scalatra/blob/develop/example/src/main/scala/org/scalatra/AtmosphereChat.scala). To run the example, do the following:

```
$ git clone --branch=develop https://github.com/scalatra/scalatra.git
$ cd scalatra
$ sbt
# Now you're in the sbt (s)hell!
> project scalatra-example
> jetty:start
```

Then point your browser at [http://localhost:8080/atmosphere](http://localhost:8080/atmosphere)

If you connect from multiple browsers, you'll be able to talk to yourself. This might not seem like a technological revolution at first, but in fact the potential of Atmosphere is quite striking. For the past 20 years or so, everybody on the web has been used to a request/response interaction model where the browser client asks a server for a piece of information, and the server responds. Atmosphere turns that relationship on its head, and allows the server to reliably push information to persistently-connected clients. There is a whole world of new design patterns lurking in there!
