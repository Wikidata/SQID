package org.wikidata.sqid.helper;

import java.io.FileInputStream;

/*
 * #%L
 * SQID statistics generation helper
 * %%
 * Copyright (C) 2014 - 2015 Wikidata Toolkit Developers
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

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.wikidata.wdtk.datamodel.interfaces.EntityDocumentDumpProcessor;
import org.wikidata.wdtk.datamodel.interfaces.PropertyIdValue;
import org.wikidata.wdtk.datamodel.interfaces.Sites;

/**
 * This interface represents an action that may be performed with Wikibase
 * dumps. The processing as such is achieved by implementing
 * {@link EntityDocumentDumpProcessor}. Additional methods provide a generic
 * interface for setting options and other auxiliary information that the action
 * might require.
 *
 * @author Markus Kroetzsch
 *
 */
abstract class DumpProcessingAction implements EntityDocumentDumpProcessor {
  /**
   * Collection of all property records.
   */
  final HashMap<Integer, PropertyRecord> propertyRecords = new HashMap<>();

  /**
   * Collection of all item records of items used as classes.
   */
  HashMap<Integer, ClassRecord> classRecords = new HashMap<>();

  /**
   * Total number of items that have some statement.
   */
  long countPropertyEntities = 0;

  /**
   * Sites information used to extract site data.
   */
  protected Sites sites;

  /**
   * Name as an action, if any
   */
  protected String name = null;

  protected String dateStamp;
  protected String project;

  /**
   * The place where result files will be stored.
   */
  protected Path resultDirectory;

  /**
   * Object mapper that is used to serialize JSON.
   */
  protected static final ObjectMapper mapper = new ObjectMapper();
  static {
    mapper.configure(JsonGenerator.Feature.AUTO_CLOSE_TARGET, false);
  }

  /**
   * Returns true if processing requires a {@link Sites} object to be set.
   * This is the case for some operations that process site links.
   *
   * @return true if sites information is needed.
   */
  public boolean needsSites() {
    return true;
  }

  /**
   * Returns true if the action is ready to process a dump. An action that is
   * insufficiently or wrongly configured can return false here to avoid being
   * run.
   * <p>
   * If this method is called on an action that is not ready, the action
   * should print helpful information on the missing configuration to stdout
   * as a side effect.
   *
   * @return true if ready to run
   */
  public boolean isReady() {
    return true;
  }

  /**
   * Sets the sites information to the given value. The method
   * {@link #needsSites()} is used to find out if this is actually needed.
   *
   * @param sites
   *            the sites information for the data that will be processed
   */
  public void setSites(Sites sites) {
    this.sites = sites;
  }

  /**
   * Sets the options of the specified name to the given value. Returns true
   * if the option was known, and false otherwise. Implementation should
   * overwrite this function to support additional options.
   *
   * @param option
   *            name of the option to be set
   * @param value
   *            the new value of the option
   * @return true if the option was known (no matter if the given value could
   *         actually be used or not)
   */
  public boolean setOption(String option, String value) {
    // no options
    return false;
  }

  /**
   * Returns true if this action will write results (not log messages) to
   * stdout. The default implementation returns true if no other output
   * destination has been specified. Subclasses that do not write results to
   * stdout in this case should overwrite this method.
   *
   * @return true if the action is configured to write results to stdout
   */
  public boolean useStdOut() {
    return true;
  }

  /**
   * Provides the action with general information about the dump that is to be
   * processed. This may be used, e.g., to define file names to use for the
   * output.
   *
   * @param project
   *            the name of the project that the dump is from
   * @param dateStamp
   *            the datestamp (YYYYMMDD) for the dump
   */
  public void setDumpInformation(String project, String dateStamp) {
    this.project = project;
    this.dateStamp = dateStamp;
  }


  /**
   * Returns a report message containing information about the files which
   * were generated.
   *
   * @return report message
   */
  public abstract String getReport();

  /**
   * Sets the name of the action. If this is not set, a default name will be
   * used.
   *
   * @param name
   */
  public void setActionName(String name) {
    this.name = name;
  }

  /**
   * Returns the name of the action.
   *
   * @return name
   */
  public String getActionName() {
    if (this.name != null) {
      return this.name;
    } else {
      return getDefaultActionName();
    }
  }

  /**
   * Returns the default name for an action.
   *
   * @return default name
   */
  public abstract String getDefaultActionName();

  /**
   * Extracts a numeric id from a string, which can be either a Wikidata entity
   * URI or a short entity or property id.
   *
   * @param idString
   * @param isUri
   * @return numeric id, or 0 if there was an error
   */
  protected Integer getNumId(String idString, boolean isUri) {
    String numString;
    if (isUri) {
      if (!idString.startsWith("http://www.wikidata.org/entity/")) {
        return 0;
      }
      numString = idString.substring("http://www.wikidata.org/entity/Q".length());
    } else {
      numString = idString.substring(1);
    }
    return Integer.parseInt(numString);
  }

  /**
   * Returns record where statistics about a class should be stored.
   *
   * @param classId the numeric id of the class to initialize
   * @return the class record
   */
  protected ClassRecord getClassRecord(Integer classId) {
    ClassRecord record = this.classRecords.get(classId);

    if (record == null) {
      record = new ClassRecord(this);
      this.classRecords.put(classId, record);
    }

    return record;
  }

  /**
   * Returns record where statistics about a property should be stored.
   *
   * @param property the property to initialize
   * @return the property record
   */
  protected PropertyRecord getPropertyRecord(PropertyIdValue property) {
    Integer propertyId = getNumId(property.getId(), false);
    PropertyRecord record = this.propertyRecords.get(propertyId);

    if (record == null) {
      record = new PropertyRecord(this);
      this.propertyRecords.put(propertyId, record);
    }

    return record;
  }

  /**
   * Create a directory at the given path if it does not exist yet.
   *
   * @param path the path to the directory
   * @throws IOException if it was not possible to create a directory at the given
   *                     path
   */
  protected static void createDirectory(Path path) throws IOException {
    try {
      Files.createDirectory(path);
    } catch (FileAlreadyExistsException e) {
      if (!Files.isDirectory(path)) {
        throw e;
      }
    }
  }

  /**
   * Opens a new FileOutputStream for a file of the given name in the given result
   * directory. Any file of this name that exists already will be replaced. The
   * caller is responsible for eventually closing the stream.
   *
   * @param resultDirectory the path to the result directory
   * @param filename        the name of the file to write to
   * @return FileOutputStream for the file
   * @throws IOException if the file or example output directory could not be
   *                     created
   */
  protected static FileOutputStream openResultFileOutputStream(Path resultDirectory, String filename) throws IOException {
    Path filePath = resultDirectory.resolve(filename);
    return new FileOutputStream(filePath.toFile());
  }

  /**
   * Opens a new FileInputStream for a file of the given name in the given result
   * directory. The
   * caller is responsible for eventually closing the stream.
   *
   * @param resultDirectory the path to the result directory
   * @param filename        the name of the file to write to
   * @return FileOutputStream for the file
   * @throws IOException if the file or example output directory could not be
   *                     created
   */
  protected static FileInputStream openResultFileInputStream(Path resultDirectory, String filename) throws IOException {
    Path filePath = resultDirectory.resolve(filename);
    return new FileInputStream(filePath.toFile());
  }

  @Override
  public void open() {
    this.resultDirectory = Paths.get("results");
    try {
      // Make output directories for results
      createDirectory(resultDirectory);
      this.resultDirectory = resultDirectory.resolve("wikidatawiki-" + dateStamp);
      createDirectory(resultDirectory);
    } catch (IOException e) {
      throw new RuntimeException(e.toString(), e);
    }
  }
}
