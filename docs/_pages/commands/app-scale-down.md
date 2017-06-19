---
command-name: 'app scale-down'
permalink: '/docs/commands/app-scale-down'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to scale down an application running on your cluster.
</p>

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| count | c | Number of containers to scale application by | n | 1 |
|=================+============+=================+================+===|

~~~
csctl app scale-down sampleredis --count=1

Successfully scaled down application sampleredis!
~~~
