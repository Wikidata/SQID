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
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
   * Class to record the usage of a property in the data.
   *
   * @author Markus Kroetzsch
   */
  class PropertyRecord extends UsageRecord {

    PropertyRecord(DumpProcessingAction action) {
		super(action);
	}

	/**
     * Set of all qualifiers used with this property.
     */
    @JsonIgnore
    public Map<Integer, Integer> qualifiers = new HashMap<>();

    /**
     * Main URL pattern to be used in links, if any.
     *
     * @return
     */
    @JsonProperty("u")
    @JsonInclude(Include.NON_EMPTY)
    public String urlPattern = null;

    /**
     * Classes that this property is a direct instance of.
     */
    @JsonIgnore
    public List<Integer> classes = new ArrayList<>();

    @JsonProperty("pc")
    @JsonInclude(Include.NON_EMPTY)
    public List<String> getClasses() {
      return classes.stream().map(Object::toString).collect(Collectors.toList());
    }

    @JsonProperty("qs")
    @JsonInclude(Include.NON_EMPTY)
    public Map<String, Integer> getQualifiers() {
      return qualifiers.entrySet().stream().sorted(Comparator.comparing(Entry<Integer, Integer>::getValue).reversed())
          .collect(Collectors.toMap(entry -> entry.getKey().toString(), entry -> entry.getValue()));
    }
  }
