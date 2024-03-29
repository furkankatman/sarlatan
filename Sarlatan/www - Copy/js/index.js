/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {

        var app = angular.module("SarlatanApp", [
            "ngMaterial",
            "ngMessages", "ngSanitize",
            "ui.router",
        ]);
        // "hmTouchEvents"

        app.controller("MainController", function ($scope, $state, $timeout) {
            $scope.Greeting = "Merhaba Sayın Üye :)";
            $scope.Game = {};
            $scope.state = $state;
            // $scope.fib = {};
            // $scope.fib.auth = firebase.auth();
            // $scope.fib.db = firebase.database();
            $scope.Game = { On: false };
            $scope.Game.Player1 = { Coin: 100, Result: "" };
            $scope.Game.Player2 = { Coin: 300, Result: "" };
            $scope.Game.Turn = 1;
            $scope.Game.StartDate = moment().valueOf();
            $scope.determinateValue = 0;
            $scope.isDragging = false;
            $scope.lastPosX = 0;
            $scope.Game.RoundWinner = "0";
            $scope.Sound = {};
            $scope.Sound.youwon = { tr: {}, en: {} };
            $scope.Sound.youlost = { tr: {}, en: {} };
            $scope.createSound = function (file) {
                var sound = new Audio();
                var src1 = document.createElement("source");
                src1.type = "audio/x-wav";
                src1.src = file;
                sound.appendChild(src1);
                return sound;
            }
            $scope.Sound.Collect = $scope.createSound(cordova.file.applicationDirectory + "www/audio/collect.wav");

            $scope.Emojis = ["<span>&#128512;</span>", "<span>&#128557;</span>", "<span>&#128544;</span>"];


            $scope.onHammer = function (e) {
                // if (e.isFinal == false)
                //     return


                var elem = angular.element(e.target);

                if (!$scope.isDragging) {
                    $scope.isDragging = true;
                    if (isNaN(parseInt(elem.css("left"))) == true) {
                        if (elem.css("left") == "")
                            $scope.lastPosX = 0;
                        else
                            $scope.lastPosX = parseInt(elem.css("left").replace("px", ""))
                    } else {
                        $scope.lastPosX = parseInt(elem.css("left").replace("px", ""))
                    }
                    // lastPosY = elem.offsetTop;
                }

                var posX = e.deltaX + $scope.lastPosX;
                if (posX >= 380) {
                    posX = 380;
                }
                else if (posX <= 0) {
                    posX = 0
                }
                // var posY = e.deltaY + lastPosY;
                elem.css("left", posX + "px");
                // elem.style.top = posY + "px";
                if (e.isFinal) {
                    $scope.isDragging = false;

                }

            }

            $scope.Gox = function () {
                $scope.Game.RoundWinner = "0";
                $scope.Game.Player1.ResultNum = 0;
                $scope.Game.Player2.ResultNum = 0;
                $scope.Game.Player1.Result = $scope.Roll($scope.Game.Turn);

                $scope.Game.Player2.Result = $scope.Roll($scope.Game.Turn);
                $scope.Game.Player1.ResultNum = 0;
                $scope.Game.Player1.Result.split(" && ").forEach(element => {
                    $scope.Game.Player1.ResultNum = $scope.Game.Player1.ResultNum + parseInt(element)
                });;
                $scope.Game.Player2.ResultNum = 0;
                $scope.Game.Player2.Result.split(" && ").forEach(element => {
                    $scope.Game.Player2.ResultNum = $scope.Game.Player2.ResultNum + parseInt(element)
                });;
                if ($scope.Game.Player2.ResultNum > $scope.Game.Player1.ResultNum) {
                    $scope.Game.RoundWinner = "2"
                }
                if ($scope.Game.Player2.ResultNum < $scope.Game.Player1.ResultNum) {
                    $scope.Game.RoundWinner = "1"
                }
                if ($scope.Game.Player2.ResultNum == $scope.Game.Player1.ResultNum) { $scope.Game.RoundWinner = "0"; }
                console.log($scope.Game.RoundWinner)
            }

            $scope.Roll = function (turn) {
                var score1 = Math.floor(Math.random() * 6) + 1;
                var score2 = Math.floor(Math.random() * 6) + 1;
                if ($scope.Game.Turn == 1)
                    $scope.Game.Turn = 2;
                else
                    $scope.Game.Turn = 1;
                return score1 + " && " + score2
            }
            $scope.$watch(function () {
                return angular.element(document.getElementsByClassName("ChallengeIcon")[0]).css("left")
            }, function (nv, ov) {
                var percentage = nv != "" ? parseInt(100 * parseInt(nv) / 380) : 0
                $scope.determinateValue = percentage
                $scope.ChallengeCoin = $scope.Game.Turn == 1 ? parseInt(percentage * $scope.Game.Player1.Coin / 100) : parseInt(percentage * $scope.Game.Player2.Coin / 100);
                navigator.vibrate(1)
            })
        })
        app.config(function ($stateProvider, $urlRouterProvider) {
            var homeState = {
                name: "home",
                url: "/home",
                templateUrl: "Templates/Home.html",
                controller: "MainController"
            };
            // var signupState = {
            //     name: "signup",
            //     url: "/signup",
            //     templateUrl: "Templates/Signup.html",
            //     controller: function ($scope) {
            //         $scope.Greeting = "Selam Kayıt Ekranı";
            //         $scope.user = {};
            //         $scope.Signup = function () {
            //             console.log("Kayıt oldunuz.");
            //             firebase
            //                 .auth()
            //                 .createUserWithEmailAndPassword(
            //                     $scope.user.email,
            //                     $scope.user.password
            //                 )
            //                 .catch(function (error) {
            //                     // Handle Errors here.
            //                     var errorCode = error.code;
            //                     var errorMessage = error.message;
            //                     // ...
            //                 })
            //                 .then(function () {
            //                     console.log("Kullanıcı kaydedildi.--->", user.email);
            //                 });
            //         };
            //     }
            // };
            $stateProvider.state(homeState)
            // $stateProvider.state(signupState)
            $urlRouterProvider.otherwise("/home");
        })


        window.screen.orientation.lock('landscape');
        angular.element(document).ready(function () {
            angular.bootstrap(document, ["SarlatanApp"]);
        });




        window.addEventListener("orientationchange", function () {
            console.log(screen.orientation.type); // e.g. portrait
        });
        //device ready ends
    }

};

app.initialize();