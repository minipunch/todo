var scotchTodo = angular.module('scotchTodo', []);

scotchTodo.controller('mainController', function($scope,$rootScope,$http) {
  $scope.formData = {};
  $scope.todos = [];
  $rootScope.item = {};
  $scope.oldText = "";
  $scope.isLoggedIn = false;

  $http.get('/api/todos').success(function(data) {
    $scope.todos = data;
    console.log(data);
  }).error(function(data) {
    console.log('Error: ' + data);
  });

  $scope.createTodo = function() {
    if($scope.formData.text) {
      $http.post('api/todos',$scope.formData).success(function(data) {
        $scope.formData = {}; // clear form
        $scope.todos = data;
        console.log(data);
      }).error(function(data) {
        console.log("error: " + data);
      });
    } else {
      alert("Cannot add an empty task!");
    }
  }

  $scope.deleteTodo = function(id) {
    var temp = confirm("Are you sure you want to delete this item?");

    if(temp === true) {
      $http.delete('/api/todos/' + id).success(function(data) {
        $scope.todos = data;
        console.log(data);
      }).error(function(data) {
        console.log("Error: " + data);
      });
    }
    else {
    }
  };

$scope.enableEdit = function(todoItem) {
  $scope.oldText = todoItem.text;
  todoItem.isBeingEdited = !todoItem.isBeingEdited;
  todoItem.needConfirmation = true;
  $rootScope.item = todoItem;
};

$scope.saveChanges = function(todoItem) {
  $http.put('api/todos/edit', todoItem)
   .then(
       function(response){
         // success callback
         todoItem.isBeingEdited = false;
         todoItem.needConfirmation = false;
         $rootScope.item = todoItem;
       },
       function(response){
         // failure callback
       }
    );
};

$scope.cancelChanges = function(todoItem) {
  todoItem.isBeingEdited = false;
  todoItem.needConfirmation = false;
  todoItem.text = $scope.oldText;
};

$scope.logout = function() {
  $http.post('logout').success(function(data) {
    $scope.isLoggedIn = false;
    console.log("logged out");
  }).error(function(data) {
    console.log("error when logging out: " + data);
  });
};

});
