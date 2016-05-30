# SQID
(a.k.a. Wikidata Class Browser)

This repository contains the code for the [SQID Wikidata Browser](http://tools.wmflabs.org/sqid/).
You can use the application online without installing anything.

## Submitting comments, bug reports, feature requests

Use the [SQID Issues](https://github.com/Wikidata/WikidataClassBrowser/issues) page on
github to report issues and to find out if your issue is already known or even being worked on.

## Installation

You do not normally need to install this yourself, since it is a Web application that you can use in your browser. Developers who want to change the code should have a local copy that runs though. This is farily easy:

* Download the files. The Web application is in the src folder, which should be made accessible through your local web server.
* Get some data. You can copy the example json data files from [src/data/exampleData](src/data/exampleData) to [src/data/](src/data) to get started. You can update these files by running the Python scripts under [helpers/python](helpers/python) from this directory, but this will not recreate all statistics (this is done with a Java program not currently available here). You can also [download most recent updated json files](http://tools.wmflabs.org/sqid/data/.)

## License

The code in this repository is released under the [Apache 2.0](LICENSE) license. External libraries used may have their own licensing terms.
