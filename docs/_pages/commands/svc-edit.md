---
command-name: 'svc edit'
permalink: '/docs/commands/svc-edit'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to edit an existing service running on your cluster.
To edit a service you can run the `svc create <service_name> ...flags` with any of the following flags
specified:

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| image | i | Docker image for the service to run | y | |
|-----------------+------------+-----------------+----------------|
| env-var | e | Environment variable to add to the service | n | |
|-----------------+------------+-----------------+----------------|
| network-mode | n | Network mode for the service to run in (bridge or host) | y | bridge |
|-----------------+------------+-----------------+----------------|
| container-port | p | Container port the service is listening on | n | |
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
| respawn | | Whether or not the container respawns after exit | n | true |
|=================+============+=================+================+===|

> All array values, e.g. (env-var, volume, tag) can be added multiple times during a service edit. If
you set the value of an array option to the empty string, that value will be cleared if it exists.

> Tags support the dot-notation syntax for creating nested tags. e.g. (--tag metadata.hasSeen=true)

Example: Editing a redis service

~~~
csctl svc edit sampleredis --image=library/redis:3.0.7 -m 64 -c 0.1 -p 6379

Successfully edited service sampleredis!
~~~
