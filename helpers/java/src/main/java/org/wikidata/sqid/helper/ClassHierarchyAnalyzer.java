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

import java.io.IOException;
import java.io.PrintStream;
import java.util.Optional;
import java.util.Map.Entry;

import org.wikidata.wdtk.datamodel.interfaces.ItemDocument;
import org.wikidata.wdtk.datamodel.interfaces.ItemIdValue;
import org.wikidata.wdtk.datamodel.interfaces.StatementGroup;
import org.wikidata.wdtk.datamodel.interfaces.Value;

/**
 * An action that extracts the full class hierarchy from a dump.
 *
 * @author Maximilan Marx
 */
public class ClassHierarchyAnalyzer extends DumpProcessingAction {
  private Integer numSubclassOfStatements = 0;

  @Override
  public void processItemDocument(ItemDocument itemDocument) {
    Optional<StatementGroup> subclassOfStatements = Optional.ofNullable(itemDocument.findStatementGroup("P279"));
    subclassOfStatements.ifPresent(statements -> {
        ClassRecord classRecord = getClassRecord(getNumId(itemDocument.getEntityId().getId(), false));
        statements.forEach(statement -> {
            Optional<Value> value = Optional.ofNullable(statement.getValue());
            value.ifPresent(v -> {
                Integer superClassId = Integer.parseInt(((ItemIdValue) v).getId().substring(1));
                classRecord.superClasses.add(superClassId);
                ++numSubclassOfStatements;
              });
          });
      });
  }

  @Override
  public void close() {
    System.out
        .println("Found " + this.numSubclassOfStatements + " subclass relationships among " + this.classRecords.size() + " Wikidata items.");

    try (PrintStream out = new PrintStream(openResultFileOutputStream(resultDirectory, "classes.json"))) {
      int count = 0;
      out.println("{");

      for (Entry<Integer, ClassRecord> classEntry : this.classRecords.entrySet()) {
        if (count > 0) {
          out.println(",");
        }

        out.print("\"" + classEntry.getKey() + "\":");
        mapper.writeValue(out, classEntry.getValue());
        ++count;
      }

      out.println("}");

      System.out.println(" Serialized information for " + count + " class items.");
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @Override
  public String getReport() {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getDefaultActionName() {
    return "ClassHierarchyAnalyzer";
  }
}
