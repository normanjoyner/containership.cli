---
command-name: 'cloud cluster delete'
permalink: '/docs/plugins/cloud/cloud-cluster-delete'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to delete a containership cluster and all VMs associated with it.

|------+----+------------+----|
| Argument | Alias | Description | Required |
|-----------------|------|-----------|----------------|
| force | f | Force deletion, without confirmation prompt | n |
|=================+============+=================+================|

> Note: This is a destructive command and should be used with care! This will prompt for confirmation, in the absence of a `force` flag.

~~~
csctl cloud cluster delete <cluster_id> [--force]

Successfully deleted cluster!
~~~
