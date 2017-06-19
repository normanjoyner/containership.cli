---
command-name: 'cloud org show'
permalink: '/docs/plugins/cloud/cloud-org-show'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to view detailed information about the given organization.
</p>

~~~
csctl cloud org show <org_id>

┌──────────────┬──────────────────────────────────────────────────────────────────────┐
│ ID           │ <org_id>                                                             │
├──────────────┼──────────────────────────────────────────────────────────────────────┤
│ ORGANIZATION │ sample-org                                                           │
├──────────────┼──────────────────────────────────────────────────────────────────────┤
│ OWNER        │ Developer                                                            │
├──────────────┼──────────────────────────────────────────────────────────────────────┤
│ TIER         │ standard                                                             │
├──────────────┼──────────────────────────────────────────────────────────────────────┤
│ CREATED_AT   │ 2016-08-01T15:23:50.807Z                                             │
├──────────────┼──────────────────────────────────────────────────────────────────────┤
│ TEAMS        │ Organization Admins: Users with access to core organization settings │
│              │ Permissions Testing: testing permission error responses              │
│              │ frontend: frontend team                                              │
│              │ backend: backend team                                                │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
~~~
