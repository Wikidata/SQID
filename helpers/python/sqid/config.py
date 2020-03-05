DUMP_BASENAME = 'wikidata-{date}-all.json.gz'
DUMP_LOCATION = '/public/dumps/public/wikidatawiki/entities/'
DUMP_LINK = '/data/project/sqid/projects/dumpfiles/wikidatawiki/json-{date}/{date}.json.gz'
GRID_SUBMIT = '/usr/bin/jsub'
GRID_MEMORY = '-mem'
GRID_NAME = '-N'
GRID_ONCE = '-once'
DUMP_PROCESS_MEMORY = '21g'
STATISTICS_PROCESS_MEMORY = '2g'
JAVA_BASEDIR = '/data/project/sqid/projects'
JAR = 'org.wikidata.sqid.helper-0.11.0.jar'
JAVA_MEMORY = '5g'
JAVA_CLASS_ARGS = ['-Xmx{memory}'.format(memory=JAVA_MEMORY),
             '-jar', JAR,
             '-a', 'sqid-classes', '-n']
JAVA_STATS_ARGS = ['-Xmx{memory}'.format(memory=JAVA_MEMORY),
             '-jar', JAR,
             '-a', 'sqid-schema', '-n']
RESULTS_LOCATION = '/data/project/sqid/projects/results/wikidatawiki-{date}'
RESULTS_NAMES = ['classes.json', 'properties.json', 'statistics.json']
