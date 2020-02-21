package org.wikidata.sqid.helper;

/*-
 * #%L
 * SQID Wikidata browser statistics helper
 * %%
 * Copyright (C) 2015 - 2020 SQID Developers, Wikidata Toolkit Developers
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.InjectableValues;
import com.fasterxml.jackson.databind.JsonMappingException;

import org.wikidata.wdtk.datamodel.helpers.Datamodel;
import org.wikidata.wdtk.datamodel.interfaces.ItemDocument;
import org.wikidata.wdtk.datamodel.interfaces.ItemIdValue;
import org.wikidata.wdtk.datamodel.interfaces.PropertyDocument;
import org.wikidata.wdtk.datamodel.interfaces.PropertyIdValue;
import org.wikidata.wdtk.datamodel.interfaces.SiteLink;
import org.wikidata.wdtk.datamodel.interfaces.Snak;
import org.wikidata.wdtk.datamodel.interfaces.SnakGroup;
import org.wikidata.wdtk.datamodel.interfaces.Statement;
import org.wikidata.wdtk.datamodel.interfaces.StatementDocument;
import org.wikidata.wdtk.datamodel.interfaces.StatementGroup;
import org.wikidata.wdtk.datamodel.interfaces.StatementRank;
import org.wikidata.wdtk.datamodel.interfaces.StringValue;
import org.wikidata.wdtk.datamodel.interfaces.TermedDocument;
import org.wikidata.wdtk.datamodel.interfaces.Value;
import org.wikidata.wdtk.datamodel.interfaces.ValueSnak;

/**
 *
 * @author Markus Kroetzsch
 */
public class SchemaUsageAnalyzer extends DumpProcessingAction {

  private static final ItemIdValue ItemGadgetAuthorityControl = Datamodel.makeWikidataItemIdValue("Q22348290");

  /**
   * Simple record class to keep track of some usage numbers for one type of
   * entity.
   *
   * @author Markus Kroetzsch
   *
   */
  class EntityStatistics {
    @JsonProperty("c")
    long count = 0;
    @JsonProperty("cLabels")
    long countLabels = 0;
    @JsonProperty("cDesc")
    long countDescriptions = 0;
    @JsonProperty("cAliases")
    long countAliases = 0;
    @JsonProperty("cStmts")
    long countStatements = 0;
    // long countReferencedStatements = 0;

    // Maps to store property usage data for each language:
    // final HashMap<String, Integer> labelCounts = new HashMap<>();
    // final HashMap<String, Integer> descriptionCounts = new HashMap<>();
    // final HashMap<String, Integer> aliasCounts = new HashMap<>();
  }

  private class SiteRecord {
    @JsonProperty("u")
    final String urlPattern;

    @JsonProperty("g")
    final String group;

    @JsonProperty("l")
    final String language;

    @JsonProperty("i")
    long itemCount = 0;

    public SiteRecord(String language, String urlPattern, String group) {
      this.urlPattern = urlPattern;
      this.group = group;
      this.language = language;
    }
  }

  /**
   * Collection of all site records of items used as classes.
   */
  final HashMap<String, SiteRecord> siteRecords = new HashMap<>();

  /**
   * Total number of items processed.
   */
  private long countEntities = 0;

  /**
   * Total number of site links.
   */
  private long countSiteLinks = 0;

  private final EntityStatistics itemStatistics = new EntityStatistics();
  private final EntityStatistics propertyStatistics = new EntityStatistics();

  @Override
  public void processItemDocument(ItemDocument itemDocument) {
    // Record relevant labels:
    Integer itemId = getNumId(itemDocument.getEntityId().getId(), false);
    Optional<ClassRecord> classRecord = Optional.ofNullable(this.classRecords.get(itemId));
    classRecord.ifPresent(record -> record.label = itemDocument.findLabel("en"));

    countTerms(itemDocument, itemStatistics);
    processStatementDocument(itemDocument, itemStatistics);

    this.countSiteLinks += itemDocument.getSiteLinks().size();
    itemDocument.getSiteLinks().values().forEach(this::countSiteLink);
  }

  private void countSiteLink(SiteLink siteLink) {
    if (!this.siteRecords.containsKey(siteLink.getSiteKey())) {
      String key = siteLink.getSiteKey();
      String url = this.sites.getPageUrl(key, "$Placeholder12345");
      if (url == null) {
        System.err.println("Could not find site information for " + key);
      } else {
        url = url.replace("%24Placeholder12345", "$1");
      }
      this.siteRecords.put(key, new SiteRecord(this.sites.getLanguageCode(key), url, this.sites.getGroup(key)));
    }
    this.siteRecords.get(siteLink.getSiteKey()).itemCount++;
  }

  @Override
  public void processPropertyDocument(PropertyDocument propertyDocument) {
    // Record relevant labels:
    PropertyRecord pr = getPropertyRecord(propertyDocument.getEntityId());
    pr.label = propertyDocument.findLabel("en");

    // Find best URL pattern:
    StatementGroup urlPatterns = propertyDocument.findStatementGroup("P1630");
    if (urlPatterns != null) {
      for (Statement s : urlPatterns) {
        Value v = s.getValue();
        if (v == null) {
          continue;
        }
        String urlPattern = ((StringValue) v).getString();
        boolean foundGacUrl = false;
        if (pr.urlPattern == null) {
          pr.urlPattern = urlPattern;
        } else if (!foundGacUrl && s.getRank() == StatementRank.PREFERRED) {
          pr.urlPattern = urlPattern;
        } else if (!foundGacUrl) {
          Iterator<Snak> snaks = s.getAllQualifiers();
          while (snaks.hasNext()) {
            Snak snak = snaks.next();
            if (snak instanceof ValueSnak && "P1535".equals(snak.getPropertyId().getId())
                && ItemGadgetAuthorityControl.equals(((ValueSnak) snak).getValue())) {
              pr.urlPattern = urlPattern;
              foundGacUrl = true;
              break;
            }
          }
        }
      }
    }

    // Collect classes that this property is in:
    Optional<StatementGroup> instanceClasses = Optional.ofNullable(propertyDocument.findStatementGroup("P31"));
    instanceClasses.ifPresent(ics -> ics.forEach(statement -> {
      Optional<Value> value = Optional.ofNullable(statement.getValue());
      value.ifPresent(v -> pr.classes.add(Integer.parseInt(((ItemIdValue) v).getId().substring(1))));
    }));

    countTerms(propertyDocument, propertyStatistics);
    processStatementDocument(propertyDocument, propertyStatistics);
  }

  private void processStatementDocument(StatementDocument statementDocument, EntityStatistics entityStatistics) {
    this.countEntities++;
    entityStatistics.count++;

    if (statementDocument.getStatementGroups().size() > 0) {
      this.countPropertyEntities++;
    }

    Set<Integer> superClasses = new HashSet<>();
    StatementGroup instanceOfStatements = statementDocument.findStatementGroup("P31");
    if (instanceOfStatements != null) {
      // Compute all superclasses and count direct instances:
      for (Statement s : instanceOfStatements) {
        Value v = s.getValue();
        if (v instanceof ItemIdValue) {
          Integer vId = getNumId(((ItemIdValue) v).getId(), false);
          superClasses.add(vId);
          ClassRecord classRecord = getClassRecord(vId);
          classRecord.itemCount++;
          superClasses.addAll(classRecord.superClasses);
        }
      }

      // Count item in all superclasses and count cooccuring properties
      // for all superclasses:
      for (Integer classId : superClasses) {
        ClassRecord classRecord = getClassRecord(classId);
        classRecord.allInstanceCount++;
        countCooccurringProperties(statementDocument, classRecord, null);
      }
    }

    // Count statements:
    for (StatementGroup sg : statementDocument.getStatementGroups()) {
      entityStatistics.countStatements += sg.size();
      PropertyRecord propertyRecord = getPropertyRecord(sg.getProperty());
      propertyRecord.itemCount++;
      countCooccurringProperties(statementDocument, propertyRecord, sg.getProperty());

      for (Statement s : sg) {
        for (SnakGroup snakGroup : s.getQualifiers()) {
          Integer qualifierId = getNumId(snakGroup.getProperty().getId(), false);
          if (propertyRecord.qualifiers.containsKey(qualifierId)) {
            propertyRecord.qualifiers.put(qualifierId, propertyRecord.qualifiers.get(qualifierId) + 1);
          } else {
            propertyRecord.qualifiers.put(qualifierId, 1);
          }
        }
      }
    }

    // print a report once in a while:
    if (this.countEntities % 100000 == 0) {
      printReport();
      // writeFinalReports(); // DEBUG
    }
  }

  /**
   * Count the terms (labels, descriptions, aliases) of an item or property
   * document.
   *
   * @param termedDocument   document to count the terms of
   * @param entityStatistics record where statistics are counted
   */
  protected void countTerms(TermedDocument termedDocument, EntityStatistics entityStatistics) {
    entityStatistics.countLabels += termedDocument.getLabels().size();
    entityStatistics.countDescriptions += termedDocument.getDescriptions().size();

    for (String languageKey : termedDocument.getAliases().keySet()) {
      int count = termedDocument.getAliases().get(languageKey).size();
      entityStatistics.countAliases += count;
    }
  }

  /**
   * Fetches all subclass relationships (P279) using the SPARQL endpoint, and uses
   * them to compute direct and indirect superclasses of each class.
   *
   * @throws IOException
   */
  private void fetchSubclassHierarchy() throws IOException {
    InjectableValues.Std iv = new InjectableValues.Std();
    iv.addValue(DumpProcessingAction.class, this);
    mapper.setInjectableValues(iv);

    try (InputStream stream = openResultFileInputStream(resultDirectory, "classes.json")) {
      Map<Integer, ClassRecord> classRecords = mapper.readValue(stream, new TypeReference<Map<Integer, ClassRecord>>() {
      });
      this.classRecords = new HashMap<>(classRecords);
    } catch (IOException e) {
      e.printStackTrace();
    }

    System.out
        .println("Found " + this.classRecords.size() + " class items.");

    System.out.println("Computing indirect subclass relationships ...");
    for (ClassRecord classRecord : this.classRecords.values()) {
      for (Integer superClass : classRecord.directSuperClasses) {
        addSuperClasses(superClass, classRecord);
      }
    }

    System.out.println("Computing total subclass counts ...");
    for (ClassRecord classRecord : this.classRecords.values()) {
      for (Integer superClass : classRecord.superClasses) {
        ClassRecord record = this.classRecords.get(superClass);

        if (record != null) {
          ++classRecord.allSubclassCount;
        }
      }
    }

    System.out.println("Preprocessing of class hierarchy complete.");
  }

  /**
   * Recursively add indirect subclasses to a class record.
   *
   * @param directSuperClass the superclass to add (together with its own
   *                         superclasses)
   * @param subClassRecord   the subclass to add to
   */
  private void addSuperClasses(Integer directSuperClass, ClassRecord subClassRecord) {
    if (subClassRecord.superClasses.contains(directSuperClass)) {
      return;
    }

    subClassRecord.superClasses.add(directSuperClass);
    ClassRecord superClassRecord = this.classRecords.get(directSuperClass);

    if (superClassRecord == null) {
      return;
    }

    for (Integer superClass : superClassRecord.directSuperClasses) {
      addSuperClasses(superClass, subClassRecord);
    }
  }

  /**
   * Counts each property for which there is a statement in the given item
   * document, ignoring the property thisPropertyIdValue to avoid properties
   * counting themselves.
   *
   * @param statementDocument
   * @param usageRecord
   * @param thisPropertyIdValue
   */
  private void countCooccurringProperties(StatementDocument statementDocument, UsageRecord usageRecord,
      PropertyIdValue thisPropertyIdValue) {

    statementDocument.getStatementGroups().forEach(sg -> {
      if (sg.getProperty().equals(thisPropertyIdValue)) {
        return;
      }

      Integer propertyId = getNumId(sg.getProperty().getId(), false);
      usageRecord.propertyCoCounts.compute(propertyId, (k, v) -> (v == null) ? 1 : v + 1);
    });
  }

  /**
   * Executes a given SPARQL query and returns a stream with the result in JSON
   * format.
   *
   * @param query
   * @return
   * @throws IOException
   */
  private InputStream runSparqlQuery(String query) throws IOException {
    try {
      final String banner = "#TOOL:SQID-helper, https:/tools.wmflabs.org/sqid/\n";
      String queryString = "query=" + URLEncoder.encode(banner + query, "UTF-8");
      URL url = new URL("https://query.wikidata.org/sparql?" + queryString);
      System.out.println("Running SPARQL query: `" + url + "'.");
      HttpURLConnection connection = (HttpURLConnection) url.openConnection();
      connection.setRequestMethod("GET");
      connection.addRequestProperty("Accept", "text/csv"); // JSON leads to timeouts
      connection.setRequestProperty("User-Agent", Client.getUserAgent());

      return connection.getInputStream();
    } catch (UnsupportedEncodingException | MalformedURLException e) {
      throw new RuntimeException(e.getMessage(), e);
    }
  }

  /**
   * Creates the final file output of the analysis.
   */
  private void writeFinalReports() {
    System.out.println("Printing data to output files ...");
    writePropertyData();
    writeClassData();
    System.out.println("Finished printing data.");
  }

  /**
   * Writes all data that was collected about properties to a json file.
   */
  private void writePropertyData() {
    try (PrintStream out = new PrintStream(openResultFileOutputStream(resultDirectory, "properties.json"))) {
      out.println("{");

      int count = 0;
      for (Entry<Integer, PropertyRecord> propertyEntry : this.propertyRecords.entrySet()) {
        if (count > 0) {
          out.println(",");
        }
        out.print("\"" + propertyEntry.getKey() + "\":");
        mapper.writeValue(out, propertyEntry.getValue());
        count++;
      }
      out.println("\n}");

      System.out.println(" Serialized information for " + count + " properties.");
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  public void writeStatisticsData(PrintStream out) throws JsonGenerationException, JsonMappingException, IOException {
    out.println(" \"entityCount\": \"" + this.countEntities + "\",");
    out.println(" \"siteLinkCount\": \"" + this.countSiteLinks + "\",");

    out.print(" \"propertyStatistics\": ");
    mapper.writeValue(out, this.propertyStatistics);
    out.println(",");
    out.print(" \"itemStatistics\": ");
    mapper.writeValue(out, this.itemStatistics);
    out.println(",");

    out.print(" \"sites\": ");
    mapper.writeValue(out, this.siteRecords);
    out.println(",");

  }

  /**
   * Writes all data that was collected about classes to a json file.
   */
  private void writeClassData() {
    try (PrintStream out = new PrintStream(openResultFileOutputStream(resultDirectory, "classes.json"))) {
      out.println("{");

      // Add direct subclass information:
      for (Entry<Integer, ClassRecord> classEntry : this.classRecords.entrySet()) {
        if (classEntry.getValue().subclassCount == 0 && classEntry.getValue().itemCount == 0) {
          continue;
        }
        for (Integer superClass : classEntry.getValue().directSuperClasses) {
          this.classRecords.get(superClass).nonemptyDirectSubclasses.add(classEntry.getKey().toString());
        }
      }

      int count = 0;
      int countNoLabel = 0;
      for (Entry<Integer, ClassRecord> classEntry : this.classRecords.entrySet()) {
        if (classEntry.getValue().subclassCount == 0 && classEntry.getValue().itemCount == 0) {
          continue;
        }

        if (classEntry.getValue().label == null) {
          countNoLabel++;
        }

        if (count > 0) {
          out.println(",");
        }
        out.print("\"" + classEntry.getKey() + "\":");
        mapper.writeValue(out, classEntry.getValue());
        count++;
      }
      out.println("\n}");

      System.out.println(" Serialized information for " + count + " class items.");
      System.out.println(" -- class items with missing label: " + countNoLabel);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  /**
   * Prints a report about the statistics gathered so far.
   */
  private void printReport() {
    System.out.println(getReport());
  }

  @Override
  public String getReport() {
    return "Processed " + this.countEntities + " entities:\n" + " * Property documents: " + this.propertyRecords.size()
        + "\n" + " * Class documents: " + this.classRecords.size();
  }

  @Override
  public void open() {
    super.open();
    try {
      fetchSubclassHierarchy();
    } catch (IOException e) {
      throw new RuntimeException(e.toString(), e);
    }
  }

  @Override
  public void close() {
    writeFinalReports();
    try (PrintStream out = new PrintStream(openResultFileOutputStream(resultDirectory, "statistics.json"))) {
      out.println("{ ");
      writeStatisticsData(out);
      out.println(" \"dumpDate\": \"" + dateStamp + "\"");
      out.println("}");
    } catch (IOException e) {
      throw new RuntimeException(e.toString(), e);
    }
  }

  @Override
  public String getDefaultActionName() {
    return "SchemaAnalyzerAction";
  }
}
