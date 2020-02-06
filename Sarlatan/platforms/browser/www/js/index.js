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

        var app = angular.module("SarlatanApp", ["ui.router", "hmTouchEvents", "ngSanitize", "ngMaterial", "LocalStorageModule"]);
        // "hmTouchEvents", "ngSanitize", "ngMaterial", "LocalStorageModule", 

        app.controller("MainController", function ($scope, $state, $timeout) {
            $scope.Greeting = "Merhaba Sayın Üye :)";
            $scope.state = $state;
            $scope.fib = {};
            $scope.fib.auth = firebase.auth();
            $scope.fib.db = firebase.database();
            $scope.Game = { On: false };
            var coin1 = parseInt(Math.random() * 1000 + 1)
            var coin2 = parseInt(Math.random() * 1000 + 1)
            $scope.Game.Player1 = { Coin: coin1, Result: "" };
            $scope.Game.Player2 = { Coin: coin2, Result: "" };
            $scope.Game.Turn = 1;
            $scope.Game.LogStartDate = moment().valueOf();
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
            $scope.Restart = function () {
                setTimeout(() => {
                    var coin1 = parseInt(Math.random() * 1000 + 1)
                    $scope.determinateValue = 0;
                    $scope.ChallengeCoin = 0;
                    angular.element(document.getElementsByClassName("ChallengeIcon")[0]).css("left", "0px")
                    if ($scope.Game.Player1.Win) {
                        coin1 = $scope.Game.Player1.Coin
                    }
                    $scope.Game = { On: false };
                    var coin2 = parseInt(Math.random() * 1000 + 1)
                    $scope.Game.Player1 = { Coin: coin1, Result: "" };
                    $scope.Game.Player2 = { Coin: coin2, Result: "" };

                    $scope.StartGame()
                }, 600);
            }
            $scope.Gox = function () {
                if ($scope.Game.Turn == 1 && $scope.Game.Collectable == true) {
                    angular.element(document.getElementById("collect")).addClass("borderBlink")
                    return
                }
                if ($scope.Game.Turn != 1 && $scope.Game.Collectable == true) {
                    angular.element(document.getElementById("collect")).addClass("borderBlink")
                    return
                }
                if ($scope.Game.Turn != 1)
                    return
                if ($scope.Game.Turn == 1 && $scope.Game.Player2.Result != "" && $scope.Game.Player1.Result != "") {
                    $scope.Game.RoundWinner = 0;
                    $scope.Game.Player1.Result = "";
                    $scope.Game.Player2.Result = "";
                    $scope.Game.Player1.ResultNum = 0;

                    $scope.Game.Player1.Result = $scope.Roll($scope.Game.Turn);


                    $scope.Game.Player1.ResultNum = 0;
                    $scope.Game.Player1.Result.split(" && ").forEach(element => {
                        $scope.Game.Player1.ResultNum = $scope.Game.Player1.ResultNum + parseInt(element)
                    });
                    if ($scope.Game.Player2.ResultNum > $scope.Game.Player1.ResultNum) {
                        $scope.Game.RoundWinner = 2;
                        setTimeout(() => {
                            //give to number2
                            $scope.Handout();
                            $scope.Game.RoundWinner = 0;
                            $scope.Game.Player1.ResultNum = 0;
                            $scope.Game.Player1.Result = ""
                            $scope.Game.Player2.ResultNum = 0;
                            $scope.Game.Player2.Result = ""
                            $scope.GoForPlayer2();
                            $scope.$apply()
                        }, 2000);
                    }
                    if ($scope.Game.Player2.ResultNum < $scope.Game.Player1.ResultNum) {
                        $scope.Game.RoundWinner = 1;
                        $scope.Game.Collectable = true;
                    }
                    if ($scope.Game.Player2.ResultNum == $scope.Game.Player1.ResultNum) {
                        $scope.Game.RoundWinner = 0;
                        setTimeout(() => {
                            $scope.GoForPlayer2()
                            $scope.$apply()
                        }, 400);
                    }
                    return;
                }
                else if ($scope.Game.Turn == 1 && $scope.Game.Player2.Result == "") {
                    $scope.Game.RoundWinner = 0;
                    $scope.Game.Player1.ResultNum = 0;

                    $scope.Game.Player1.Result = $scope.Roll($scope.Game.Turn);


                    $scope.Game.Player1.ResultNum = 0;
                    $scope.Game.Player1.Result.split(" && ").forEach(element => {
                        $scope.Game.Player1.ResultNum = $scope.Game.Player1.ResultNum + parseInt(element)
                    });
                    $scope.GoForPlayer2()
                }
                else if ($scope.Game.Turn == 1 && $scope.Game.Player2.Result != "") {
                    $scope.Game.RoundWinner = 0;
                    $scope.Game.Player1.ResultNum = 0;

                    $scope.Game.Player1.Result = $scope.Roll($scope.Game.Turn);


                    $scope.Game.Player1.ResultNum = 0;
                    $scope.Game.Player1.Result.split(" && ").forEach(element => {
                        $scope.Game.Player1.ResultNum = $scope.Game.Player1.ResultNum + parseInt(element)
                    });
                    if ($scope.Game.Player1.ResultNum > $scope.Game.Player2.ResultNum)
                        $scope.Game.RoundWinner = 1;
                    else if ($scope.Game.Player1.ResultNum < $scope.Game.Player2.ResultNum) {
                        $scope.Game.RoundWinner = 2;
                        $scope.Game.Turn = 2;
                        setTimeout(() => {
                            $scope.Handout()
                            $scope.$apply()
                        }, 2000);
                    }
                    else if ($scope.Game.Player1.ResultNum == $scope.Game.Player2.ResultNum) {
                        setTimeout(() => {
                            $scope.Game.Player1.Result = 0;
                            $scope.Game.Player2.Result = 0;
                            $scope.Game.Player1.ResultNum = 0;
                            $scope.Game.Player2.ResultNum = 0;
                            $scope.Game.Turn = 2;
                            $scope.GoForPlayer2()
                            $scope.$apply()
                        }, 1200);
                    }

                }
                console.log($scope.Game.RoundWinner)
            }
            $scope.Collect = function () {
                $scope.Sound.Collect.play();

                $scope.Game.Player1.Result = "";
                $scope.Game.Player2.Result = "";

                setTimeout(() => {
                    $scope.Handout();
                    $scope.Game.Turn = 1;
                    $scope.Game.Collectable = false;
                    $scope.Game.RoundWinner = 0
                    angular.element(document.getElementById("collect")).removeClass("borderBlink")
                    // $scope.GoForPlayer2();
                    $scope.$apply()
                }, 600);
            }
            $scope.Handout = function () {
                $scope.Game.Player1.Result = ""
                $scope.Game.Player2.Result = ""
                $scope.Game.Player1.ResultNum = 0
                $scope.Game.Player2.ResultNum = 0
                if ($scope.Game.RoundWinner == 1) {
                    if ($scope.Game.Player2.Coin - $scope.ChallengeCoin <= 0) {
                        // alert("YOU WIN")
                        $scope.Game.Player1.Win = true;
                        angular.element(document.getElementById("winner")).addClass("flash animated");
                        $scope.$apply()
                    }
                    else {
                        $scope.Game.Player2.Coin = $scope.Game.Player2.Coin - $scope.ChallengeCoin;
                        $scope.Game.Player1.Coin = $scope.Game.Player1.Coin + $scope.ChallengeCoin
                    }


                } else {
                    if ($scope.Game.Player1.Coin - $scope.ChallengeCoin <= 0) {
                        setTimeout(() => {
                            // alert("YOU Loose")
                            $scope.Game.Player1.Lose = true;
                            angular.element(document.getElementById("loser")).addClass("rotateInDownRight animated");
                            $scope.$apply()
                        }, 500);
                    }
                    else {
                        $scope.Game.Player1.Coin = $scope.Game.Player1.Coin - $scope.ChallengeCoin;
                        $scope.Game.Player2.Coin = $scope.Game.Player2.Coin + $scope.ChallengeCoin;
                        setTimeout(() => {
                            $scope.Game.RoundWinner = 0;
                            $scope.GoForPlayer2()
                        }, 700);
                    }

                }

            }
            $scope.Roll = function (turn) {
                var score1 = Math.floor(Math.random() * 6) + 1;
                var score2 = Math.floor(Math.random() * 6) + 1;
                if ($scope.Game.Turn == 1 && $scope.Game.Player2.Result == "")
                    $scope.Game.Turn = 2;
                else if ($scope.Game.Turn == 2 && $scope.Game.Player1.Result == "")
                    $scope.Game.Turn = 1;
                return score1 + " && " + score2
            }
            $scope.MoveHandGo = function () {
                var top = angular.element(document.getElementById("go")).offset().top;
                var left = angular.element(document.getElementById("go")).offset().left;
                angular.element(document.getElementById("hand")).css("top", (top + 5) + "px")
                angular.element(document.getElementById("hand")).css("right", (left + 5) + "px")
            }
            $scope.MoveHandGoBack = function () {
                angular.element(document.getElementById("hand")).css("right", (-50) + "px")
            }

            $scope.GoForPlayer2 = function () {
                if ($scope.Game.Turn == 2 && $scope.Game.Player1.Result == "") {
                    var percentage = Math.ceil((Math.random() * 100) + 1);
                    console.log(percentage, "percenteeage gofor")
                    var challengeCoinWidth = parseInt(380 * percentage / 100);
                    angular.element(document.getElementsByClassName("ChallengeIcon")[0]).css("left", challengeCoinWidth + "px")
                    // $scope.determinateValue = percentage;
                    var top = angular.element(document.getElementById("go")).offset().top;
                    var left = angular.element(document.getElementById("go")).offset().left;
                    angular.element(document.getElementById("hand")).css("top", (top + 5) + "px")
                    angular.element(document.getElementById("hand")).css("right", (left + 5) + "px")
                    $scope.$apply()
                    setTimeout(() => {
                        $scope.Game.Player2.ResultNum = 0;
                        $scope.Game.Player2.Result = $scope.Roll($scope.Game.Turn);
                        $scope.Game.Player2.Result.split(" && ").forEach(element => {
                            $scope.Game.Player2.ResultNum = $scope.Game.Player2.ResultNum + parseInt(element)
                        });
                        $scope.Game.Turn = 1;
                        angular.element(document.getElementById("hand")).css("right", (-50) + "px")
                        $scope.$apply()
                    }, 3200);
                }
                else if ($scope.Game.Turn == 2 && $scope.Game.Player1.Result != "") {
                    $scope.MoveHandGo();
                    setTimeout(() => {
                        $scope.Game.Player2.ResultNum = 0;
                        $scope.Game.Player2.Result = $scope.Roll($scope.Game.Turn);
                        $scope.Game.Player2.Result.split(" && ").forEach(element => {
                            $scope.Game.Player2.ResultNum = $scope.Game.Player2.ResultNum + parseInt(element)
                        });
                        $scope.MoveHandGoBack();
                        if ($scope.Game.Player2.Result != "" && $scope.Game.Player1.Result != "") {
                            if ($scope.Game.Player2.ResultNum > $scope.Game.Player1.ResultNum) {
                                $scope.Game.RoundWinner = 2;
                                $scope.Game.Turn = 2;
                                setTimeout(() => {
                                    $scope.Handout()
                                    $scope.$apply()
                                }, 1300);
                            }
                            else if ($scope.Game.Player2.ResultNum < $scope.Game.Player1.ResultNum) {
                                $scope.Game.RoundWinner = 1;
                                $scope.Game.Turn = 1;
                            }
                            else if ($scope.Game.Player2.ResultNum == $scope.Game.Player1.ResultNum) {
                                $scope.Game.RoundWinner = 0;

                                setTimeout(() => {
                                    $scope.Game.Turn = 1;
                                    $scope.Game.Player1.Result = ""
                                    $scope.Game.Player2.Result = ""
                                    $scope.Game.Player1.ResultNum = 0
                                    $scope.Game.Player2.ResultNum = 0
                                    $scope.$apply()
                                }, 1300);
                            }

                        }
                        $scope.$apply()
                    }, 3200);

                }


            }
            $scope.StartGame = function () {
                setTimeout(() => {
                    $scope.Game.On = true;
                    var turn = parseInt(Math.random() * 100) % 2;
                    if (turn == 0) {
                        $scope.Game.Turn = 1;
                    } else {
                        $scope.Game.Turn = 2;
                        $scope.GoForPlayer2()
                    }
                    $scope.$apply()
                }, 300);
            }

            $scope.$watch("Game.RoundWinner", function (nv, ov) {
                if (ov != 1 && nv == 1) {
                    $scope.Game.Collectable = true;
                } else if (nv == 2) {
                    $scope.Game.Collectable = false;
                }
            })
            $scope.$watch(function () {
                return angular.element(document.getElementsByClassName("ChallengeIcon")[0]).css("left")
            }, function (nv, ov) {
                console.log("ChallengeIcon Css Left", nv);
                var percentage = nv != "" ? parseInt(100 * parseInt(nv) / 380) : 0
                $scope.determinateValue = percentage
                console.log($scope.determinateValue, "Percentage");
                if ($scope.Game.Turn == 1) {
                    $scope.ChallengeCoin = Math.ceil(percentage * $scope.Game.Player1.Coin / 100)
                    console.log($scope.ChallengeCoin)
                }
                else {
                    $scope.ChallengeCoin = Math.ceil(percentage * $scope.Game.Player2.Coin / 100)
                    console.log($scope.ChallengeCoin)
                }

                navigator.vibrate(1)
            })
            $scope.WatchAd = function () {
                setTimeout(function () {
                    if (AdMob) {

                        if (/(android)/i.test(navigator.userAgent)) { // for android & amazon-fireos
                            admobid = {
                                banner: 'ca-app-pub-6629294346381579/2524140033', // or DFP format "/6253334/dfp_example_ad"
                                interstitial: 'ca-app-pub-6629294346381579/4955099624'
                            };
                        } else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
                            admobid = {
                                banner: 'ca-app-pub-6629294346381579/4622366632', // or DFP format "/6253334/dfp_example_ad"
                                interstitial: 'ca-app-pub-6629294346381579/4955099624'
                            };
                        } else { // for windows phone
                            admobid = {
                                banner: 'ca-app-pub-xxx/zzz', // or DFP format "/6253334/dfp_example_ad"
                                interstitial: 'ca-app-pub-xxx/kkk'
                            };
                        }///
                        // AdMob.prepareInterstitial({ adId: admobid.interstitial, autoShow: false });
                        AdMob.createBanner({
                            adId: admobid.banner,
                            position: AdMob.AD_POSITION.TOP_CENTER,
                            autoShow: true,
                            isTesting: true
                        }, function (s) {
                        },
                            function (e) {

                            });


                    }
                }, 1000);
                if (Admob) {
                    alert(Admob)
                    Admob.setOptions({ isTesting: true },
                        (s) => { console.log(s), alert("option is set") },
                        (e) => { console.log(e), alert("option NOTSET") })

                    // it will display smart banner at top center, using the default options
                    if (AdMob) AdMob.createBanner({
                        adId: "ca-app-pub-6629294346381579/2524140033",
                        position: AdMob.AD_POSITION.TOP_CENTER,
                        isTesting: true,
                        autoShow: true
                    });

                    // use reward video
                    Admob.prepareRewardVideoAd(({ adId: "ca-app-pub-6629294346381579/5323647476", isTesting: true, autoShow: true }), function (s) {
                        console.log(s), alert(JSON.stringify(s))
                    }, function (e) {
                        console.log(e)
                    });
                    // Admob.showRewardVideoAd();
                }
            }
        })
        app.config(function ($stateProvider, $urlRouterProvider) {
            var homeState = {
                name: "home",
                url: "/home",
                templateUrl: "Templates/Home.html",
                controller: "MainController"
            };

            $stateProvider.state(homeState)
            $urlRouterProvider.otherwise("/home");
        })


        window.screen.orientation.lock('landscape');
        $(document).ready(function () {
            if (navigator.language.indexOf("tr") != -1) {
                document.body.classList.add("splashTr");
            }
            else {
                document.body.classList.add("splashEn");
            }
            setTimeout(function () {
                if (navigator.language.indexOf("tr") != -1) {
                    document.body.classList.remove("splashTr");
                }
                else {
                    document.body.classList.remove("splashEn");
                }


                angular.bootstrap(document.getElementById('body'), ['SarlatanApp']);
                document.addEventListener('onAdFailLoad', function (e) {
                    alert("ad not loaded ", JSON.stringify(e));
                });
            }, 1500);
        });

        setTimeout(() => {
            console.clear()
        }, 2000);

        window.addEventListener("orientationchange", function () {
            console.log(screen.orientation.type); // e.g. portrait
        });
        //device ready ends
    }

};

app.initialize();