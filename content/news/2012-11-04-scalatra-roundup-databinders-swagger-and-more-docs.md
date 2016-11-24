---
title: Scalatra Roundup - Databinders, and More Docs
author: Dave Hrycyszyn
twitter: futurechimp
date: 2012-11-04
aliases:
    - /2012/11/04/scalatra-roundup-databinders-swagger-and-more-docs.html
---

Work continues on the Scalatra 2.2 development branch. [Swagger](http://swagger.wordnik.com) support in 2.2-SNAPSHOT has now solidified quite well, as has automatic JSON handling using [json4s](http://json4s.org). We're getting ready for the 2.2 release, hopefully in the next few weeks, at which point documentation for these features will be added to our [Scalatra Guides](http://scalatra.org/guides) - but in the meantime, anyone who want to get a sneak preview of Scalatra's new Swagger and JSON capabilities can look here:

<!--more-->


* 2.2.x [Swagger Guide](https://github.com/scalatra/scalatra-website/blob/2.2/guides/swagger.md)
* 2.2.x [Json Guide](https://github.com/scalatra/scalatra-website/blob/2.2/guides/json.md)

This is pre-release documentation, please let us know if anything doesn't work so we can fix it before release. Note that although the docs talk about using version `2.2.0` in `build.sbt`, you'll need use `{{ site.scalatra_version }}` for all your build definitions until the final release arrives. If you want to try generating a new Scalatra 2.2.0 project to try out all the new toys, you can:

```
g8 scalatra/scalatra-sbt.g8 --branch develop
```

At present, the major development effort is going into what we're calling _databinders_. Databinders will give you automatic serialization of incoming parameters onto Command objects. This sounds complex, but the implementation is really simple to use and understand. Using extremely minimal amounts of code, you can populate a Command object with incoming params, and run validations on it. We're building a sample Todolist application demonstrating the use of Command objects, but in a nutshell, they look like this:

```scala
/** A command to validate and create Todo objects. */
class CreateTodoCommand extends TodosCommand[Todo] {
  val name: Field[String] = asType[String]("name").notBlank.minLength(3)
}
```

Then you can execute the command, causing the validations to be run and the command's work to be handled. In this case, we've got a CreateTodoCommand which will validate and then create a new Todo object. In a controller, it looks like this:

```scala
post("/todos") {
    val cmd = command[CreateTodoCommand]
    TodoData.execute(cmd).fold(
      errors => halt(400, errors),
      todo => redirect("/")
    )
  }
```

This allows you to easily defend yourself right at the front door, rather than allowing unvalidated data to get deeply into your application stack. Although this syntax may change somewhat before release, the databinders will be a major new feature of Scalatra 2.2.

You can follow along with the progress of the [Todolist application](https://github.com/scalatra/scalatra-databinding-example) to see how things work, on Github.

Lastly, [Jos Dirksen](http://twitter.com/josdirksen) rounded out his series of Scalatra tutorials with a zinger of a [blog post](http://www.smartjava.org/content/tutorial-getting-started-scala-and-scalatra-part-iv) on dependency injection and Akka usage in Scalatra. Not to be missed!
