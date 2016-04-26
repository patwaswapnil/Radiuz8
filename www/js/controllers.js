angular.module('radiuz8.controllers', [])
    .controller('AppCtrl', ['$scope', '$ionicModal', '$timeout', '$ionicPopover', 'APIFactory', 'Loader', '$rootScope', 'LSFactory', '$ionicActionSheet',
        '$cordovaOauth', '$ionicPopup', '$state', '$ionicHistory', '$http',
        function($scope, $ionicModal, $timeout, $ionicPopover, APIFactory, Loader, $rootScope, LSFactory, $ionicActionSheet, $cordovaOauth, $ionicPopup,
            $state, $ionicHistory, $http) {
            //$scope.$on('$ionicView.enter', function(e) {
            //}); 
            $scope.updateUser = function() {
                if (LSFactory.get('radiusUser')) {
                    $rootScope.isLoggedIn = true;
                    $rootScope.user = LSFactory.get('radiusUser');
                    $timeout(function() {
                        $rootScope.isLoggedIn = true;
                    }, 200);
                } else {
                    $rootScope.isLoggedIn = false;
                    $rootScope.user = {};
                    $timeout(function() {
                        $rootScope.isLoggedIn = false;
                    }, 200);
                }
            };
            $scope.updateUser();
            $ionicPopover.fromTemplateUrl('templates/common-template.html', {
                scope: $scope
            }).then(function(popover) {
                $scope.popover = popover;
            });
            $scope.openPopover = function($event) {
                $scope.popover.show($event);
            };
            $rootScope.$on('showLoginModal', function($event, scope, cancelCallback, callback) {
                $scope.showLogin = true;
                $scope.registerToggle = function() {
                    $scope.showLogin = !$scope.showLogin;
                }
                $scope = scope || $scope;
                $scope.viewLogin = true;
                $ionicModal.fromTemplateUrl('templates/login.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.loginModal = modal;
                    $scope.loginModal.show();
                    $scope.hide = function() {
                        $scope.loginModal.hide();
                        if (typeof cancelCallback === 'function') {
                            cancelCallback();
                        }
                    }
                    $scope.authUser = function(data) {
                        console.log(data)
                        Loader.show('Authenticating')
                        APIFactory.authUser(data).then(function(response) {
                            if (response.data.msg == 'invalid') {
                                Loader.toggleLoadingWithMessage('Invalid Username or Password', 2000);
                            } else if (response.data.msg == 'success') {
                                Loader.toggleLoadingWithMessage('Authentication Successful', 2000);
                                $scope.loginModal.hide();
                                LSFactory.set('radiusUser', response.data[0].data)
                                $scope.updateUser();
                                if (typeof callback === 'function') {
                                    callback();
                                }
                            } else {
                                Loader.toggleLoadingWithMessage('Oops! something went wrong. Please try again', 2000);
                            }
                        }, function(error) {
                            console.error(error)
                        })
                    }
                    $scope.registerUser = function(data) {
                        Loader.show('Registering')
                        APIFactory.registerUser(data).then(function(response) {
                            console.log(response);
                            if (response.data == 'EmailExist') {
                                Loader.toggleLoadingWithMessage('Email is already registered!', 2000);
                            } else if (response.data == 'UsernameExist') {
                                Loader.toggleLoadingWithMessage('Username is already registered!', 2000);
                            } else if (response.data == 'success') {
                                Loader.toggleLoadingWithMessage('Registration Successful', 2000);
                                var cred = {
                                    logusername: data.regEmail,
                                    logpassword: data.regPassword
                                };
                                $scope.authUser(cred);
                            }
                        }, function(error) {
                            console.error(error)
                        })
                    }
                });
                $scope.facebookLogin = function() {
                        Loader.show();
                        $cordovaOauth.facebook("1695659084021677", ["email", "public_profile"], {
                            redirect_uri: "http://localhost/callback"
                        }).then(function(result) {
                            $http.get("https://graph.facebook.com/v2.2/me", {
                                params: {
                                    access_token: result.access_token,
                                    fields: "name,first_name,last_name,location,picture,email",
                                    format: "json"
                                }
                            }).then(function(result) {
                                console.log(result);
                                $scope.params = {
                                    firstName: result.data.first_name,
                                    lastName: result.data.last_name,
                                    regEmail: result.data.email,
                                    regUsername: result.data.name
                                };
                                APIFactory.socialRegister($scope.params).then(function(response) {
                                    $scope.loginModal.hide();
                                    Loader.hide();
                                    Loader.toast('Logged in successfuly');
                                    LSFactory.set('radiusUser', response.data.data)
                                    $scope.updateUser();
                                    if (typeof callback === 'function') {
                                        callback();
                                    }
                                }, function(error) {
                                    Loader.hide();
                                })
                            }, function(error) {
                                Loader.hide();
                            });
                        }, function(error) {
                            Loader.hide();
                            console.log(error);
                        });
                    } //end fb login
            });
            $scope.resetPwd = function() {
                $scope.data = {}
                    // An elaborate, custom popup
                var myPopup = $ionicPopup.show({
                    template: '<input type="email" ng-model="data.regEmail" placeholder="Enter you email" class="padding">',
                    title: 'Enter your email address',
                    subTitle: 'You will get a link to reset password',
                    scope: $scope,
                    buttons: [{
                        text: 'Cancel',
                        type: 'fs12 reset-btn'
                    }, {
                        text: 'Submit',
                        type: 'button-balanced fs12 reset-btn',
                        onTap: function(e) {
                            if (!$scope.data.regEmail) {
                                //don't allow the user to close unless he enters wifi password
                                e.preventDefault();
                            } else {
                                return $scope.data;
                            }
                        }
                    }, ]
                });
                myPopup.then(function(data) {
                    if (!data) {
                        return false;
                    }
                    Loader.show();
                    APIFactory.resetPwd(data).then(function(response) {
                        if (response.data == 1) {
                            Loader.hide();
                            Loader.toast('Your password reset link has been sent to your email Id');
                        } else {
                            Loader.hide();
                            Loader.toast('This Email Id is not registered');
                        }
                    }, function(error) {
                        console.error(error);
                        Loader.toggleLoadingWithMessage('Somwthing went wrong. Please try later');
                    })
                });
            };
            $scope.loginFromMenu = function() {
                $rootScope.$broadcast('showLoginModal', $scope, null, function() {
                    if ($state.is('app.home')) {
                        try {
                            $scope.$broadcast('refreshHomeData'); //get data using UserID
                        } catch (e) {
                            // statements
                            console.log(e);
                        }
                    };
                });
            };
            $scope.linkedinLogin = function() {
                $cordovaOauth.linkedin("753yliulajl3aw", "0pmeKcWyPLG1Qmm7", ["r_basicprofile", "r_fullprofile", "r_contactinfo", "r_network",
                    "r_emailaddress"
                ], "cnHKSsf5fc5n").then(function(result) {
                    var access_token = result.access_token;
                    var expire_date = result.expires_in;
                    APIFactory.linkedInLogin(access_token).then(function(result) {
                        LSFactory.set('linkedinUser', result);
                        console.log(result);
                    }, function(error) {
                        console.log(error);
                    });
                });
            };
            $scope.logout = function() {
                var hideSheet = $ionicActionSheet.show({
                    destructiveText: 'Logout',
                    titleText: 'Are you sure you want to logout?',
                    cancelText: 'Cancel',
                    cancel: function() {},
                    buttonClicked: function(index) {
                        return true;
                    },
                    destructiveButtonClicked: function() {
                        Loader.show();
                        LSFactory.delete('radiusUser');
                        hideSheet();
                        $scope.updateUser();
                        if ($state.is('app.home')) {
                            try {
                                $scope.$broadcast('refreshHomeData'); //get data using UserID
                            } catch (e) {
                                console.log(e);
                            }
                        } else {
                            $ionicHistory.nextViewOptions({
                                disableBack: true,
                                historyRoot: true
                            });
                            $state.go('app.home');
                        }
                        Loader.toast('Logged out successfuly')
                        Loader.hide();
                    }
                });
            };
            $scope.toggleGroup = function(group) {
                if ($scope.isGroupShown(group)) {
                    $scope.shownGroup = null;
                } else {
                    $scope.shownGroup = group;
                }
            };
            $scope.isGroupShown = function(group) {
                return $scope.shownGroup === group;
            };

            function followCelebrity(data, e) {
                APIFactory.followCeleb(data).then(function(response) {
                        Loader.hide();
                        if (response.data == 'following') {
                            Loader.toast('Following ' + data.cname);
                            angular.element(e.target).text("Unfollow");
                            $scope.$broadcast('followEventChanged');
                        } else if (response.data == 'unfollowed') {
                            angular.element(e.target).text("Follow");
                            Loader.toast('Unfollowed ' + data.cname);
                            $scope.$broadcast('followEventChanged');
                        } else {
                            Loader.toast('Oops! something went wrong. Please try following again')
                        }
                    },
                    function(error) {
                        Loader.toggleLoadingWithMessage('Oops! something went wrong. Please try following again');
                    })
            };
            $scope.follow = function(event, cid, cname) {
                var data = {
                    cid: cid,
                    cname: cname,
                    userId: $rootScope.user.ID
                };
                if (!$rootScope.isLoggedIn) {
                    $rootScope.$broadcast('showLoginModal', $scope, null, function() {
                        // user is now logged in
                        data.userId = $rootScope.user.ID;
                        followCelebrity(data, event);
                    });
                } else {
                    followCelebrity(data, event);
                }
            };
            $scope.getSegment = function(link) { //for setting href celeb listing from permlnk
                var segments = link.split('/');
                var action = segments[3];
                return '#/app/celebrity-detail/' + action;
            }
        }
    ])
    .controller('HomeCtrl', ['$scope', 'APIFactory', 'Loader', '$rootScope',
        function($scope, APIFactory, Loader, $rootScope) {
            console.log('enter home')
            $scope.$on('$ionicView.enter', function(e) {
                $scope.getTopCelebs();
            });
            $scope.filters = {};
            Loader.show();
            $scope.$on('refreshHomeData', function(e) {
                $scope.getTopCelebs();
            });
            $scope.getTopCelebs = function() {
                $scope.filters = {};
                $scope.filters.sort = 1;
                if ($rootScope.isLoggedIn) {
                    $scope.filters.userId = $rootScope.user.ID;
                } else {
                    $scope.filters.userId = undefined;
                    console.log($scope.filters);
                }
                APIFactory.getCelebs($scope.filters).then(function(response) {
                        $scope.topCelebs = response.data.celebs;
                        Loader.hide();
                    },
                    function(error) {
                        console.error(error);
                        Loader.hide();
                    });
            };
            $scope.getTopCelebs();
            $scope.modelFilter = "";
            $scope.getTestItems = function(query, isInitializing) {
                if (isInitializing) {
                    return {
                        items: []
                    }
                }
                else {
                    $scope.itemsArray = $scope.filterData(query);
                    if (query) {
                        return {
                            items: $scope.itemsArray
                        };
                    }
                    return {
                        items: []
                    };
                }
            }
            $scope.clickedMethod = function(callback) {
                var celebLink = $scope.getSegment(callback.item.permalink);
                window.location.href = celebLink;
            }
            $scope.filterData = function(data) {
                APIFactory.searchCeleb(data).then(function(response) {
                    $scope.found = response.data;
                }, function(error) {
                    $scope.found = [];
                });
                return $scope.found;
            }
        }
    ])
    .controller('ListingCtrl', ['$scope', '$ionicPopover', '$http', 'APIFactory', 'Loader', '$ionicModal', '$rootScope', '$timeout',
        function($scope, $ionicPopover, $http, APIFactory, Loader, $ionicModal, $rootScope, $timeout) {
            $scope.filters = {
                cat: undefined,
                c: '',
                filters: {},
                sort: undefined,
                page: 1,
                userId: undefined
            };
            if ($rootScope.isLoggedIn) {
                $scope.filters.userId = $rootScope.user.ID;
            };
            $scope.oldSubCat = [];
            $scope.canLoadMore = true;
            $scope.getCelebs = function() {
                Loader.show();
                APIFactory.getCelebs($scope.filters).then(function(response) {
                        $scope.celebs = response.data.celebs;
                        if (!angular.equals(response.data.subcats, $scope.oldSubCat)) {
                            $scope.subcat = response.data.subcats;
                        }
                        $scope.oldSubCat = angular.copy(response.data.subcats);
                        $scope.canLoadMore = response.data.celebs.length;
                        $scope.filters.page += 1;
                        Loader.hide();
                    },
                    function(error) {
                        console.error(error);
                        Loader.hide();
                    });
            }
            $scope.getCelebs();
            $scope.filterCeleb = function(option) {
                Loader.show();
                if (option == 'resetCat') {
                    $scope.filters.c = '';
                    $scope.selection = [];
                }
                $scope.filters.page = 1;
                $scope.getCelebs();
            };
            // function for subcat filter &c=55&c=54
            $scope.selection = [];
            $scope.toggleSelection = function(subcat) {
                var itemIndex = null;
                var tembVar = '';
                $scope.selection.forEach(function(element, index) {
                    if (subcat == element) {
                        itemIndex = index;
                    }
                });
                if (itemIndex != null) {
                    $scope.selection.splice(itemIndex, 1);
                } else {
                    $scope.selection.push(subcat);
                }
                console.log($scope.selection);
                if ($scope.selection) {
                    $scope.selection.forEach(function(element, index) {
                        tembVar += '&c=' + element;
                    });
                } else {
                    tembVar = ''
                }
                $scope.filters.c = tembVar;
                $scope.filters.page = 1;
                /* body... */
                $scope.getCelebs();
            };
            $scope.loadMoreCeleb = function() {
                APIFactory.getCelebs($scope.filters).then(function(response) {
                        var celebData = response.data.celebs;
                        angular.forEach(celebData, function(element, index) {
                            $scope.celebs.push(element);
                        });
                        try {
                            if (!response.data.celebs.length) {
                                $scope.canLoadMore = false;
                            };
                            // statements
                        } catch (e) {
                            // statements
                            $scope.canLoadMore = false;
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        }
                        $scope.filters.page += 1;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    },
                    function(error) {
                        console.error(error);
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
            };
            APIFactory.getFilterCategory().then(function(response) {
                $scope.filterCat = response.data;
            }, function(error) {
                console.error(error);
            });
            $ionicModal.fromTemplateUrl('templates/filters.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });
            $scope.openFilters = function() {
                $scope.modal.show();
            };
            $scope.closeFilters = function() {
                $scope.modal.hide();
            };
            // Pass the checkbox name to the function 
        }
    ])
    .controller('DetailCtrl', ['$scope', '$rootScope', '$ionicPlatform', '$stateParams', 'APIFactory', 'Loader', 'CommonFactory', 'LSFactory',
        function($scope, $rootScope, $ionicPlatform, $stateParams, APIFactory, Loader, CommonFactory, LSFactory) {
            $scope.getCelebrity = function() {
                Loader.show();
                var userId = undefined;
                if ($rootScope.isLoggedIn) {
                    userId = $rootScope.user.ID;
                }
                APIFactory.getCelebDetail($stateParams.name, userId).then(function(response) {
                    console.log(response);
                    $scope.celebrity = response.data;
                    $scope.items = [];
                    if (response.data.gallery.length)
                    {
                        response.data.gallery.forEach(function(element, index) {
                            var tempObj = {
                                src: ''
                            };
                            tempObj.src = element;
                            $scope.items.push(tempObj);
                        });
                    }
                    try {
                        $scope.wiki = response.data.wiki.query.pages[Object.keys(response.data.wiki.query.pages)[0]].extract;
                    } catch (e) {}
                    Loader.hide();
                }, function(error) {
                    console.log(error);
                    Loader.hide();
                })
            }
            $scope.getCelebrity();
            $scope.openLink = function(link) {
                CommonFactory.inAppLink(link).then(function(response) {}, function(error) {
                    console.log(error);
                })
            };
            $scope.set_star = function(number) {
                var star = number * 20;
                return {
                    width: star + '%'
                }
            }
            $scope.activePan = 'social';
            $scope.updatePan = function(name) {
                $scope.activePan = name;
            }
        }
    ])
    .controller('ChatListingCtrl', ['$scope', '$state', 'APIFactory', 'LSFactory', 'Loader', '$rootScope',
        function($scope, $state, APIFactory, LSFactory, Loader, $rootScope) {
            Loader.show();
            APIFactory.messageExchange($rootScope.user.ID).then(function(response) {
                $scope.msgList = response.data;
                Loader.hide();
            }, function(error) {
                Loader.toast('Something went wrong. Please try later');
                console.error(error);
                Loader.hide();
            });
        }
    ])
    .controller('ChatCtrl', ['$scope', '$state', 'APIFactory', 'LSFactory', 'Loader', '$rootScope', '$stateParams', '$timeout', '$ionicScrollDelegate',
        function($scope, $state, APIFactory, LSFactory, Loader, $rootScope, $stateParams, $timeout, $ionicScrollDelegate) {
            Loader.show();
            $scope.chattingWith = $stateParams.name;
            $scope.chatWithId = $stateParams.celebId;
            $scope.data = {
                celebId: $scope.chatWithId,
                userId: $rootScope.user.ID
            };
            $scope.getMessages = function() {
                APIFactory.celebChatMsg($scope.data).then(function(response) {
                    $scope.messages = response.data;
                    Loader.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                    $timeout(function() {
                        $ionicScrollDelegate.scrollBottom([true]);
                    }, 500);
                }, function(error) {
                    Loader.toast('Something went wrong. Please try later');
                    console.error(error);
                    Loader.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                });
            }
            $scope.getMessages();
            $scope.sendMessage = function(msg, toId) {
                $scope.msgHeader = {
                    msg: msg,
                    toId: toId,
                    userId: $rootScope.user.ID
                };
                APIFactory.sendMessage($scope.msgHeader).then(function(response) {
                    $scope.input.message = '';
                    $scope.messages = response.data;
                    $timeout(function() {
                        $ionicScrollDelegate.scrollBottom([true]);
                    }, 500);
                    Loader.hide();
                }, function(error) {
                    Loader.toast('Something went wrong. Please try later');
                    console.error(error);
                    Loader.hide();
                });
            }
        }
    ])
    .controller('FeedsCtrl', ['$scope', '$state', 'APIFactory', 'Loader', '$timeout', '$rootScope', '$ionicHistory',
        function($scope, $state, APIFactory, Loader, $timeout, $rootScope, $ionicHistory) {
             if (!$rootScope.isLoggedIn) {
                $rootScope.$broadcast('showLoginModal', $scope, function() {
                     $ionicHistory.nextViewOptions({
                                disableBack: true,
                                historyRoot: true
                            });
                    $state.go('app.home');
                }, function() {
                    getFeeds();
                });
            } else {
                getFeeds();
            }
            function getFeeds () {
                Loader.show();
            APIFactory.getFeeds($rootScope.user.ID).then(function(response) {
                $scope.tweets = response.data;
                $timeout(function() {
                    Loader.hide();
                }, 3000)
            }, function(error) {
                Loader.hide();
                console.log(error);
            })
        };
    }
    ])
    .controller('ContactCelebCtrl', ['$scope', '$state', '$stateParams', 'APIFactory', '$ionicHistory', 'Loader', '$rootScope',
        function($scope, $state, $stateParams, APIFactory, $ionicHistory, Loader, $rootScope) {
            if (!$rootScope.isLoggedIn) {
                $rootScope.$broadcast('showLoginModal', $scope, function() {
                    $ionicHistory.goBack(-1);
                }, null);
            }
            $scope.celebId = $stateParams.celebId;
            $scope.celebName = $stateParams.name;
            $scope.sendMessage = function(data) {
                data.celeb_name = $scope.celebName;
                data.userId = $rootScope.user.ID;
                Loader.show();
                APIFactory.sendMsgCeleb(data).then(function(data) {
                    Loader.hide();
                    Loader.toast('Your message has been sent successfuly');
                    $ionicHistory.goBack(-1);
                }, function(error) {
                    Loader.hide();
                    console.log(error);
                })
            };
        }
    ])
    .controller('userProfileCtrl', ['$scope', 'APIFactory', 'LSFactory', '$rootScope', 'Loader', '$ionicHistory',
        function($scope, APIFactory, LSFactory, $rootScope, Loader, $ionicHistory) {
            if (!$rootScope.isLoggedIn) {
                $rootScope.$broadcast('showLoginModal', $scope, function() {
                    $ionicHistory.goBack(-1);
                }, function() {
                    getUserData();
                });
            } else {
                getUserData();
            }

            function getUserData() {
                Loader.show();
                APIFactory.userData($rootScope.user.ID).then(function(response) {
                    Loader.hide();
                    $scope.userInfo = response.data;
                }, function(data) {
                    /* body... */
                    Loader.hide();
                    Loader.toast('Oops! something went wrong');
                })
            }
        }
    ])
    .controller('FollowedCelebCtrl', ['$scope', 'APIFactory', 'LSFactory', '$rootScope', 'Loader', '$ionicHistory',
        function($scope, APIFactory, LSFactory, $rootScope, Loader, $ionicHistory) { 
            if (!$rootScope.isLoggedIn) {
                $rootScope.$broadcast('showLoginModal', $scope, function() {
                    $ionicHistory.goBack(-1);
                }, function() {
                    getFollwedCeleb();
                });
            } else {
                getFollwedCeleb();
            }
            $scope.$on('followEventChanged', function(e) {
                getFollwedCeleb(); 
            })

            function getFollwedCeleb() {
                Loader.show();
                APIFactory.myFollowees($rootScope.user.ID).then(function(response) {
                    Loader.hide();
                    $scope.follwedCelebs = response.data;
                }, function(data) {
                    Loader.hide();
                    Loader.toast('Oops! something went wrong');
                })
            }
        }
    ])
    // .controller('Ctrl',['$scope', function($scope) {
    // }])