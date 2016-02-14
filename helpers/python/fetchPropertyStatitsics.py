#!/usr/bin/python
# -*- coding: utf-8 -*-

# This simple example script retrieves all Wikidata properties, their English
# labels, datatype name, and how often they are currently used as the main property
# in statements, as a qualifier in statements, and in references.
# Currently, the result is just printed. It could also be written to a file in
# some format of choice.

import requests
import json
import pprint

SPARQL_SERVICE_URL = 'https://query.wikidata.org/sparql'

def sparqlQuery(query):
	r = requests.get(SPARQL_SERVICE_URL, params={'query': query, 'format': 'json'});
	return json.loads(r.text)

def setPropertyStatistics(propertyStatistics, propertyId, statisticType, numberString):
	try:
		if propertyId in propertyStatistics:
			propertyStatistics[propertyId][statisticType] = int(numberString)
	except ValueError:
		print "Error reading count value " + numberString + ": not an integer number"


resultsProperties = sparqlQuery("""PREFIX wikibase: <http://wikiba.se/ontology#>
SELECT ?id ?idLabel ?type
WHERE {
    ?id a wikibase:Property .
    ?id wikibase:propertyType ?type
    SERVICE wikibase:label {
         bd:serviceParam wikibase:language "en" .
    }
}""")

propertyStatistics = {}
for binding in resultsProperties['results']['bindings']:
	propertyUri = binding['id']['value']
	if propertyUri[0:31] == 'http://www.wikidata.org/entity/':
		propertyLabel = binding['idLabel']['value']
		typeUri = binding['type']['value']
		if typeUri[0:26] == 'http://wikiba.se/ontology#':
			typeName = typeUri[26:]
		else:
			typeName = 'UNKNOWN'
		propertyStatistics[propertyUri[31:]] = {'l': propertyLabel, 't': typeName, 's': 0, 'q': 0, 'r': 0}
	else:
		print 'Error reading property URI ' + propertyUri

resultsPropertyCounts = sparqlQuery("""SELECT ?p (count(*) as ?c)
WHERE {
    ?s ?p ?o .
}
GROUP BY ?p
ORDER BY DESC(?c)""");

for binding in resultsPropertyCounts['results']['bindings']:
	propertyUri = binding['p']['value']
	# Note: Always check for longest matches first
	# Checking for reference/value and quantifier/value is not necessary to get overall counts
	#if len(propertyUri)>45 and propertyUri[0:45] == 'http://www.wikidata.org/prop/reference/value/':
		#propertyId = propertyUri[45:]
		#setPropertyStatistics(propertyStatistics, propertyId,'rv', binding['c']['value'])
	#elif len(propertyUri)>45 and propertyUri[0:45] == 'http://www.wikidata.org/prop/qualifier/value/':
		#propertyId = propertyUri[45:]
		#setPropertyStatistics(propertyStatistics, propertyId,'qv', binding['c']['value'])
	if len(propertyUri)>39 and propertyUri[0:39] == 'http://www.wikidata.org/prop/reference/':
		propertyId = propertyUri[39:]
		setPropertyStatistics(propertyStatistics, propertyId,'r', binding['c']['value'])
	elif len(propertyUri)>39 and propertyUri[0:39] == 'http://www.wikidata.org/prop/qualifier/':
		propertyId = propertyUri[39:]
		setPropertyStatistics(propertyStatistics, propertyId,'q', binding['c']['value'])
	elif len(propertyUri)>29 and propertyUri[0:29] == 'http://www.wikidata.org/prop/':
		propertyId = propertyUri[29:]
		setPropertyStatistics(propertyStatistics, propertyId,'s', binding['c']['value'])
	#else:
	#	# The rest are Wikibase ontology properties and some RDF(S) and schema.org URIs:
	#	print binding['p']['value'] + ' = ' + binding['c']['value']

pprint.pprint(propertyStatistics)
