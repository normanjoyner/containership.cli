---
command-name: 'cloud account edit'
permalink: '/docs/plugins/cloud/cloud-account-edit'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to edit details about your containership cloud account.
</p>

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| phone | p | Phone number associated with your account | n | |
|-----------------|------|-----------|----------------|-------|
| name | n | Name associated with your account | n | |
|-----------------|------|-----------|----------------|-------|
| email | e | Email associated with your account | n | |
|-----------------|------|-----------|----------------|-------|
| metadata | m | Metadata keys associated with your account | n | |
|=================+============+=================+================+===|

> `metadata` is an array so you can add more than one piece of metadata to be associated with your account.
It accepts the `dot-notation` syntax to created nested objects. In order to clear a key, set the value to the
empty string.

Example editing name and adding a metadata key:

`csctl cloud account edit --name Developer -m key1.nestedKey2=one`

Example remove a metadata key:

`csctl cloud account edit -m key1.nestedKey2=`
