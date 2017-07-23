angular
.module('justo')
.controller('ProjectIndexCtrl', ProjectIndexCtrl)
.controller('ProjectNewCtrl', ProjectNewCtrl)
.controller('ProjectShowCtrl', ProjectShowCtrl)
.controller('ProjectEditCtrl', ProjectEditCtrl);

ProjectIndexCtrl.$inject = ['Project'];
function ProjectIndexCtrl (Project) {
  const vm = this;
  vm.all = Project.query();
}


ProjectNewCtrl.$inject = ['Project', 'User', '$stateParams', '$state'];
function ProjectNewCtrl (Project, User, $stateParams, $state ){
  const vm = this;
  vm.project = {};
  vm.users = User.query();


  const today = new Date();
  vm.today = today.toISOString();


  function projectsCreate() {
    Project
    .save(vm.project)
    .$promise
    .then(() =>
    $state.go('projectsIndex'));
  }
  vm.create = projectsCreate;
}


ProjectShowCtrl.$inject = ['Project', 'User', '$stateParams', '$state', 'Conversation'];
function ProjectShowCtrl (Project, User, $stateParams, $state, Conversation){
  const vm = this;
  vm.project = Project.get($stateParams);

  function contactCreator(sender_id, receiver_id) {
    console.log(sender_id, receiver_id);
    Conversation
      .save({ sender_id, receiver_id })
      .$promise
      .then((response) => {
        console.log(response);
        $state.go('conversations');
      });
  }

  vm.contactCreator = contactCreator;
}


ProjectEditCtrl.$inject = ['Project', 'User', '$stateParams', '$state'];
function ProjectEditCtrl (Project, User, $stateParams, $state) {
  const vm = this;

  Project.get($stateParams)
  .$promise
  .then((project) => {
    vm.project = project;
    vm.project.project_deadline = new Date(project.project_deadline);
    vm.project.bid_deadline = new Date(project.bid_deadline);
  });

  function projectUpdate() {
    Project
    .update({ id: vm.project.id }, vm.project)
    .$promise
    .then(() =>
    $state.go('projectsShow', { id: vm.project.id }));
  }
  vm.update = projectUpdate;

  function projectsDelete() {
    vm.project
    .$remove()
    .then(() => $state.go('projectsIndex'));
  }

  vm.delete = projectsDelete;
}
