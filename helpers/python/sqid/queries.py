QUERY_CLASSES = """SELECT ?cl ?clLabel ?c
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
}"""
QUERY_CLASSSES_FALLBACK = """SELECT ?cl ?clLabel
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
}"""
QUERY_PROPERTIES = """SELECT ?id ?idLabel ?type
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
}"""
QUERY_PROPERTY_USAGE = """SELECT ?p (count(*) as ?c) WHERE {
  ?s ?p ?o .
} GROUP BY ?p ORDER BY DESC(?c)"""
