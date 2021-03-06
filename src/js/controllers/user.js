angular
.module('justo')
.controller('ProfileCtrl', ProfileCtrl)
.controller('ProfileEditCtrl', ProfileEditCtrl)
.controller('ProfileDeleteCtrl', ProfileDeleteCtrl)
.controller('ConversationCtrl', ConversationCtrl);

ProfileCtrl.$inject = ['$auth', 'User', '$state', 'Review', 'Project', 'Conversation'];
function ProfileCtrl($auth, User, $state, Review, Project, Conversation) {
  const vm = this;

  vm.reviews = Review.query();
  vm.user = User.get($state.params);
  vm.projects = Project.query();

  Project.query()
  .$promise
  .then((projects) =>{
    vm.projects = projects;
  });

  function contactCreator(sender_id, receiver_id) {
    Conversation
    .save({ sender_id, receiver_id })
    .$promise
    .then(() => {
      $state.go('conversations');
    });
  }

  vm.contactCreator = contactCreator;

  // Trying to prepend the url with http
  // function checkUrl(url) {
  //   if (!/^https?:\/\//i.test(url)) {
  //     url = 'http://' + url;
  //   }
  // }
  // vm.checkUrl = checkUrl;
  //
  // console.log(vm.checkUrl);

  function logout() {
    $auth.logout();
    $state.go('login');
  }
  vm.logout = logout;
  vm.newReview = {};

  function addReview() {
    vm.newReview.receiver_id = vm.user.id;

    Review
    .save(vm.newReview)
    .$promise
    .then((newReview) => {
      vm.user.reviews_received.push(newReview);
      vm.newReview = {};
    });
  }
  vm.addReview = addReview;


  function deleteReview(review) {
    Review
    .delete({ user_id: vm.user.id, id: review.id })
    .$promise
    .then((response) => {
      console.log(response);
      const index = vm.user.reviews_received.indexOf(response);
      vm.user.reviews_received.splice(index, 1);
    });
  }
  vm.deleteReview = deleteReview;
}

ProfileEditCtrl.$inject = ['$auth', 'User','$state', '$scope', '$rootScope', 'API_URL','$http', '$uibModal'];
function ProfileEditCtrl($auth, User, $state, $scope, $rootScope, API_URL, $http, $uibModal) {
  const vm = this;

  vm.user = User.get($state.params);
  vm.update = userUpdate;

  // $scope.$watch(vm.user.is_dev, () => {
  //   console.log('changed');
  //   // $rootScope.$broadcast('isDev', { isDev: vm.profile.is_dev });
  //   $scope.$emit('child', vm.user.is_dev);
  // });

  function userUpdate() {
    // if (vm.editprofileForm.$valid){
    User
    .update($state.params, vm.user)
    .$promise
    .then(() => {

      $http.get(`${API_URL}/refresh`)
      .then((response) => {
        // console.log(response);
        var refreshToken = response.data.token;
        $auth.setToken(refreshToken);
        $state.go('profile', $state.params);
      });
    });
    // }
  }

  // function deleteUser() {
  //   User
  //   .delete({ id: vm.user.id})
  //   .$promise
  //   .then(() =>
  //   $state.go('login'));
  // }
  //
  // vm.deleteUser = deleteUser;

  function openModal() {
    $uibModal.open({
      templateUrl: 'js/views/partials/userDeleteModal.html',
      controller: 'ProfileDeleteCtrl as profileDelete',
      resolve: {
        user: () => {
          return vm.user;
        }
      }
    });
  }
  vm.open = openModal;

}


ProfileDeleteCtrl.$inject = ['$auth', '$uibModalInstance', 'user', '$state'];
function ProfileDeleteCtrl($auth, $uibModalInstance, user, $state) {
  const vm = this;
  vm.user = user;

  function closeModal() {
    $uibModalInstance.close();
  }
  vm.close = closeModal;


  function deleteUser() {
    console.log(vm.user);
    vm.user
      .$remove()
      .then(() => {
        $auth.logout();
        $state.go('home');
        $uibModalInstance.close();
      });
  }
  vm.deleteUser = deleteUser;

}

ConversationCtrl.$inject = ['Conversation', 'Message', '$scope'];
function ConversationCtrl(Conversation, Message, $scope) {
  const vm = this;

  vm.conversations = Conversation.query();

  vm.message = {};
  vm.conversationId = null;
  vm.index = null;

  function addMessage() {
    vm.message.conversation_id = vm.conversationId;

    Message
    .save({ id: vm.conversationId }, vm.message)
    .$promise
    .then((response) => {

      // Find message within the returned conversation.messages array
      function findMessage(message) {
        return message.body === response.body;
      }

      // Update view with the newly created message
      const newMessage = response.conversation.messages.find(findMessage);
      vm.conversations[vm.index].messages.push(newMessage);

      // set newMessage to empty
      vm.message = {};
    });
  }

  function getUnread(currentUserId) {
    let count = 0;
    // loop through conversations
    vm.conversations.forEach((conversation) => {
      // loop through messages within the conversation
      conversation.messages.forEach((message) => {
        // count if message is not read and not sent from the current user
        if (message.user_id !== currentUserId && !message.read) {
          return count += 1;
        }
      });
      // Reset count to 0 ready for next conversation iteration
      count = 0;
    });
  }

  vm.getUnread = getUnread;

  function selectConversation(conversation, index, currentUserId) {
    // get the conversation thread from the clicked on conversation
    Conversation
    .get({ id: conversation.id })
    .$promise
    .then((conversation) => {
      // console.log('Backend', conversation);
      $scope.conversations.getUnread(currentUserId);
      vm.conversationId = conversation.id;
      vm.index = index;
      // Message
      // .get({ id: vm.conversationId })
      // .$promise
      // .then((response) => {
      //   // console.log('From index messages', response);
      //   // .. update Angular
      // });

    });
  }

  vm.addMessage = addMessage;
  vm.selectConversation = selectConversation;
}
