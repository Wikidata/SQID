<template>
  <sqid-bars>
    <template v-slot:mainbar>
	    <h1>About SQID</h1>
	    <p>SQID is a project of the <a href="https://kbs.inf.tu-dresden.de">Knowledge-Based Systems Group</a>
        of <a href="https://tu-dresden.de/">TU Dresden</a>.

        Developers include Markus Krötzsch, Michael Günther, Markus Damm, Georg Wild, and Maximilian Marx.</p>
	    <p>SQID is programmed in TypeScript with additional server-side code in Java and Python to
        extract, query, and preprocess data.</p>

	    <h2>What does SQID mean?</h2>
	    <p>The origin of the name is unknown, but it seems to be an abbreviation of something.
	      Current hypotheses include:
	      <ul>
		      <li>Searching, Querying, and Interacting with Data</li>
		      <li>Sweet QIDs</li>
		      <li>SPARQL Querying Isn't Difficult</li>
		      <li>Surprisingly Quick Information Display</li>
		      <li>See Quality In Data</li>
        </ul>
        Another possible theory is that the name is indeed inspired by
        the high intelligence, amazing social skills, and sharp vision
        that are characteristic for
        many <a href="https://en.wikipedia.org/wiki/Cephalopoda">cephalopods</a>
        and Wikidata editors alike.</p>

      <h2>Where can I make comments and contributions?</h2>
      <p>All code is found in
        our <a href="https://github.com/Wikidata/SQID/">public
          repository</a>. Bugs and wishes are best reported
        by <a href="https://github.com/Wikidata/SQID/issues">submitting
          an issue there</a>. Pull requests are welcome.
      </p>
    </template>
    <template v-slot:sidebar>
      <sqid-image file="Squid_komodo.jpg" width="260" />
      <div style="text-align: center; width: 100%;">Please don't eat me.</div>
    </template>
  </sqid-bars>
</template>
