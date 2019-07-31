#!/usr/bin/python
# -*- coding: utf-8 -*-

# This script retrieves data about the use of classes and properties
# on Wikidata from SPARQL. The results are processed and stored in the
# files properties.json and classes.json. The script must be run in a
# directory that already contains these files (possibly with no content
# other than an empty map {}). Normally, the files are first generated
# by the Java export tool, which provides some statistics that cannot
# be obtained in an acceptable time from SPARQL.

from __future__ import print_function

import requests
import json
import os
import time
#import pprint

SPARQL_SERVICE_URL = 'https://query.wikidata.org/sparql'
SPARQL_USER_AGENT = 'SQID/1.0 (https://github.com/Wikidata/SQID)'
SPARQL_TOOL_BANNER = '#TOOL:SQID Python Helper\n'

def doSparqlQuery(query):
	r = requests.get(SPARQL_SERVICE_URL,
			 params={'query': SPARQL_TOOL_BANNER + query,
				 'format': 'json'},
			 headers={'user-agent': SPARQL_USER_AGENT})
	return json.loads(r.text)

def sparqlQuery(query):
	try:
		return doSparqlQuery(query)
	except ValueError:
		print("SPARQL query failed, possibly because of a time out. Waiting for 60 sec ...\n")
		time.sleep(60)
		print("Retrying query ...\n")
		try:
			return doSparqlQuery(query)
		except ValueError:
			print("Failed to get SPARQL results. Giving up.")
			return json.loads('{ "error": "timeout", "results": { "bindings": {} } }')


def setPropertyStatistics(propertyStatistics, propertyId, statisticType, numberString):
	try:
		if propertyId in propertyStatistics:
			propertyStatistics[propertyId][statisticType] = int(numberString)
	except ValueError:
		print("Error reading count value " + numberString + ": not an integer number")


def storeStatistics(key, value):
	try:
		with open('statistics.json', 'r') as outfile:
			data = json.load(outfile)
	except OSError:
		data = {}

	data[key] = value
	with open('statistics.json', 'w') as outfile:
		json.dump(data, outfile)

def updateClassRecords() :
	startTime = time.strftime("%Y-%m-%dT%H:%M:%S")
	print("[" + startTime + "] Fetching class ids and labels for classes with direct instances ...")

	resultsClasses = sparqlQuery("""SELECT ?cl ?clLabel ?c
WITH { SELECT ?cl (COUNT(*) AS ?c) WHERE {
   ?i wdt:P31 ?cl
  } GROUP BY ?cl
} AS %classes
WHERE {
  INCLUDE %classes
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en" .
    ?cl rdfs:label ?clLabel .
  }
}""")

	if ( "error" in resultsClasses ):
		print("Failed to fetch class data from SPARQL. Trying simpler query ...")
		resultsClasses = sparqlQuery("""SELECT ?cl ?clLabel
WITH { SELECT DISTINCT ?cl WHERE {
    ?i wdt:P31 ?cl
  }
} AS %classes
WHERE {
  INCLUDE %classes
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en" .
    ?cl rdfs:label ?clLabel .
  }
}""")
		if ( "error" in resultsClasses ):
			print("Failed to fetch class data from SPARQL. Giving up.")
			return

	print("Augmenting current class data ...")
	classesWithInstances = {}
	try:
		with open('classes.json') as classFile:
			data = json.load(classFile)
	except OSError:
		data = {}

	for binding in resultsClasses['results']['bindings']:
		classUri = binding['cl']['value']
		if classUri[0:31] == 'http://www.wikidata.org/entity/':
			classId = classUri[32:]
			classesWithInstances[classId] = True
			classLabel = binding['clLabel']['value']
			if classId in data:
				data[classId]['l'] = classLabel
				if "c" in binding:
					data[classId]['i'] = int(binding['c']['value'])
			else:
				if "c" in binding:
					data[classId] = {'l':classLabel, 'i':int(binding['c']['value'])}
				else:
					data[classId] = {'l':classLabel}
	# zero instance counts for classes not found in the query:
	for classId in data:
		if classId not in classesWithInstances:
			data[classId]['i'] = 0

	print("Writing json class data ...")
	with open('classes-new.json', 'w') as outfile:
		json.dump(data, outfile,separators=(',', ':'))

	print("Replacing classes json file ...")
	os.rename("classes-new.json","classes.json")

	storeStatistics('classUpdate',startTime)
	print("Class update complete.")


def updatePropertyRecords() :
	startTime = time.strftime("%Y-%m-%dT%H:%M:%S")
	print("[" + startTime + "] Fetching property ids, labels, and types ...")

	resultsProperties = sparqlQuery("""SELECT ?id ?idLabel ?type
WITH { SELECT ?id ?type WHERE {
    ?id a wikibase:Property ;
          wikibase:propertyType ?type .
  }
} AS %properties
WHERE {
  INCLUDE %properties .
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en" .
    ?id rdfs:label ?idLabel .
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
			propertyStatistics[propertyUri[32:]] = {'l': propertyLabel, 't': typeName, 's': 0, 'q': 0, 'r': 0}
		else:
			print('Error reading property URI ' + propertyUri)

	print("Fetching property usage statistics ...")

	resultsPropertyCounts = sparqlQuery("""SELECT ?p (count(*) as ?c) WHERE {
  ?s ?p ?o .
} GROUP BY ?p ORDER BY DESC(?c)""");

	for binding in resultsPropertyCounts['results']['bindings']:
		propertyUri = binding['p']['value']
		# Note: Always check for longest matches first
		# Checking for reference/value and quantifier/value is not necessary to get overall counts
		#if len(propertyUri)>45 and propertyUri[0:45] == 'http://www.wikidata.org/prop/reference/value/':
			#propertyId = propertyUri[46:]
			#setPropertyStatistics(propertyStatistics, propertyId,'rv', binding['c']['value'])
		#elif len(propertyUri)>45 and propertyUri[0:45] == 'http://www.wikidata.org/prop/qualifier/value/':
			#propertyId = propertyUri[46:]
			#setPropertyStatistics(propertyStatistics, propertyId,'qv', binding['c']['value'])
		if len(propertyUri)>39 and propertyUri[0:39] == 'http://www.wikidata.org/prop/reference/':
			propertyId = propertyUri[40:]
			setPropertyStatistics(propertyStatistics, propertyId,'r', binding['c']['value'])
		elif len(propertyUri)>39 and propertyUri[0:39] == 'http://www.wikidata.org/prop/qualifier/':
			propertyId = propertyUri[40:]
			setPropertyStatistics(propertyStatistics, propertyId,'q', binding['c']['value'])
		elif len(propertyUri)>29 and propertyUri[0:29] == 'http://www.wikidata.org/prop/':
			propertyId = propertyUri[30:]
			setPropertyStatistics(propertyStatistics, propertyId,'s', binding['c']['value'])
		#else:
		#	# The rest are Wikibase ontology properties and some RDF(S) and schema.org URIs:
		#	print binding['p']['value'] + ' = ' + binding['c']['value']

	print("Augmenting current property data ...")
	try:
		with open('properties.json') as propertyFile:
			data = json.load(propertyFile)
	except OSError:
		data = {}

	for propertyId, propertyData in propertyStatistics.items():
		if propertyId in data:
			data[propertyId]['l'] = propertyData['l']
			data[propertyId]['d'] = propertyData['t']
			data[propertyId]['s'] = propertyData['s']
			data[propertyId]['q'] = propertyData['q']
			data[propertyId]['e'] = propertyData['r']
		else:
			data[propertyId] = { 'l': propertyData['l'], 'd': propertyData['t'], 's': propertyData['s'], 'q': propertyData['q'], 'e': propertyData['r']}

	print("Writing json property data ...")
	with open('properties-new.json', 'w') as outfile:
		json.dump(data, outfile,separators=(',', ':'))

	print("Replacing properties json file ...")
	os.rename("properties-new.json","properties.json")

	storeStatistics('propertyUpdate',startTime)
	print("Property update complete.")

#pprint.pprint(propertyStatistics)

if __name__ == '__main__':
	# ensure we are in the correct directory
	wd = os.getcwd()
	try:
		os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),
				      '..', '..', 'src', 'data'))
		updateClassRecords()
		updatePropertyRecords()
	finally:
		os.chdir(wd)
