(function() {
  'use strict';
  angular
    .module('NarrowItDownApp', [])
    .controller('NarrowItDownController', NarrowItDownController)
    .service('MenuSearchService', MenuSearchService)
    .directive('foundItems', FoundItemsDirective);

  function FoundItemsDirective() {
    var ddo = {
        template: "<h1>Result</h1>"
            + "<div ng-if='list.isEmpty()'>Nothing found</div>"
            + "<ul><li ng-repeat='item in list.found'>"
            + "<b>{{item.name}}, {{item.short_name}}, {{item.description}}</b><br />"
            + " <button ng-click='list.onRemove({ index: $index });'>Don't want this one!</button></li></ul>",
      scope: {
        found: '<',
        onRemove: '&'
      },
      controller: FoundItemsDirectiveController,
      controllerAs: 'list',
      bindToController: true
    };
    return ddo;
  }

  function FoundItemsDirectiveController() {
    var list = this;

    list.isEmpty = function() {
      return list.found != undefined && list.found.length === 0;
    }
  }

  NarrowItDownController.$inject = ['MenuSearchService'];
  function NarrowItDownController(MenuSearchService) {
    var controller = this;

    controller.searchTerm = "";

    controller.narrowIt = function() {
      if (controller.searchTerm === "") {
        controller.items = [];
        return;
      }
      var promise = MenuSearchService.getMatchedMenuItems(controller.searchTerm);
      promise.then(function(response) {
        controller.items = response;
      })
      .catch(function(error) {
        console.log("Something went wrong", error);
      });
    };

    controller.removeItem = function(index) {
      controller.items.splice(index, 1);
    };
  }

  MenuSearchService.$inject = ['$http'];
  function MenuSearchService($http) {
    var service = this;

    service.getMatchedMenuItems = function(searchTerm) {
        return $http({
          method: 'GET',
          url: 'https://davids-restaurant.herokuapp.com/menu_items.json'
        }).then(function (result) {
        // process result and only keep items that match
        var items = result.data.menu_items;

        var foundItems = [];

        for (var i = 0; i < items.length; i++) {
          if (items[i].description.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
            foundItems.push(items[i]);
          }
        }

        // return processed items
        return foundItems;
      });
    };
  }

}
)();
