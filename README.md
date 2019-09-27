# SQID
(a.k.a. Wikidata Class Browser)

This repository contains the code for the [SQID Wikidata Browser](http://tools.wmflabs.org/sqid/).
You can use the application online without installing anything.

## Submitting comments, bug reports, feature requests

Use the [SQID Issues](https://github.com/Wikidata/SQID/issues) page on
github to report issues and to find out if your issue is already known or even being worked on.

## Installation

You do not normally need to install this yourself, since it is a Web application that you can use in your browser. Developers who want to change the code should have a local copy that runs though. This is farily easy:

* Download the files. To install dependencies, run `npm install`. For local development, use `npm run serve`, which will start a local web server serving the application. For production builds, use `npm run build` and make the `dist/` directory available using your local web server.
* Get some data. You can copy the example json data files from [src/data/exampleData](src/data/exampleData) to [src/data/](src/data) to get started. You can update these files by running the Python script `update-statistics.py` under [helpers/python](helpers/python) from this directory, but this will not recreate all statistics. You can also [download most recent updated json files](http://tools-static.wmflabs.org/sqid/data/).
* Optionally recreate all statistics. The program to do this is the java "sqid-helper" under [helpers/java](helpers/java), using [Wikidata Toolkit](https://github.com/Wikidata/Wikidata-Toolkit). The main code is in [SchemaUsageAnalyzer.java](https://github.com/Wikidata/SQID/blob/master/helpers/java/src/main/java/org/wikidata/wdtk/client/SchemaUsageAnalyzer.java). The code is invoked by using the command-line client (running the client will show a help message that includes this action).

## Deployment on Wikimedia Toolforge

An ansible playbook for deployment on Toolforge is available in [helpers/ansible](helpers/ansible), run `ansible-playbook -i production site.yml` to build the java helper package and the app bundle, and deploy them to Toolforge. Use `ansible-playbook -i production site.yml --tags all,clean` to also force a clean rebuild.

## License

The code in this repository is released under the [Apache 2.0](LICENSE) license. External libraries used may have their own licensing terms.
