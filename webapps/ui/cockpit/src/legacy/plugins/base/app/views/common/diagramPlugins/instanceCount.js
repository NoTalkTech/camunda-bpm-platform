/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership. Camunda licenses this file to you under the Apache License,
 * Version 2.0; you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var angular = require("angular");

var template = require("./instanceCount.html.js");

module.exports = function(
  $scope,
  control,
  processData,
  processDiagram,
  Loaders,
  $rootScope,
  callbacks
) {
  // the getViewer() method only exists in the instance context, but not in the definition context.
  var viewer = control.getViewer ? control.getViewer() : control;
  var overlays = viewer.get("overlays");
  var elementRegistry = viewer.get("elementRegistry");
  var stopLoading = Loaders.startLoading();
  var overlaysNodes = {};

  callbacks.observe(function(sources) {
    stopLoading();

    elementRegistry.forEach(function(shape) {
      var element = processDiagram.bpmnElements[shape.businessObject.id];
      var data = callbacks.getData.apply(null, [element].concat(sources));
      var nodes;

      if (callbacks.isActive(data)) {
        if (!overlaysNodes[element.id]) {
          nodes = getOverlayNodes(element, data);

          overlays.add(element.id, {
            position: {
              bottom: 0,
              left: 0
            },
            show: {
              minZoom: -Infinity,
              maxZoom: +Infinity
            },
            html: nodes.html
          });

          overlaysNodes[element.id] = nodes;
        }

        element.isSelectable = true;
      }

      if (overlaysNodes[element.id]) {
        callbacks.updateOverlayNodes(overlaysNodes[element.id], data);
      }
    });
    callbacks.toggleIsLoading && callbacks.toggleIsLoading();
    $rootScope.$broadcast(
      "cockpit.plugin.base.views:diagram-plugins:instance-plugin-loaded"
    );
  });

  function getOverlayNodes(element, data) {
    var html = angular.element(template);
    var clickListener = selectRunningInstances.bind(null, element, data);
    var nodes = {
      html: html,
      instancesNode: html.find(".instance-count"),
      incidentsNode: html.find(".instance-incidents")
    };

    html.on("click", clickListener);

    $scope.$on("$destroy", function() {
      html.off("click", clickListener);
    });

    return nodes;
  }

  var currentFilter = processData.observe("filter", function(filter) {
    currentFilter = filter;
  });

  function selectRunningInstances(element, data, event) {
    var newFilter = angular.copy(currentFilter);
    var ctrl = event.ctrlKey;
    var activityId = element.id;
    var activityIds = angular.copy(newFilter.activityIds) || [];
    var idx = activityIds.indexOf(activityId);
    var selected = idx !== -1;
    var multiInstance = data.multiInstance;

    if (!activityId) {
      activityIds = null;
    } else {
      if (ctrl) {
        if (selected) {
          activityIds.splice(idx, 1);
          if (multiInstance) {
            activityIds.splice(
              activityIds.indexOf(activityId + "#multiInstanceBody"),
              1
            );
          }
        } else {
          activityIds.push(activityId);
          if (multiInstance) {
            activityIds.push(activityId + "#multiInstanceBody");
          }
        }
      } else {
        activityIds = [activityId];
        if (multiInstance) {
          activityIds.push(activityId + "#multiInstanceBody");
        }
      }
    }

    newFilter.activityIds = activityIds;

    $scope.$apply(function() {
      processData.set("filter", newFilter);
    });
  }
};