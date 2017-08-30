---
permalink: '/docs/installation/'
---
---

# Installation

The CLI supports the following installation methods:

## Docker

The preferred way of running the CLI is through a published docker image. You can pull
down the latest version of the image with the following docker command:

`docker pull containership/containership.cli:latest`

You can then run any of the commands while mounting in your `.containership` configuration directory:

`docker run -v $HOME/.containership:/root/.containership -it containership/containership.cli --help`

We recommend you alias this command to either `cs` or `csctl` for ease of execution. You can place the following
line in your shell configuration file (e.g. `~/.bashrc`, `~/.bash_profile`, `~/.zshrc`, etc.):

~~~
alias cs="docker run -it -v $HOME/.containership:/root/.containership containership/containership.cli"
~~~

## NPM

You can install the latest version of the CLI through NPM by installing it globally:

`npm install @containership/containership.cli -g`

Then you can execute the CLI with either of the following two commands:

`cs --help` or `csctl --help`

## From Source

You can also clone the repository locally and manually install and run the client from source:

~~~bash
git clone https://github.com/containership/containership.cli
cd containership.cli
npm install
~~~

Then you can run the executable from the `bin` directory of the repository:

`./bin/cli.js --help`
