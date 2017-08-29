---
command-name: 'svc show'
permalink: '/docs/commands/svc-show'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to view a details about a specific
service running on your cluster.
</p>

~~~
csctl svc show containership-logs

┌────────────────┬───────────────────────────────────────────────┐
│ IMAGE          │ containership/docker-cs-logs:latest           │
├────────────────┼───────────────────────────────────────────────┤
│ DISCOVERY_PORT │ 31117                                         │
├────────────────┼───────────────────────────────────────────────┤
│ COMMAND        │                                               │
├────────────────┼───────────────────────────────────────────────┤
│ ENGINE         │ docker                                        │
├────────────────┼───────────────────────────────────────────────┤
│ NETWORK_MODE   │ bridge                                        │
├────────────────┼───────────────────────────────────────────────┤
│ CONTAINER_PORT │ 3000                                          │
├────────────────┼───────────────────────────────────────────────┤
│ CPUS           │ 0.1                                           │
├────────────────┼───────────────────────────────────────────────┤
│ MEMORY         │ 64                                            │
├────────────────┼───────────────────────────────────────────────┤
│ RESPAWN        │ true                                          │
├────────────────┼───────────────────────────────────────────────┤
│ PRIVLEGED      │ false                                         │
├────────────────┼───────────────────────────────────────────────┤
│ ENV_VARS       │ CSHIP_LOG_PATH: /var/log/containership        │
├────────────────┼───────────────────────────────────────────────┤
│ VOLUMES        │ /var/log/containership:/var/log/containership │
├────────────────┼───────────────────────────────────────────────┤
│ TAGS           │ metadata.plugin: containership-logs           │
│                │ metadata.ancestry: containership.plugin       │
│                │ constraints.per_host: 1                       │
└────────────────┴───────────────────────────────────────────────┘
~~~
