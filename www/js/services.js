angular.module('radiuz8.services', [])

.factory('APIFactory', ['$http', '$httpParamSerializer', function ($http, $httpParamSerializer) {
    var api = {
        getCelebs : function (data) { 
            var filterObj;
            try {
                 filterObj = (JSON.stringify(data.filters)).slice(1, -1);
            } catch(e) {
                 filterObj = JSON.stringify(data.filters);
            }
            return $http.get(domain+"celeb-for-app&cat="+data.cat+''+data.c+"&filter="+filterObj+"&sort="+data.sort+"&pg="+data.page+"&userId="+data.userId);
        },
        getCelebDetail : function (celeb, userId) {
            return $http.get(domain+"get-celebrity-detail&slug="+celeb+"&userId="+userId);
        },
        getFeeds : function (userId) {
            return $http.get(domain+"my-feed&userId="+userId);
        },
        followCeleb : function (payload) {  
            var req = {method: 'POST', url: domain+'follow', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, data: $httpParamSerializer(payload)};
            return $http(req);
        },
        getFilterCategory : function () {
              return $http.get(domain+"get-celebrity-categories");
        },
        authUser : function (data) {
            var req = {method: 'POST', url: domain+'login', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, data: $httpParamSerializer(data)};
            return $http(req);
        },
        registerUser : function (data) {
            var req = {method: 'POST', url: domain+'register', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, data: $httpParamSerializer(data)};
            return $http(req);
        },
        linkedInLogin : function (access_token) {
            return $http.get('https://api.linkedin.com/v1/people/~:(email-address,first-name,last-name)?format=json&oauth2_access_token=' + access_token);
        },
        resetPwd : function (data) {
            var req = {method: 'POST', url: domain+'send-link', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, data: $httpParamSerializer(data)};
            return $http(req);
        },
        searchCeleb : function (search) {
            return $http.get(domain+"free-search&term="+search);
        },
        messageExchange : function (data) {  //chat listing
            return $http.get(domain+"get-message-users&userId="+data);
        },
        celebChatMsg : function (data) { //chat detail
            return $http.get(domain+"user-msges&msgid="+data.celebId+"&userId="+data.userId);
        },
        sendMessage : function (data) {
            return $http.get(domain+"add-msg&msgT="+data.msg+"&toid="+data.toId+"&userId="+data.userId);
        },
        userData : function (userId) {
            return $http.get(domain+"my-account&userId="+userId);
        },
        myFollowees : function (userId) { 
            return $http.get(domain+"my-followees&userId="+userId);
        },
        sendMsgCeleb : function (data) { 
            var req = {method: 'POST', url: domain+'contact-celeb', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, data: $httpParamSerializer(data)};
            return $http(req);
        },
        socialRegister : function (data) { 
            var req = {method: 'POST', url: domain+'apiregister', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, data: $httpParamSerializer(data)};
            return $http(req);
        },
        updateUser : function (data, password, userId) {
            return $http.post(domain+"update-user&first_name="+data.user_meta.first_name[0]+"&last_name="+data.user_meta.last_name[0]+"&phone="+data.user_meta.phone[0]+"&email="+data.user_email+"&address="+data.user_meta.address[0]+"&city="+data.user_meta.city[0]+"&postalcode="+data.user_meta.postal_code[0]+"&state="+data.user_meta.state[0]+"&country="+data.user_meta.country[0]+"&pass="+password.pass+"&repass="+password.repass+"&userId="+userId);
     },
        sendContactMail : function (data) {
            return $http.get(domain+"send-contact-mail&pname="+data.pname+"&email="+data.email+"&phone="+data.phone+"&subject="+data.subject+"&service="+data.service+"&message="+data.message);
     },
     linkedinToken : function (data) {
             return $http({method: "post", headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: "https://www.linkedin.com/uas/oauth2/accessToken", data: $httpParamSerializer(data)})
     }
    };
    return api;
}])
.factory('Loader', ['$ionicLoading', '$timeout', '$cordovaToast', function($ionicLoading, $timeout, $cordovaToast) {
        var LOADERAPI = {
            show: function(text) {
                if (text) {
                    $ionicLoading.show({
                        template: text
                    });
                } else {
                    $ionicLoading.show();
                }
            },
            hide: function() {
                $ionicLoading.hide();
            },
            toggleLoadingWithMessage: function(text, timeout) {
                var self = this;
                self.show(text);
                $timeout(function() {
                    self.hide();
                }, timeout || 3000);
            },

            toast: function (msg) {   
                var isAndroid = ionic.Platform.isAndroid();
                var isIOS = ionic.Platform.isIOS();
                if (isAndroid || isIOS) {
                 $cordovaToast.show(msg, 'short', 'center').then(function(success) {});    
                }
                else {
                    console.info(msg);
                }
            }
        };
        return LOADERAPI;
}])
.factory('LSFactory', [function() {

        var LSAPI = {
            clear: function() {
                return localStorage.clear();
            },
            get: function(key) {
                return JSON.parse(localStorage.getItem(key));
            },
            set: function(key, data) {
                return localStorage.setItem(key, JSON.stringify(data));
            },
            setArray: function(key, data) {
                return localStorage.setItem(key, JSON.stringify([data]));
            },
            delete: function(key) {
                return localStorage.removeItem(key);
            },
            getAll: function() {
            }
        };
        return LSAPI;
}])
.factory('CommonFactory', ['$cordovaInAppBrowser', function($cordovaInAppBrowser) {

        var commonFactory = {
            inAppLink: function(link) { 
            var options = {location: 'yes',clearcache: 'yes',toolbar: 'no',closebuttoncaption: 'DONE?' };
                return $cordovaInAppBrowser.open(link, '_blank', options);
            }
            }  
        return commonFactory;
}])