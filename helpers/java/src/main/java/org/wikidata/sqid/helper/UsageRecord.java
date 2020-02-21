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

import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JacksonInject;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import org.apache.commons.lang3.tuple.ImmutablePair;

/**
 * Class to record the use of some class item or property.
 *
 * @author Markus Kroetzsch
 * @author Markus Damm
 *
 */
abstract class UsageRecord {
  /**
   *
   */
  @JacksonInject
  private final DumpProcessingAction action;

  /**
   * @param schemaUsageAnalyzer
   */
  UsageRecord(DumpProcessingAction action) {
    this.action = action;
  }

  /**
   * Number of items using this entity. For properties, this is the number of
   * items with such a property. For class items, this is the number of direct
   * instances of this class.
   */
  @JsonProperty("i")
  @JsonInclude(Include.NON_EMPTY)
  public int itemCount = 0;
  /**
   * Map that records how many times certain properties are used on items that use
   * this entity (where "use" has the meaning explained for
   * {@link UsageRecord#itemCount}).
   */
  @JsonIgnore
  public HashMap<Integer, Integer> propertyCoCounts = new HashMap<>();
  /**
   * The label of this item. If there isn't any English label available, the label
   * is set to null.
   */
  @JsonProperty("l")
  @JsonInclude(Include.NON_EMPTY)
  public String label;

  /**
   * Returns a list of related properties in a list ordered by a custom
   * relatedness measure.
   *
   * @return
   */
  @JsonProperty("r")
  @JsonInclude(Include.NON_EMPTY)
  public Map<String, Integer> getRelatedProperties() {
    return this.propertyCoCounts.entrySet().stream().map(coCountEntry -> {
      double otherThisItemRate = (double) coCountEntry.getValue() / this.itemCount;
      double otherGlobalItemRate = (double) this.action.propertyRecords.get(coCountEntry.getKey()).itemCount
          / this.action.countPropertyEntities;
      double otherThisItemRateStep = 1 / (1 + Math.exp(6 * (-2 * otherThisItemRate + 0.5)));
      double otherInvGlobalItemRateStep = 1 / (1 + Math.exp(6 * (-2 * (1 - otherGlobalItemRate) + 0.5)));

      return new ImmutablePair<Integer, Double>(coCountEntry.getKey(),
          otherThisItemRateStep * otherInvGlobalItemRateStep * otherThisItemRate / otherGlobalItemRate);

    }).sorted(Comparator.comparing(ImmutablePair<Integer, Double>::getValue).reversed())
        .collect(Collectors.toMap(entry -> entry.left.toString(), entry -> (int) (10 * entry.right)));
  }
}
