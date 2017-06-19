---
command-name: 'app edit'
permalink: '/docs/commands/app-edit'
---

<h2> {{ page.command-name }} </h2>

The {{ page.command-name }} command allows you to edit an existing application running on your cluster.
To edit an application you can run the `app create <app_name> ...flags` with any of the following flags
specified:

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| image | i | Docker image for the application to run | y | |
|-----------------+------------+-----------------+----------------|
| env-var | e | Environment variable to add to the application | n | |
|-----------------+------------+-----------------+----------------|
| network-mode | n | Network mode for the application to run in (bridge or host) | y | bridge |
|-----------------+------------+-----------------+----------------|
| container-port | p | Container port the application is listening on | n | |
|-----------------+------------+-----------------+----------------|
| command | s | Start command for the container | n | |
|-----------------+------------+-----------------+----------------|
| volume | b | Volume to mount onto the container | n | |
|-----------------+------------+-----------------+----------------|
| tag | t | Tag to add to the container | n | |
|-----------------+------------+-----------------+----------------|
| cpus | c | Number of CPU shares to allocate the container | n | |
|-----------------+------------+-----------------+----------------|
| memory | m | Memory in MB allocated to the container | n | |
|-----------------+------------+-----------------+----------------|
| privileged | | Whether or not the container runs in privileged mode | n | false |
|-----------------+------------+-----------------+----------------|
| respawn | | Whether or not the container respawns after exit | n | false |
|=================+============+=================+================+===|

> All array values, e.g. (env-var, volume, tag) can be added multiple times during an application edit. If
you set the value of an array option to the empty string, that value will be cleared if it exists.

> Tags support the dot-notation syntax for creating nested tags. e.g. (--tag metadata.hasSeen=true)

Example: Editing a redis application

~~~
csctl app create sampleredis --image=library/redis:3.0.7 -m 64 -c 0.1 -p 6379

Successfully edited application sampleredis!
~~~
