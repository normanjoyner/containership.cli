---
command-name: 'svc create-from-file'
permalink: '/docs/commands/svc-create-from-file'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to create new services from pre-existing configuration files. You can
easily convert your existing docker-compose or kubernetes yaml files into Containership Services. The converter supports
configuration files of types: containership, kubernetes, or docker format. You pass the type of the incoming
file with the `type` flag and the path to the file with the `file` flag.

> It will automatically infer the version of the underlying configuration file, you just need to specify the overarching type.

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| file | f | Path to the file being passed in | y | |
|-----------------+------------+-----------------+----------------|
| type | t | Type of source file configuration being passed in: docker, kubernetes, containership | y | |
|=================+============+=================+================+===|

Example: Creating services from a docker configuration

~~~
csctl svc create-from-file -t docker -f ../path/to/dockerconfig

Successfully created services redis, webapp, mysql!
~~~

To view the newly created services you can run `csctl svc list`
