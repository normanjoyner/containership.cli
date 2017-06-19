---
command-name: 'app scale-up'
permalink: '/docs/commands/app-scale-up'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to scale up an application running on your cluster.
</p>

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| count | c | Number of containers to scale application by | n | 1 |
|=================+============+=================+================+===|

~~~
csctl app scale-up sampleredis --count=1

Successfully scaled up application sampleredis!
~~~
