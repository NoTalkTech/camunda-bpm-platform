/* Licensed under the Apache License, Version 2.0 (the "License");
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
 */

package org.camunda.bpm.engine.impl;

import org.camunda.bpm.engine.query.QueryProperty;
import org.camunda.bpm.engine.runtime.ExecutionQuery;

/**
 * Contains the possible properties that can be used in a {@link ExecutionQuery}.
 *
 * @author Joram Barrez
 */
public interface ExecutionQueryProperty {

  public static final QueryProperty PROCESS_INSTANCE_ID = new QueryPropertyImpl("ID_");
  public static final QueryProperty PROCESS_DEFINITION_KEY = new QueryPropertyImpl("KEY_");
  public static final QueryProperty PROCESS_DEFINITION_ID = new QueryPropertyImpl("ID_");
}
