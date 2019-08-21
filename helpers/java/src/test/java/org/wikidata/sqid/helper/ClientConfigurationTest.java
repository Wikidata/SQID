package org.wikidata.sqid.helper;

/*
 * #%L
 * SQID statistics generation helper
 * %%
 * Copyright (C) 2014 Wikidata Toolkit Developers
 * Copyright (C) 2019 SQID Developers
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.wikidata.wdtk.datamodel.helpers.Datamodel;
import org.wikidata.wdtk.datamodel.interfaces.PropertyIdValue;

public class ClientConfigurationTest {

  @Test
  public void testDefaultArguments() {
    String[] args = new String[] {};
    ClientConfiguration config = new ClientConfiguration(args);
    assertFalse(config.getOfflineMode());
    assertEquals(null, config.getDumpDirectoryLocation());
    assertEquals(null, config.getFilterLanguages());
    assertEquals(null, config.getFilterSiteKeys());
    assertEquals(null, config.getFilterProperties());
    assertEquals(null, config.getReportFileName());
    assertEquals(null, config.getInputDumpLocation());
    assertEquals(null, config.getLocalDumpFile());
    assertFalse(config.isQuiet());
  }

  @Test
  public void testUnknownAction() {
    String[] args = new String[] { "-a", "notImplemented" };
    ClientConfiguration config = new ClientConfiguration(args);
    assertEquals(0, config.getActions().size());
  }

  @Test
  public void testUnknownArguments() {
    String[] args = new String[] { "--unknown", "-foo" };
    ClientConfiguration config = new ClientConfiguration(args);
    assertFalse(config.getOfflineMode());
    assertEquals(null, config.getDumpDirectoryLocation());
    assertFalse(config.isQuiet());
  }

  @Test
  public void testDumpLocationArgumentsShort() {
    String[] args = new String[] { "-d", "dumps/wikidata/" };
    ClientConfiguration config = new ClientConfiguration(args);
    assertEquals("dumps/wikidata/", config.getDumpDirectoryLocation());
  }

  @Test
  public void testDumpLocationArgumentsLong() {
    String[] args = new String[] { "--dumps", "dumps/wikidata/" };
    ClientConfiguration config = new ClientConfiguration(args);
    assertEquals("dumps/wikidata/", config.getDumpDirectoryLocation());
  }

  @Test
  public void testOfflineModeArgumentsShort() {
    String[] args = new String[] { "-n" };
    ClientConfiguration config = new ClientConfiguration(args);
    assertTrue(config.getOfflineMode());
  }

  @Test
  public void testOfflineModeArgumentsLong() {
    String[] args = new String[] { "--offline" };
    ClientConfiguration config = new ClientConfiguration(args);
    assertTrue(config.getOfflineMode());
  }

  @Test
  public void testQuietArgumentsShort() {
    String[] args = new String[] { "-q" };
    ClientConfiguration config = new ClientConfiguration(args);
    assertTrue(config.isQuiet());
  }

  @Test
  public void testQuietArgumentsLong() {
    String[] args = new String[] { "--quiet" };
    ClientConfiguration config = new ClientConfiguration(args);
    assertTrue(config.isQuiet());
  }

  @Test
  public void testReportArgumentsShort() {
    String[] args = new String[] { "-r", "output/report.txt" };
    ClientConfiguration config = new ClientConfiguration(args);
    assertEquals("output/report.txt", config.getReportFileName());
  }

  @Test
  public void testReportArgumentsLong() {
    String[] args = new String[] { "--report", "output/report.txt" };
    ClientConfiguration config = new ClientConfiguration(args);
    assertEquals("output/report.txt", config.getReportFileName());
  }

  @Test
  public void testLanguageFilterArguments() {
    String[] args = new String[] { "--fLang", "en,de" };
    ClientConfiguration config = new ClientConfiguration(args);

    Set<String> langFilters = new HashSet<>();
    langFilters.add("en");
    langFilters.add("de");

    assertEquals(langFilters, config.getFilterLanguages());
  }

  @Test
  public void testLanguageFilterArgumentsEmpty() {
    String[] args = new String[] { "--fLang", "-" };
    ClientConfiguration config = new ClientConfiguration(args);

    Set<String> langFilters = new HashSet<>();

    assertEquals(langFilters, config.getFilterLanguages());
  }

  @Test
  public void testSiteLinkFilterArguments() {
    String[] args = new String[] { "--fSite", "fawiki,dewiki" };
    ClientConfiguration config = new ClientConfiguration(args);

    Set<String> siteFilters = new HashSet<>();
    siteFilters.add("fawiki");
    siteFilters.add("dewiki");

    assertEquals(siteFilters, config.getFilterSiteKeys());
  }

  @Test
  public void testSiteLinkFilterArgumentsEmpty() {
    String[] args = new String[] { "--fSite", "-" };
    ClientConfiguration config = new ClientConfiguration(args);

    Set<String> siteFilters = new HashSet<>();

    assertEquals(siteFilters, config.getFilterSiteKeys());
  }

  @Test
  public void testPropertyFilterArguments() {
    String[] args = new String[] { "--fProp", "P100,P31" };
    ClientConfiguration config = new ClientConfiguration(args);

    Set<PropertyIdValue> propFilters = new HashSet<>();
    propFilters.add(Datamodel.makeWikidataPropertyIdValue("P31"));
    propFilters.add(Datamodel.makeWikidataPropertyIdValue("P100"));

    assertEquals(propFilters, config.getFilterProperties());
  }

  @Test
  public void testPropertyFilterArgumentsEmpty() {
    String[] args = new String[] { "--fProp", "-" };
    ClientConfiguration config = new ClientConfiguration(args);

    Set<PropertyIdValue> propFilters = new HashSet<>();

    assertEquals(propFilters, config.getFilterProperties());
  }

}
