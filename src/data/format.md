JSON Format Documentation
=========================

All entity ids in the data omit the initial "Q" or "P".

classes.json
------------

Map with item ids as keys and data maps as values.
Values may contain the following keys:
* ```l``` label, can be null if not found (Java/Python)
* ```i``` number of direct instances (Java/Python)
* ```s``` number of direct subclasses (Java)
* ```ai``` number of all direct and indirect instances (Java)
* ```as``` number of all direct and indirect subclasses (Java)
* ```sc``` list of all superclasses, given as string item ids (Java)
* ```sb``` list of all direct subclasses that have some instance or subclass, given as string item ids (Java)
* ```r``` related properties, documented below (Java)

properties.json
---------------

Map with property ids as keys and data maps as values.
Values may contain the following keys:
* ```l``` label, can be null if not found (Java/Python)
* ```d``` datatype (Python)
* ```i``` number of items with statements with this property
* ```s``` number of statements using this property (Python)
* ```q``` number of qualifiers using this property (Python)
* ```e``` number of uses of this property in references (Python)
* ```r``` related properties, documented below (Java)
* ```qs``` quantifier properties used in statements with this property
   this is a map from property ids to the number of occurrences of a particular quantifier property
    (Java)
* ```u``` URL pattern for creating a link from strings (Java)
* ```pc``` list of ids of classes that this property is a direct instance of (Java)

Related properties
------------------

Related properties are stored in maps, with property ids as keys and a relatedness score as value.
The maps usually contain *all* properties that occur together with the class/property, even the
ones that are quite rare.

The relatedness score makes it possible to find out which properties are *most related*. The relatedness
of a property is based on the relationship of statements with this property that occur in the current
context (class/property) and the number of statements that occur in other contexts. As a rule
of thumb, scores above 15 usually indicate good relatedness. However, certain classes/properties
may still have a big number of high-scoring related properties.
