---
layout: default
title: Scalatra Guides | Databinders
---

<div class="page-header">
<h1>Databinders</h1>
</div>

Scalatra includes a very sophisticated set of databinders. 

These allow you to parse incoming data, instantiate objects, and automatically 
apply validations to the objects. This sounds like it might be quite complex, 
but once you've got the (quite minimal) infrastructure in place, it can 
dramatically simplify your code.

Let's say we've got a Todolist application, and it contains a simple Todo class
which is used for persistence:

```scala
// A Todo object to use as a data model 
case class Todo(id: Integer, name: String, done: Boolean = false)
```

Using a databinder, a controller action for creating and saving a new Todo 
object might look like this:

```scala
  post("/todos") {
    val cmd = command[CreateTodoCommand]
    TodoData.execute(cmd).fold(
      errors => halt(400, errors),
      todo => redirect("/")
    )
  }  
```

You define the command separately, tell it which case class type it
operates upon, and set up validations inside the command:

```scala
class CreateTodoCommand extends TodosCommand[Todo] { 

  val name: Field[String] = asType[String]("name").notBlank.minLength(3) 

}
```

Several things happen when `execute` is called. First, validations
are run, and then the command receiver's `handle` method does some work.

Our `handle` method for creating a new Todo object might trigger a persistence 
function, like this:

```scala
  protected def handle: Handler  = {
    case c: CreateTodoCommand => 
      add(newTodo(~c.name.value))
  }
```

The `CreateTodoCommand` can automatically read incoming POST params or JSON, 
populate the Todo case class's fields with whatever info it read, run validations
to ensure that the `name` property is a non-empty `String` with at least 3
characters, and then save the Todo object. 

However, since databinder commands in Scalatra have nothing to do with your 
chosen persistence library, the concepts of databinding and validation are 
completely de-coupled from the concept of persistence. You _might_ want to have
the `execute` method of a command trigger a persistence function; just as easily,
you could serialize the Todo object and send it off to a queue, attach it to
another object, or transform it in some way.

You can perhaps see the benefits:

* data validation and persistence are de-coupled.
* the validations DSL makes setting validation conditions on your case classes very easy.
* validations are taken care of right at the front door of your application. Bad data never gets deep into your stack.
* error handling and validation failures are extremely convenient, and you can use Scala's pattern matching to determine appropriate responses.

To see how Scalatra's databinders work, let's create a TodoList application. 
It'll allow you to use Scalatra's new databinder support to validate incoming 
data and do data-related work by executing queries in commands.

### Downloading the sample project

Before you start, you may wish to download the completed, runnable Todolist
project. This may help you cross-check your own code if you run into any
problems. It's available here:

[https://github.com/scalatra/scalatra-databinding-example/](https://github.com/scalatra/scalatra-databinding-example/)

### Generating the project

Generate a new project. We'll use `org.scalatra.example.databinding` domain as 
a namespace, you can change to your own domain throughout the codebase.

```bash
g8 scalatra/scalatra-sbt.g8
organization [com.example]: org.scalatra 
package [com.example.myapp]: org.scalatra.example.databinding
name [My Scalatra Web App]: TodoList
servlet_name [MyServlet]: TodosController
scala_version [2.9.2]: 
version [0.1.0-SNAPSHOT]: 

Template applied in ./todolist
```

Start the application:

```
cd todolist
chmod +x sbt
./sbt
```

Now you're in the sbt shell, start the server and enable recompilation:

```
container:start
~;copy-resources;aux-compile
```

### Setting up a model and fake datastore

Before we start actually building the controller, let's set up some fake data. 

Add two folders in `org.scalatra.example.databinding`: call one `models` and the other `data`.

Inside the `models` folder, add a file called `Models.scala`, with the following contents:

```scala
package com.futurechimps.example.databindings.models

// A Todo object to use as a data model 
case class Todo(id: Integer, name: String, done: Boolean = false)
```

You might drop a few more models in there later on, but for now we'll just define a single `Todo` model.

Next, inside the `data` folder, add a file called `TodoData.scala`, with the following contents:

```scala
package org.scalatra.example.databinding.data

import org.scalatra.example.databinding.models._
import java.util.concurrent.atomic.AtomicInteger

object TodoData {

  /** A counter variable to fake out auto-incrementing keys for us **/
  val idCounter = new AtomicInteger(3)

  /**
   * Some fake data so we can simulate retrievals.
   */
  var all = List(
      Todo(1, "Shampoo the cat"),
      Todo(2, "Wax the floor"),
      Todo(3, "Scrub the rug"))

  /** Returns the number of Todos which are not yet complete. **/
  def remaining = {
    all.filterNot(_.done == true).length
  }

  /** Adds a new Todo object to the existing list of todos, then sorts the list.
  */
  def add(todo: Todo): List[Todo] = {
    all ::= todo
    all = all.sort((e1, e2) => (e1.id < e2.id))
    all
  }

  /** Instantiates a new `Todo` object with an auto-incremented primary key id. **/
  def newTodo(name: String) = Todo(idCounter.incrementAndGet, name)

}
```

For the purposes of this example, we won't bother with persisting our Todos 
to disk. The `TodoData` object acts as temporary storage of our Todos, and 
has methods on it to access all Todos, find out how many haven't yet been 
completed (using the `remaining` method), and instantiate a new `Todo`
object with an auto-incrementing integer primary key.

### Retrieving objects in a controller

Let's move back to the TodosController, and get databinding working. 

Just to see if everything is working, let's try and retrieve a single Todo. 

First, import the definitions for the classes we just added:

```
import models._
import data._
```

Then put this action in your controller

```scala
  get("/todos/:id") {
    TodoData.all find (_.id == params("id").toInt) match {
      case Some(todo) => todo
      case None => halt(404)
    }
  }
```

Hitting [http://localhost:8080/todos/1](http://localhost:8080/todos/1) should 
now show you a Scala representation of the first Todo object:

```scala
Todo(1,Shampoo the cat)
```

All pretty simple so far. Let's drop in some code which will allow us to add
a new Todo object, using a Scalatra command.

### Commands in Scalatra

Scalatra's databinders are built using the classical 
[Gang of Four](https://en.wikipedia.org/wiki/Design_Patterns) (Gof)
[Command pattern](https://en.wikipedia.org/wiki/Command_pattern), with some
small variations. In its simplest form, a command object has one method, 
`execute`, which calls a method on another class, the _receiver_. The 
command object can carry data with it, be passed from method to method, and
finally tell the receiver to do some work when the `execute` method is called. 
It's a way to increase flexibility and de-couple calling methods from 
receivers. 

In Scalatra, `Command` objects used for databinding have a few things 
added to them, which aren't in the traditional GoF Command Pattern. 
First, they're able to automatically parse incoming parameters
and populate model objects. Second, they can also run validations on the
parameters to ensure data correctness. 

#### Adding a command to persist Todo objects

We'll need a file in which to place our commands. Make a
new folder in `org.scalatra.example.databinding`, and call it `commands`.
Then create a new file in that folder, calling it `TodoCommands.scala`. This
will store all of the Todo-related commands so they're in one place.

To start with, you'll need to add databinder support to your application.

```scala
"org.scalatra" % "scalatra-data-binding" % "2.2.0-SNAPSHOT",
```

`TodoCommands.scala` can look like this:

```scala
package org.scalatra.example.databinding.commands

// the model code from this application
import org.scalatra.example.databinding.models._

// the Scalatra databinding handlers
import org.scalatra.databinding._


abstract class TodosCommand[S](implicit mf: Manifest[S]) extends ModelCommand[S]
  with ParamsOnlyCommand

/** A command to validate and create Todo objects. */
class CreateTodoCommand extends TodosCommand[Todo] { 

  val name: Field[String] = asType[String]("name").notBlank.minLength(3) 

}
```

There are a few things going on here, so let's break it apart. First, there
are some imports: the model code for our application, and the databinding
support. 

The next thing is the `abstract class TodosCommand`. This sets up an 
abstract base class for all of our commands to inherit from, so we don't 
need to keep on repeating the `extends ModelCommand[T]` in every 
command we make. It inherits from two other classes, both of which are 
built into Scalatra: `ModelCommand[S]` and `ParamsOnlyCommand`.

`ModelCommand[S]` is a very small subclass of Scalatra's base 
`Command` object. It's just a Command which takes a single type parameter,
and it's abstract. It gives the Command object the ability to know which 
case class type it's operating upon.

`ParamsOnlyCommand` is basically a Command with type conversion enabled. 
It allows population of a model's fields from incoming params
when it's operating upon a Scala case class.

Finally, there's the concrete `CreateTodoCommand` class. This is the first
command object we'll use, and its job will be to create a Todo object
from incoming params. It can do this because it inherits our abstract
`TodosCommand[Todo]` class, which knows we're operating on Todo objects
from the `ModelClass[S]` type parameter, and can inject params into the 
Todo object because it's got the capabilities of `ParamsOnlyCommand`.

#### Validations

CreateTodoCommand has an interesting `val` hanging around in the class
body: 

```scala
val name: Field[String] = asType[String]("name").notBlank.minLength(3)
```

This indicates to the command that a Todo has a field called `name`, 
which needs to be a `String`. There are two validations: the name must
be `notBlank` (i.e. it can't be an empty string or a null value), and
it must have a `minLength(3)` (i.e. it must have a minimum length of
3 characters).

That's it for the command setup. Now that we've got a command which can 
create Todos, let's use it in a controller action to create a Todo object.

### Using the new command in a controller action

Back in TodosController, let's add a new route, and set it up to use this
new capability. 

```scala
  post("/todos") {
    val todo = new Todo(-1, params("name"))
    TodoData.add(TodoData.newTodo(params("name")))
    redirect("/")
  } 
```

This works fine, but if there are a lot incoming parameters, it can get a
little tiresome extracting them from the `params` bag and populating the 
object. Commands give us a better way, with the bonuses of convenient 
validation and error handling.

Before we can use any command-related code, we'll need to import it into
our controller class. You'll need:

```scala
// the Scalatra databinding handlers
import org.scalatra.databinding._

// our own Command classes
import commands._
```

Fill in the action for `post("/todos")` like this:

```scala
  post("/todos") {
    val cmd = command[CreateTodoCommand]
    TodoData.execute(cmd).fold(
      errors => halt(400, errors),
      todo => redirect("/")
    )
  }
```

This won't compile yet. Before we make it compile, let's take a line by line
look at the action, to understand what it's doing. 

First, we instantiate a new CreateTodoCommand: 

```scala
val cmd = command[CreateTodoCommand]
```

This gives us a new CreateTodoCommand, which knows it's operating on the 
Todo model, and can ingest incoming params to automatically populate the
model's fields.

We then tell TodoData, our fake datastore, to `execute` the `cmd`. At 
present, this is holding up compilation: `TodoData` has no
`execute` method. Let's fix this. 

First, let's make a logger. This isn't strictly necessary, but it's a nice
thing to have around.

Create a new folder, `utils`, in `org.scalatra.example.databinding`, and 
put the following code into `Logger.scala` inside it:

```scala
package org.scalatra.example.databinding
package utils

import grizzled.slf4j.Logger

trait Logging {
  @transient lazy val logger: Logger = Logger(getClass)
}
```

This gives us a logger object.

Open up `data/TodoData.scala`, and add the following code. 

At the top of the file, add:

```scala
// the Scalatra databinding handlers
import org.scalatra.databinding._

// our commands
import org.scalatra.example.databinding.commands._

// our logger object
import org.scalatra.example.databinding.utils.Logging
```

This import gives `TodoData` access to Scalatra's commands. 

Next, let's make `TodoData` inherit from `Logging` and `CommandHandler`:

```scala
object TodoData extends Logging with CommandHandler {
```

Now to get things compiling again. Add these imports:

```scala
import scala.util.control.Exception._
import org.scalatra.validation._
```

These imports give you access to exception handling and validation code,
which we'll use in a moment.

Then add a `handle` method:

```scala
  protected def handle: Handler  = {
    case c: CreateTodoCommand => 
      add(newTodo(c.name.value getOrElse ""))
  }
```

Writing a `handle` function is something you'll do very often when using
Scalatra command objects to do your databinding. Remember when we said
in our quick theoretical discussion above, that the simplest Command
object has a single method, `execute`? Scalatra follows this pattern,
but `execute` on a Scalatra command does a bit more than in the classical
GoF version.

In Scalatra, when you call `execute` on your Command, you're telling it to
do two things:

* run validations on all fields defined in your command
* call the `handle` method to do whatever work you actually want to do

This is the reason that we've mixed `CommandHandler` into `TodoData`:
it gives `TodoData` the ability to handle commands, as long as we give it
a `handle` method. In our case, the `handle` method uses pattern matching
to see what command is being executed, and (in this case) adds a new Todo
object with the value of the command's `name` field.

One more thing and it'll compile. Change the `add` method so that it returns a
`ModelValidation[Todo]`, and add some error handling:

```scala
  private def add(todo: Todo): ModelValidation[Todo] = {
    allCatch.withApply(errorFail) {
      all ::= todo
      all = all.sort((e1, e2) => (e1.id < e2.id))
      todo.successNel
    }
  }

 /** Throw a validation error if something explodes when adding a Todo **/
  def errorFail(ex: Throwable) = ValidationError(ex.getMessage, UnknownError).failNel  
```

Your code should now compile. 

Let's go through that last piece of the puzzle. The heart of the `add` 
method still does the same thing: it adds a new `Todo` object to the list 
of all todos, and sorts the list. 
 
The `add` method returns a ModelValidation[Todo], which is carried around in the
todo.successNel. Think of `successNel` as being like a two part variable 
name. The result is either `Success[Model]` or 
`Failure[NonEmptyList[ValidationError]]`. So you're getting
back either "success" OR a non-empty list ("Nel"). This type signature is
in turn dictated by the return value needed by the `handle` method, above.
 
If any exceptions happen as we're doing work here, the `errorFail` method 
will be called, due to the `allCatch.withApply` (which is equivalent to a
`try {} catch {}` block. 

You should now be able to add a new `Todo` object to the datastore. 
Let's quickly add a method to see the ones we've currently got:

```scala
  get("/todos") {
    TodoData.all
  }
```

Your list of Todos should look like this:

`List(Todo(1,Shampoo the cat,false), Todo(2,Wax the floor,false), Todo(3,Scrub the rug,false))`


Try adding one:

`curl -X post -d name="Do that thing" http://localhost:8080/todos`

Hit refresh and you should see the new todo in the list.

Let's recap on what's happened here.

First, the incoming params (in this case only `name`) hit the `post("/todos")`
method. A new `CreateTodoCommand` is instantiated: 
`val cmd = command[CreateTodoCommand]`

_Note: The method `command[Foo]` comes courtesy of Scalatra's command support._

Next, the command gets executed: `TodoData.execute(cmd)`. 
Calling `execute` on the command causes all validations to run, and then 
the `handle` method is called. _Note: validations could fail!_

In this case, the `handle` command as implemented in `TodoData` adds a 
new Todo object to the list of todos:  

`add(newTodo(c.name.value getOrElse ""))`

The `add` method attempts to add the new Todo object to the datastore. 
_This could also potentially fail._

What happens in the failure cases? This is determined by the remainder
of the `TodoData.execute` method call:

```scala
  TodoData.execute(cmd).fold(
    errors => halt(400, errors),
    todo => redirect("/")
  )
```
If we get back errors (from either the validations or the `allCatch` block), 
we halt with a 400 status. If we get back a `todo`, we redirect to "/".

### Using Scalatra's databinders with JSON
 
So far, we've been doing everything with params data only. We can easily
switch to using JSON instead. Conveniently, when you enable the JSON support with
the commands, you can use either regular POST params, e.g. from a web form, 
*OR* JSON documents, transparently and with no extra effort.

Here's how it works.

Add the following to build.sbt:

```scala
  "org.json4s"   %% "json4s-jackson" % "3.0.0",
  "org.scalatra" % "scalatra-json" % "2.2.0-SNAPSHOT",
```

This adds dependencies on Scalatra's JSON-handling libraries.

Next, add the following imports to `TodosController.scala`, so that the 
controller has access to the new JSON libraries:

```scala
// Json handling
import json._
import org.json4s.{DefaultFormats, Formats}
```

Next, add `with JacksonJsonParsing with JacksonJsonSupport` to the controller
instead of `ParamsOnlySupport`. This will give your controller the ability
to automatically parse incoming params using the Jackson JSON-handling library.

The last thing we'll need to do in the controller is to add json format support 
by putting the following code in the class body:

```scala
// add json format handling so the command can do automatic conversions.
protected implicit val jsonFormats = DefaultFormats
```

If you want to, you can set the default format of all actions in your controller
to be JSON, by adding this to the body of the TodosController class:

```scala
  before() {
    contentType = formats("json")
  }
```

and adding `with JValueResult` to the TodosController class declaration.

That's it for your controller. Now let's fix up the commands.

In `commands/TodoCommands.scala`, remove `with ParamsOnlySupport` from the 
`abstract class TodosCommand[S]` and add `with JsonCommand` instead.

Add the following imports to the top of the file:

```scala
// Json handling
import json._
import org.json4s.{DefaultFormats, Formats}
```

And again, we'll need to give the class the ability to do automatic format
conversions to and from JSON, so put the following code into the body of the 
CreateTodoCommand class:

```scala
// add json format handling so the command can do automatic conversions.
protected implicit val jsonFormats = DefaultFormats
```

Take a look at the output of [http://localhost:8081/todos](http://localhost:8081/todos)

It should now have changed to be JSON:

```json
[
  {"id":1,"name":"Shampoo the cat","done":false},
  {"id":2,"name":"Wax the floor","done":false},
  {"id":3,"name":"Scrub the rug","done":false}
]
```

We can still add a new Todo object using a regular POST:

```
curl -X post -d name="Do that thing" http://localhost:8080/todos
```

```json
[
  {"id":1,"name":"Shampoo the cat","done":false},
  {"id":2,"name":"Wax the floor","done":false},
  {"id":3,"name":"Scrub the rug","done":false},
  {"id":4,"name":"Do that thing","done":false}
]
```

We've also got a new capability: we can POST a JSON document to
http://localhost:8080/todos, and the `CreateTodoCommand` will handle that 
as well:

```bash
curl -X post -i -H "Content-Type: Application/JSON" -d '{"name":"Find out how to use JSON commands", "done":true }' http://localhost:8080/todos
```

Scalatra reads the `Content-Type` header, takes the hint that what's coming in the
door is JSON, and informs the `CreateTodoCommand` of that.

Alternately, if you prefer, you can just as easily send a `format` parameter
instead of a `Content-Type` header:

```bash
curl -X post -i -d '{"name":"Find out how to use JSON commands", "done":true }' http://localhost:8080/todos?format=json
```