---
command-name: 'cloud org use'
permalink: '/docs/plugins/cloud/cloud-org-use'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to set the given organization as the active org for the command line client.
</p>


`csctl cloud org use <org_id>`

Once you have an active organization, you can list all the clusters available underneath that organization:

~~~
csctl cloud cluster list

┌──────────────────────────────────────┬───────────────────────────┬─────────────┬────────────────┬────────────┬───────────┐
│ ID                                   │ NAME                      │ ENVIRONMENT │ CLOUD_PROVIDER │ HOST_COUNT │ APP_COUNT │
├──────────────────────────────────────┼───────────────────────────┼─────────────┼────────────────┼────────────┼───────────┤
│ 00000000-0000-0000-0000-000000000000 │ sample-cluster            │ dev         │ Digital Ocean  │ 2          │ 4         │
└──────────────────────────────────────┴───────────────────────────┴─────────────┴────────────────┴────────────┴───────────┘
~~~
