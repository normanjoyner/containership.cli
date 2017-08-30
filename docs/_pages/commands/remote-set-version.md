---
command-name: 'remote set-version'
permalink: '/docs/commands/remote-set-version'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to update the expected Containership open-source API version
for a remote.

`csctl remote set-version <remote_name> <remote_version>`

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| remote_name | | Name of the remote for local reference | y | |
| remote_version | | URL of one of the `leader` nodes on your cluster | y | v1 |
|=================+============+=================+================+===|

> Currently only version `v1` exists and this will always default to the currently expected Containership API version. This command
is only of use if you have legacy clusters you need to interface with that are on an older API version.
