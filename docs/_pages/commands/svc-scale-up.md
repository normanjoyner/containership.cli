---
command-name: 'svc scale-up'
permalink: '/docs/commands/svc-scale-up'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to scale up a service running on your cluster.

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| count | c | Number of containers to scale service by | n | 1 |
|=================+============+=================+================+===|

~~~
csctl svc scale-up sampleredis --count=1

Successfully scaled up service sampleredis!
~~~
