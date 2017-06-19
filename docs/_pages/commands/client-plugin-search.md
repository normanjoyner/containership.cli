---
command-name: 'client-plugin search'
permalink: '/docs/commands/client-plugin-search'
---

<h2> {{ page.command-name }} </h2>

The {{ page.command-name }} command allows you to search for official containership plugins from the metadata registry.

~~~
./bin/cli.js client-plugin search

┌───────────────────┬────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NAME              │ SOURCE                                 │ DESCRIPTION                                                                                        │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ navigator         │ containership.plugin.navigator         │ A web-ui for managing your ContainerShip cluster                                                   │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ service-discovery │ containership.plugin.service-discovery │ A service discovery plugin for ContainerShip                                                       │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ cloud             │ containership.plugin.cloud             │ Official ContainerShip plugin for managing clusters with ContainerShip Cloud                       │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ cloud-hints       │ containership.plugin.cloud-hints       │ A ContainerShip plugin used to automatically set cloud metadata in the form of host tags           │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ metrics           │ containership.plugin.metrics           │ ContainerShip metrics plugin                                                                       │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ standalone        │ containership.plugin.standalone        │ Official ContainerShip plugin for launching a local ContainerShip cluster                          │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ tide              │ containership.plugin.tide              │ A cron-like job scheduler for ContainerShip                                                        │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ logs              │ containership.plugin.logs              │ Official logging plugin for ContainerShip                                                          │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ntp               │ containership.plugin.ntp               │ Official NTP plugin for ContainerShip                                                              │
└───────────────────┴────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────┘
~~~
