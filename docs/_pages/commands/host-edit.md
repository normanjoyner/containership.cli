---
command-name: 'host edit'
permalink: '/docs/commands/host-edit'
---

<h2> {{ page.command-name }} </h2>

The {{ page.command-name }} command allows you to edit tags on an existing host in your containership cluster.

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| tag | t | Tag to add to the container | n | |
|=================+============+=================+================+===|

> All array values can be added multiple times during a host edit. If
you set the value of an array option to the empty string, that value will be cleared if it exists.

> Tags support the dot-notation syntax for creating nested tags. e.g. (--tag metadata.hasSeen=true)

Example: Editing tags on a host

~~~
$ ./bin/cli.js host edit 0130a049-4d15-46fc-96a5-85e1cb29212c --tag key1=value1

Successfully updated host 0130a049-4d15-46fc-96a5-85e1cb29212c!
~~~

You can then see the updated tag reflected in the `show` command.

~~~
$ ./bin/cli.js host show 0130a049-4d15-46fc-96a5-85e1cb29212c
┌───────────────────────┬────────────────────────────────────────────────────────────────────┐
│ ID                    │ 0130a049-4d15-46fc-96a5-85e1cb29212c                               │
├───────────────────────┼────────────────────────────────────────────────────────────────────┤
│ START_TIME            │ Thu Aug 24 2017 12:51:28 GMT-0400 (EDT)                            │
├───────────────────────┼────────────────────────────────────────────────────────────────────┤
│ MODE                  │ follower                                                           │
├───────────────────────┼────────────────────────────────────────────────────────────────────┤
│ PUBLIC_IP             │ 255.255.255.213                                                    │
├───────────────────────┼────────────────────────────────────────────────────────────────────┤
│ PRIVATE_IP            │ 10.136.68.29                                                       │
├───────────────────────┼────────────────────────────────────────────────────────────────────┤
│ TAGS                  │ host: 0130a049-4d15-46fc-96a5-85e1cb29212c                         │
│                       │ key1: value1                                                       │
│                       │ host_name: 0130a049-4d15-46fc-96a5-85e1cb29212c                    │
│                       │ cloud.region: nyc1                                                 │
│                       │ cloud.provider: digital_ocean                                      │
│                       │ cloud.droplet_id: 59692330                                         │
│                       │ metadata.nodeInfo.machineID: 5d12f049cbc39eb705e94d4b4fe4e580      │
│                       │ metadata.nodeInfo.systemUUID: E06BA1F4-918B-4FD9-9239-088A3C4D1264 │
│                       │ metadata.nodeInfo.bootID: 546f577b-4ed9-4771-bc0c-723567774c28     │
│                       │ metadata.nodeInfo.kernelVersion: 3.13.0-125-generic                │
│                       │ metadata.nodeInfo.osImage: Debian GNU/Linux 8 (jessie)             │
│                       │ metadata.nodeInfo.containerRuntimeVersion: docker://Unknown        │
│                       │ metadata.nodeInfo.kubeletVersion: v1.6.7                           │
│                       │ metadata.nodeInfo.kubeProxyVersion: v1.6.7                         │
│                       │ metadata.nodeInfo.operatingSystem: linux                           │
│                       │ metadata.nodeInfo.architecture: amd64                              │
├───────────────────────┼────────────────────────────────────────────────────────────────────┤
│ CPUS (USED / TOTAL)   │ 0.400 / 2.000                                                      │
├───────────────────────┼────────────────────────────────────────────────────────────────────┤
│ MEMORY (USED / TOTAL) │ 528 MB / 1954 MB                                                   │
├───────────────────────┼────────────────────────────────────────────────────────────────────┤
│ CONTAINERS            │ 4                                                                  │
└───────────────────────┴────────────────────────────────────────────────────────────────────┘
~~~
