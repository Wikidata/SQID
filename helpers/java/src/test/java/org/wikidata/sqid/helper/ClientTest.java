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

import java.io.IOException;

import org.apache.commons.cli.ParseException;
import org.apache.log4j.Level;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.wikidata.wdtk.datamodel.interfaces.Sites;
import org.wikidata.wdtk.dumpfiles.DumpContentType;
import org.wikidata.wdtk.dumpfiles.DumpProcessingController;
import org.wikidata.wdtk.dumpfiles.MwDumpFile;

public class ClientTest {
  DumpProcessingController mockDpc;
  @BeforeEach
  public void setup() throws IOException {
    mockDpc = Mockito.mock(DumpProcessingController.class);
    MwDumpFile mockDump = Mockito.mock(MwDumpFile.class);
    Mockito.when(mockDump.getProjectName()).thenReturn("wikidata");
    Mockito.when(mockDump.getDateStamp()).thenReturn("20150303");
    Mockito.when(mockDpc.getMostRecentDump(DumpContentType.JSON))
      .thenReturn(mockDump);
    Sites mockSites = Mockito.mock(Sites.class);
    Mockito.when(mockDpc.getSitesInformation()).thenReturn(mockSites);
  }
  @Test
  public void testDefaultLoggingConfig() throws ParseException, IOException {
    String[] args = new String[] {};
    Client client = new Client(mockDpc, args);
    client.performActions(); // print help
    assertEquals(Level.INFO, Client.consoleAppender.getThreshold());
    assertEquals(Level.WARN, Client.errorAppender.getThreshold());
  }
  @Test
  public void testQuietLoggingConfig() throws ParseException, IOException {
    String[] TEST_ARGS = new String[] { "-a", "sqid", "-q" };
    new Client(mockDpc, TEST_ARGS);
    assertEquals(Level.OFF, Client.consoleAppender.getThreshold());
    assertEquals(Level.WARN, Client.errorAppender.getThreshold());
  }
}
