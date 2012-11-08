---
layout: default
title: Scalatra Guides | Databinders
---

Scalatra includes a very sophisticated set of databinders. 

These allow you to parse incoming data, instantiate objects, and automatically apply validations to the objects. 

To see how Scalatra's databinders work, let's make a TodoList application. We'll use `org.scalatra.example.databinding` domain as a namespace, you can change to your own domain throughout the codebase.

```shell
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

Before we start actually building the controller, let's set up some fake data. 

Add two folders in `org.scalatra.example.databinding`: call one `models` and the other `data`.

Inside the `models` folder, add a file called `Models.scala`, with the following contents:

```scala
package com.futurechimps.example.databindings.models

// A Todo object to use as a data model 
case class Todo(id: Integer, name: String)
```

You might drop a few more models in there later on, but for now we'll just define a single `Todo` model.

Next, inside the `data` folder, add a file called `TodoData.scala`, with the following contents:

```scala
package org.scalatra.example.databinding.data

import org.scalatra.example.databinding.models._

object TodoData {

  /**
   * Some fake flowers data so we can simulate retrievals.
   */
  var all = List(
      Todo(1, "Shampoo the cat"),
      Todo(2, "Wax the floor"),
      Todo(3, "Scrub the rug"))
}
```

For the purposes of this example, we won't bother with persisting our Todos 
to disk. The `TodoData` object acts as temporary storage of our Todos.

Let's move back to the TodosController, and get databinding working. 

Just to see if everything is working, let's try and retrieve a single Todo. Put this action in your controller:

```scala
  get("/todos/:id") {
    TodoData.all find (_.id == params("id").toInt) match {
      case Some(todo) => todo
      case None => halt(404)
    }
  }
```