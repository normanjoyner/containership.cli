---
command-name: 'svc list'
permalink: '/docs/commands/svc-list'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to view a list of all the services running on your cluster with
some basic metadata about each service displayed.
</p>

~~~
csctl svc list

┌─────────────────────────────────┬────────────────────────────────────────────┬─────────┬──────┬────────┬────────────┐
│ ID                              │ IMAGE                                      │ COMMAND │ CPUS │ MEMORY │ CONTAINERS │
├─────────────────────────────────┼────────────────────────────────────────────┼─────────┼──────┼────────┼────────────┤
│ containership-logs              │ containership/docker-cs-logs:latest        │         │ 0.1  │ 64     │ 1/1        │
├─────────────────────────────────┼────────────────────────────────────────────┼─────────┼──────┼────────┼────────────┤
│ containership-ntp               │ containership/ntp:latest                   │         │ 0.1  │ 16     │ 1/1        │
├─────────────────────────────────┼────────────────────────────────────────────┼─────────┼──────┼────────┼────────────┤
│ containership-prometheus        │ containership/prometheus-metric-server:v2  │         │ 0.1  │ 320    │ 1/1        │
├─────────────────────────────────┼────────────────────────────────────────────┼─────────┼──────┼────────┼────────────┤
│ containership-prometheus-agents │ containership/prometheus-metric-targets:v2 │         │ 0.1  │ 128    │ 1/1        │
└─────────────────────────────────┴────────────────────────────────────────────┴─────────┴──────┴────────┴────────────┘
~~~
