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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Class to record the usage of a class item in the data.
 *
 * @author Markus Kroetzsch
 */
class ClassRecord extends UsageRecord {
  ClassRecord(DumpProcessingAction action) {
    super(action);
  }

  ClassRecord() {
    super(null);
  }

  /**
   * Number of direct subclasses of this class item.
   */
  @JsonProperty("s")
  @JsonInclude(Include.NON_EMPTY)
  public int subclassCount = 0;
  /**
   * Number of all (direct and indirect) instances of this class item.
   */
  @JsonProperty("ai")
  @JsonInclude(Include.NON_EMPTY)
  public int allInstanceCount = 0;
  /**
   * Number of all (direct and indirect) subclasses of this class item.
   */
  @JsonProperty("as")
  @JsonInclude(Include.NON_EMPTY)
  public int allSubclassCount = 0;
  /**
   * List of direct super classes of this class.
   */
  @JsonIgnore
  public ArrayList<Integer> directSuperClasses = new ArrayList<>();
  /**
   * Set of all super classes of this class.
   */
  @JsonIgnore
  public Set<Integer> superClasses = new HashSet<>();

  @JsonProperty("sc")
  @JsonInclude(Include.NON_EMPTY)
  public String[] getSuperClasses() {
    return superClasses.stream().map(Object::toString).toArray(String[]::new);
  }

  @JsonProperty("sc")
  public void setSuperClasses(String[] superClasses) {
    Arrays.stream(superClasses).map(Integer::parseInt)
        .forEachOrdered(this.directSuperClasses::add);
  }

  /**
   * List of direct subclasses of this class that are included in the export. This
   * is only filled at the end of the processing.
   */
  @JsonProperty("sb")
  @JsonInclude(Include.NON_EMPTY)
  public ArrayList<String> nonemptyDirectSubclasses = new ArrayList<>();
}
