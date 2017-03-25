---
aliases:
  - /2.3/guides/formats/commands.html
title: Commands
---

Scalatra includes a very sophisticated set of validation commands.

These allow you to parse incoming data, instantiate command objects, and automatically apply validations to the objects. This sounds like it
might be quite complex, but once you've got the (quite minimal)
infrastructure in place, it can dramatically simplify your code.

Let's say we've got a Todolist application, and it contains a simple Todo class
which is used for persistence:

```scala
// A Todo object to use as a data model
case class Todo(id: Integer, name: String, done: Boolean = false)
```

Using a command, a controller action for creating and saving a new Todo
object might look like this:

```scala
  post("/todos") {
    (command[CreateTodoCommand] >> (TodoData.create(_))).fold(
      errors => halt(400, errors),
      todo => redirect("/")
    )
  }  
```

You define the command separately, tell it which case class type it
operates upon, and set up validations inside the command:

```scala
object CreateTodoCommand {
  // Putting the implicit conversion in the companion object of the create todos command ensures it's the default fallback
  // for implicit resolution.
  implicit def createTodoCommandAsTodo(cmd: CreateTodoCommand): Todo = Todo(~cmd.name.value)
}
class CreateTodoCommand extends TodosCommand[Todo] {

  val name: Field[String] = asType[String]("name").notBlank.minLength(3)

}
```

Several things happen when `execute` (`>>`) is called. First, validations
are run, and then the command is either converted implicitly to the parameter the
function accepts or just passed in as a command into that function.
The result of that function is a ModelValidation.

The `CreateTodoCommand` can automatically read incoming POST params or JSON,
populate itself with whatever info it read, run validations to ensure that
the `name` property is a non-empty `String` with at least 3 characters,
and then, in this case, save the Todo object.

Note that in this code, the incoming params are not automatically
pushed onto a new instance of the Todo case class. This is because Scalatra
users habitually use wildly varying approaches to persistence frameworks and
have very different needs when it comes to data validation.

What the `CreateTodoCommand` object gives you instead, is a way to componentize
and re-use the same Command object across any part of your application which
requires the creation of a Todo, and easily apply validation conditions
based on incoming parameters.

Since validation commands in Scalatra have nothing to do with your
chosen persistence library, the concepts of commands and validation are
completely de-coupled from the concept of persistence. You _might_ want to have
the `execute` method of a command trigger a persistence function; just as easily,
you could serialize the Todo object and send it off to a queue, attach it to
another object, or transform it in some way.

This has some benefits:

* data validation and persistence are de-coupled.
* the validations DSL makes setting validation conditions very easy.
* validations are taken care of right at the front door of your application. Bad data never gets deep into your stack.
* error handling and validation failures are more convenient, and you can use Scala's pattern matching to determine appropriate responses.

## The TodoList application

To see how Scalatra's commands work, let's create a TodoList application.
It'll allow you to use Scalatra's command support to validate incoming
data and do data-related work.

### Downloading the sample project

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="{{site.examples}}formats/scalatra-commands">scalatra-commands</a>
  for a minimal and standalone project containing the example in this guide.
</div>

This tutorial will start by generating a fresh project, talk you through
the project setup, and then show you several different ways of using
commands in Scalatra.

### Generating the project

Generate a new project. We'll use `org.scalatra.example.commands` domain as
a namespace, you can change to your own domain throughout the codebase.

```bash
g8 scalatra/scalatra-sbt.g8
organization [com.example]: org.scalatra
package [com.example.myapp]: org.scalatra.example.commands
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

Add two folders in `org.scalatra.example.commands`: call one `models` and the other `data`.

Inside the `models` folder, add a file called `Models.scala`, with the following contents:

```scala
package org.scalatra.example.commands.models

// A Todo object to use as a data model
case class Todo(id: Integer, name: String, done: Boolean = false)
```

You might drop a few more models in there later on, but for now we'll just define a single `Todo` model.

Next, inside the `data` folder, add a file called `TodoData.scala`, with the following contents:

```scala
package org.scalatra.example.commands.data

import org.scalatra.example.commands.models._
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
    all = all.sortBy(_.id)
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

Let's move back to the TodosController, and get the commands working.

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

Scalatra's commands are built using the classical
[Gang of Four](https://en.wikipedia.org/wiki/Design_Patterns) (Gof)
[Command pattern](https://en.wikipedia.org/wiki/Command_pattern), with some
small variations. In its simplest form, a command object has one method,
`execute`, which calls a method on another class, the _receiver_. The
command object can carry data with it, be passed from method to method, and
finally tell the receiver to do some work when the `execute` method is called.
It's a way to increase flexibility and de-couple calling methods from
receivers.

In Scalatra, `Command` objects have a few things
added to them which aren't in the traditional GoF Command Pattern.
First, they're able to automatically read incoming parameters
and populate themselves with data. Second, they can also run validations on the
parameters to ensure data correctness.

#### Adding a command to persist Todo objects

We'll need a file in which to place our commands. Make a
new folder in `org.scalatra.example.commands`, and call it `commandsupport`.
Then create a new file in that folder, calling it `TodoCommands.scala`. This
will store all of the Todo-related commands so they're in one place.

To start with, you'll need to add command support to your application.

```scala
"org.scalatra" %% "scalatra-commands" % "{{< 2-3-scalatra_version >}}",
```

`TodoCommands.scala` can look like this:

```scala
package org.scalatra.example.commands.commandsupport

// the model code from this application
import org.scalatra.example.commands.models._

// the Scalatra commands handlers
import org.scalatra.commands._


abstract class TodosCommand[S] extends ParamsOnlyCommand

object CreateTodoCommand {
  // Putting the implicit conversion in the companion object of the create todos command ensures it's the default fallback
  // for implicit resolution.
  implicit def createTodoCommandAsTodo(cmd: CreateTodoCommand): Todo = Todo(~cmd.name.value)
}

/** A command to validate and create Todo objects. */
class CreateTodoCommand extends TodosCommand[Todo] {

  val name: Field[String] = asType[String]("name").notBlank.minLength(3)

}
```

There are a few things going on here, so let's break it apart. First, there
are some imports: the model code for our application, and the command
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
It allows population of a command's fields from incoming params.

Finally, there's the concrete `CreateTodoCommand` class. This is the first
command object we'll use, and its job will be to validate incoming params
for a Todo object. Once that's done, we'll use the command receiver's `handle`
method to persist a new Todo object in our fake datastore.

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

A full list of available validations is available in the
[Validators API docs](http://scalatra.org/2.2/api/#org.scalatra.validation.Validators$).

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
// the Scalatra command handlers
import org.scalatra.commands._

// our own Command classes
import commands._
```

Fill in the action for `post("/todos")` like this:

```scala
  post("/todos") {
    (command[CreateTodoCommand] >> (TodoData.add(_))).fold(
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

Create a new folder, `utils`, in `org.scalatra.example.commands`, and
put the following code into `Logger.scala` inside it:

```scala
package org.scalatra.example.commands
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
// the Scalatra command handlers
import org.scalatra.commands._

// our commands
import org.scalatra.example.commands.commandsupport._

// our logger object
import org.scalatra.example.commands.utils.Logging
```

Now to get things compiling again. Add these imports:

```scala
import scala.util.control.Exception._
import org.scalatra.validation._
```

These imports give you access to exception handling and validation code,
which we'll use in a moment.

In Scalatra, when you call `execute` on your Command, you're telling it to
do two things:

* run validations on all fields defined in your command
* it passes itself into the function passed to execute

One more thing and it'll compile. Change the `add` method so that it returns a
`ModelValidation[Todo]`, and add some error handling:

```scala
  def add(todo: Todo): ModelValidation[Todo] = {
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
  (cmd >> TodoData.add(_)).fold(
    errors => halt(400, errors),
    todo => redirect("/")
  )
```
If we get back errors (from either the validations or the `allCatch` block),
we halt with a 400 status. If we get back a `todo`, we redirect to "/".

At this point, your project should be very similar to what's tagged in the
example project's Git repository, in the [params binding](https://github.com/scalatra/scalatra-databinding-example/tree/paramsonly-binding) example.

### Using Scalatra's commands with JSON

So far, we've been doing everything with params data only. We can easily
switch to using JSON instead. Conveniently, when you enable the JSON support with
the commands, you can use either regular POST params, e.g. from a web form,
*OR* JSON documents, transparently and with no extra effort.

Here's how it works.

Add the following to project/build.scala:

```scala
  "org.json4s"   %% "json4s-jackson" % "{{< 2-3-json4s_version >}}",
  "org.scalatra" %% "scalatra-json" % "{{< 2-3-scalatra_version >}}",
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

At this point, your project should be very similar to the [JSON commands](https://github.com/scalatra/scalatra-databinding-example/tree/json-binding)
Git example. Take a look at that code if you're having any problems.

### Writing your own validations.

Scalatra gives you a fairly comprehensive list of
[pre-built validations](http://scalatra.org/2.2/api/#org.scalatra.validation.Validators$),
but you can also write your own custom validators fairly easily.

A Scalatra [Command](http://scalatra.org/2.2/api/#org.scalatra.commands.Command) is partly composed of [Field](http://scalatra.org/2.2/api/#org.scalatra.commands.Field) objects, each of which has a
[FieldDescriptor](http://scalatra.org/2.2/api/#org.scalatra.commands.FieldDescriptor) which acts as a kind of builder for the Field.

In order to write a validator, we need to do two things.

First, we need to write a class to carry around our custom validations.

Second, we [implicitly extend](http://www.artima.com/pins1ed/implicit-conversions-and-parameters.html#21.1) Scalatra's FieldDescriptor class so that it's got
access to our new validation. Let's see this in action.

We'll need to decide what kind of validation to make. Since all-lower-case
text is the mark of the pathologically lazy, let's hold ourselves to a
higher standard, and define a validation which will force users of our
application to capitalize the first letter of the `name` field in their
`Todo` objects.

Open up your `TodoCommands.scala` file, and drop this into it above the
`abstract class TodosCommand`:

```scala
/**
 * A class to keep our custom String validations in.
 *
 * Note that it takes a FieldDescriptor[String] binding as a parameter.
 * This is so that we can extend the FieldDescriptor.
 */
class TodosStringValidations(b: FieldDescriptor[String]) {

  // define a validation which we can apply to a [Field]
  def startsWithCap(message: String = "%s must start with a capital letter.") = b.validateWith(_ =>
    _ flatMap { new PredicateValidator[String](b.name, """^[A-Z,0-9]""".r.findFirstIn(_).isDefined, message).validate(_) }
  )
}
```

The `TodosStringValidations` class is just a container for our
validations.

Inside it, there's a `startsWithCap` function, which takes a `String`
parameter for the validation `message`, and can apply itself to a
`FieldDescriptor[String]` via binding `b`, using `b.validateWith`.

The heart of the validation function is this bit of code here:

`new PredicateValidator[String](b.name, """^[A-Z,0-9]""".r.findFirstIn(_).isDefined`

To paraphrase, we're going to run a validation
on the FieldValidator's name, and that the validation should pass if
the regex `[A-Z,0-9]` matches the first letter of the incoming string.

What's that `_ flatMap` doing there at the start of the validation
function? This takes a bit of explaining. Eventually, we're going to chain together our new `startsWithCap` validation with the rest of the
validations we've already defined, like this:

```scala
  val name: Field[String] = asType[String]("name").notBlank.minLength(3).startsWithCap()
```

Validations are evaluated in a chain, starting on the left, and proceeding
rightwards. Each validation condition is a logical AND.

Let's assume that we try to validate a new `Todo` with the name
"Walk the dog".

A successful validation for a `name` of `Walk the dog` is of type
`Success("Walk the dog")`. In contrast, a failed validation returns a
`Failure(ValidationError)` with a failure message inside it, and no more
validations in the chain are run.

When our custom validation runs, it is taking as input the output of the
previous validation function. So in our case, the success output of
`.minLength(3)` is fed into `_` and forms the input for our `startsWithCap`
function.

The use of `flatMap` in that function is a
[Scala trick](http://www.brunton-spall.co.uk/post/2011/12/02/map-map-and-flatmap-in-scala/)
to pull the value `"Walk the dog"` out of `Success("Walk the dog")
`, because a Validation's return type operates much like an `Either`
from the stdlib - it can be considered a 2-value sequence, with a type
signature something like this:

`Validation[Failure(error), Success(data)]`

Back to the task at hand.

What we need to do now is make our application aware of our new validation
code, and then apply it.

Scalatra's `FieldDescriptor` trait already exists, but we can use the
extension method technique to add in our new validation code.

Let's add to our abstract `TodosCommand` class:

```scala
abstract class TodosCommand[S] extends JsonCommand {

  /**
   * Extending the [org.scalatra.commands.FieldDescriptor] class with our [TodosStringValidations]
   *
   * This adds the validation to the binding for the FieldDescriptor's b.validateWith function.
   */
  implicit def todoStringValidators(b: FieldDescriptor[String]) = new TodosStringValidations(b)
}
```

Using `implicit def`, we're decorating Scalatra's `FieldDescriptor[String]`
with our new `TodosStringValidations(b)`. This makes the code available
for use in our application.

So let's use it. Now that we've defined the validator and imported it,
all we need to do is add `.startsWithCap()` to our validation line:

```scala
val name: Field[String] = asType[String]("name").notBlank.minLength(3).startsWithCap()
```

It's worth noting that we could just as easily have defined our new
validation in a library, imported it, and used it in our application. This
gives you the ability to build up whatever custom validators you'd like
and carry them around between projects.





<!--

from casualjim:

Here's the rundown of changes between what's documented above, and the new
version commands.

<casualjim> https://gist.github.com/casualjim/7a558cf9bb6e440bf308
<casualjim> lets start with by default we have 4 kinds of executors
<casualjim> the executors are what used to be the command handler
<casualjim> and by default it works with a closure: Command => Result, Command => Model => Result, Command => Future[Result], Command => Model => Future[Result]
<casualjim> the Command => Model step is handled by an implicit conversion
<casualjim> in the example gist I've defined it in the companion object of the command
<casualjim> it being the implicit conversion
<casualjim> https://gist.github.com/casualjim/7a558cf9bb6e440bf308#file-command-scala-L2-L14
<casualjim> that is the setup required
<casualjim> now to actually use a command:
<casualjim> you still do commandOrElse like it used to be before
<casualjim> but now you can use the method execute (aliased to >>) and provide a function with one of these 4 signatures:
<casualjim> Command => Result, CommandModel => Result, Command => Future[Result], CommandModel => FutureResult
<casualjim> you see that here
<casualjim> https://gist.github.com/casualjim/7a558cf9bb6e440bf308#file-example-scala-L4
<casualjim> so because of the implicit conversion defined earlier
<casualjim> https://gist.github.com/casualjim/7a558cf9bb6e440bf308#file-command-scala-L4
<casualjim> from the command Subscribe to the model Subscription
<casualjim> the method that handles the command when it's valid can have this signature
<casualjim> https://gist.github.com/casualjim/7a558cf9bb6e440bf308#file-example-scala-L13
<casualjim> so there is no more pattern match and if the types don't work out it fails compilation instead of failing at runtime
<casualjim> please let me know should you have more questions
<casualjim> at Reverb we have a a few extra executors to work with disjunctions and monad transformers but the idea is the same
<casualjim> the executors provide the machinery previously provided by the CommandHandler
<casualjim> in that they only execute the provided function if the command is valid

  -->
