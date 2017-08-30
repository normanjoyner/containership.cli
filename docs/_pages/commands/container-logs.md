---
command-name: 'container logs'
permalink: '/docs/commands/container-logs'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to stream stdout and stderr logs from a container.

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| type | t | Type of logs to stream (stdout, stderr, or all) | n | all |
|=================+============+=================+================+===|

Example stdout log streaming:

`csctl container logs <container_id> -t stdout > stdout`

Example stderr log streaming:

`csctl container logs <container_id> -t stderr > stderr`

Example of both stdout and stderr log streaming:

`csctl container logs <container_id> -t all > allthelogs`
