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
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);
        document.addEventListener("menubutton", onMenuKeyDown, false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {

        var app = angular.module("SarlatanApp", ["ui.router", "hmTouchEvents", "ngSanitize", "ngMaterial", "LocalStorageModule"]);
        // "hmTouchEvents", "ngSanitize", "ngMaterial", "LocalStorageModule", 

        app.controller("MainController", function ($scope, $state, $timeout, $transitions, localStorageService) {
            $scope.Greeting = "Merhaba Sayın Üye :)";
            $scope.los = localStorageService;
            $scope.state = $state;
            localStorage.setItem("sarlatan.paused", false)
            $scope.fib = {};
            $scope.fib.auth = firebase.auth();
            $scope.fib.db = firebase.database();
            $scope.InvitesRef = $scope.fib.db.ref("Invites");
            $scope.MessagesRef = $scope.fib.db.ref("Messaages");
            $scope.GamesRef = $scope.fib.db.ref("Games");
            $scope.ToastManager = window.plugins.toast;
            $scope.StartSoundTimeouts = [];
            $scope.Game = { On: false, TimeSpent: 0, Level: 1, Versus: 0 };

            $scope.Settings = { Sound: { Mute: false }, Invites: [] }
            var coin1 = parseInt(Math.random() * 1000 + 1)
            var coin2 = parseInt(Math.random() * 1000 + 1)
            $scope.Game.Player1 = { Coin: "", Result: "" };
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
                document.body.append(sound)
                return sound;
            }
            $scope.Sound.Collect = $scope.createSound(cordova.file.applicationDirectory + "www/audio/collect.wav");
            $scope.Sound.GameSound = $scope.createSound(cordova.file.applicationDirectory + "www/audio/Inescapable.mp3");
            $scope.Sound.GameSound.addEventListener('ended', function () {
                this.currentTime = 0;
                this.play();
                $scope.$apply()
            }, false);
            $scope.Sound.WinGame = $scope.createSound(cordova.file.applicationDirectory + "www/audio/win.wav")
            $scope.Sound.LoseGame = $scope.createSound(cordova.file.applicationDirectory + "www/audio/gameover.mp3")
            $scope.Emojis = ["<span>&#128512;</span>", "<span>&#128557;</span>", "<span>&#128544;</span>"];

            $scope.onHammer = function (e) {
                // if (e.isFinal == false)
                //     return

                if ($scope.GameVersus != null) {
                    if ($scope.GameVersus.Turn == 1 && $scope.los.get("User").uid != $scope.GameVersus.Player1.Uid)
                        return;
                    if ($scope.GameVersus.Turn == 2 && $scope.los.get("User").uid != $scope.GameVersus.Player2.Uid)
                        return;
                }
                if ($scope.GameVersus == null && ($scope.Game.Player1.Result != "" || $scope.Game.Player2.Result != "" || $scope.Game.Turn == 2))
                    return;
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
                    var coin1 = parseInt(Math.random() * 1000 + 1);
                    var coin2 = parseInt(Math.random() * 1000 + 1);
                    $scope.determinateValue = 0;
                    $scope.ChallengeCoin = 0;
                    angular.element(document.getElementsByClassName("ChallengeIcon")[0]).css("left", "0px")
                    if ($scope.Game.Player1.Win) {
                        coin1 = $scope.Game.Player1.Coin;
                        $scope.Game.Level += 1;
                        angular.element(document.getElementsByClassName("level")[0]).addClass("animated flash")
                        setTimeout(() => {
                            angular.element(document.getElementsByClassName("level")[0]).removeClass("animated flash")
                            $scope.$apply();
                        }, 300);
                        if (moment().valueOf() % 5 == 0)
                            coin2 = parseInt(Math.random() * 10 * coin1 + 1);
                        else
                            coin2 = parseInt(Math.random() * 4 * coin1 + 1);
                        $scope.Game = { On: true, TimeSpent: $scope.Game.TimeSpent, Level: $scope.Game.Level, Settings: angular.copy($scope.Settings.Sound) };
                    }
                    else
                        $scope.Game = { On: true, TimeSpent: $scope.Game.TimeSpent, Level: 1, Settings: angular.copy($scope.Settings.Sound) };

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
                            $scope.Game.Player1.Result = "";
                            $scope.Game.Player2.Result = "";
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
                        $scope.Game.Player2.Coin = $scope.Game.Player2.Coin - $scope.ChallengeCoin;
                        $scope.Game.Player1.Coin = $scope.Game.Player1.Coin + $scope.ChallengeCoin
                        $scope.fib.db.ref("Users").child($scope.los.get("User").uid).update({ Coins: $scope.Game.Player1.Coin }).then(function () {
                            setTimeout(() => {
                                $scope.$apply()
                            }, 100);
                        })
                        navigator.vibrate([100, 200, 300, 400])
                        if ($scope.Settings.Sound.Mute == false)
                            $scope.Sound.WinGame.play()
                        angular.element(document.getElementById("winner")).addClass("flash animated");
                        $scope.$apply()
                    }
                    else {
                        $scope.Game.Player2.Coin = $scope.Game.Player2.Coin - $scope.ChallengeCoin;
                        $scope.Game.Player1.Coin = $scope.Game.Player1.Coin + $scope.ChallengeCoin
                        $scope.fib.db.ref("Users").child($scope.los.get("User").uid).update({ Coins: $scope.Game.Player1.Coin }).then(function () {
                            setTimeout(() => {
                                $scope.$apply()
                            }, 100);
                        })
                    }
                } else {
                    if ($scope.Game.Player1.Coin - $scope.ChallengeCoin <= 0) {
                        setTimeout(() => {
                            // alert("YOU Loose")
                            $scope.Game.Player1.Lose = true;
                            $scope.Game.Player1.Coin = $scope.Game.Player1.Coin - $scope.ChallengeCoin;
                            if ($scope.Game.Player1.Coin < 0)
                                $scope.Game.Player1.Coin = 0;
                            $scope.Game.Player2.Coin = $scope.Game.Player2.Coin + $scope.ChallengeCoin;
                            $scope.fib.db.ref("Users").child($scope.los.get("User").uid).update({ Coins: 0 }).then(function () {
                                setTimeout(() => {
                                    $scope.$apply()
                                }, 100);
                            })

                            navigator.vibrate([100, 200, 300, 400, 500])
                            if ($scope.Settings.Sound.Mute == false)
                                $scope.Sound.LoseGame.play()
                            $scope.Sound.GameSound.pause()
                            angular.element(document.getElementById("loser")).addClass("rotateInDownRight animated");
                            $scope.$apply()
                        }, 500);
                    }
                    else {
                        $scope.Game.Player1.Coin = $scope.Game.Player1.Coin - $scope.ChallengeCoin;
                        $scope.Game.Player2.Coin = $scope.Game.Player2.Coin + $scope.ChallengeCoin;
                        $scope.fib.db.ref("Users").child($scope.los.get("User").uid).update({ Coins: $scope.Game.Player1.Coin }).then(function () {
                            setTimeout(() => {
                                $scope.$apply()
                            }, 100);
                        })
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
            $scope.StartSound = function () {
                if ($scope.Settings.Sound.Mute == true)
                    return
                var t1 = setTimeout(() => {
                    $scope.Sound.GameSound.volume = 0.1;
                    var t2 = setTimeout(() => {
                        $scope.Sound.GameSound.volume = 0.2;
                        var t3 = setTimeout(() => {
                            $scope.Sound.GameSound.volume = 0.3;
                            var t4 = setTimeout(() => {
                                $scope.Sound.GameSound.volume = 0.4;
                                var t5 = setTimeout(() => {
                                    $scope.Sound.GameSound.volume = 0.5;
                                    var t6 = setTimeout(() => {
                                        $scope.Sound.GameSound.volume = 0.6;
                                        var t7 = setTimeout(() => {
                                            $scope.Sound.GameSound.volume = 0.7;
                                            var t8 = setTimeout(() => {
                                                $scope.Sound.GameSound.volume = 0.8;
                                                var t9 = setTimeout(() => {
                                                    $scope.Sound.GameSound.volume = 0.9;
                                                    var t10 = setTimeout(() => {
                                                        $scope.Sound.GameSound.volume = 1;
                                                    }, 4000);
                                                    $scope.StartSoundTimeouts.push(t10);
                                                }, 4000);
                                                $scope.StartSoundTimeouts.push(t9);
                                            }, 4000);
                                            $scope.StartSoundTimeouts.push(t8);
                                        }, 4000);
                                        $scope.StartSoundTimeouts.push(t7);
                                    }, 4000);
                                    $scope.StartSoundTimeouts.push(t6);
                                }, 4000);
                                $scope.StartSoundTimeouts.push(t5);
                            }, 4000);
                            $scope.StartSoundTimeouts.push(t4);
                        }, 4000);
                        $scope.StartSoundTimeouts.push(t3);
                    }, 4000);
                    $scope.StartSoundTimeouts.push(t2);
                }, 4000);
                $scope.StartSoundTimeouts.push(t1);

            }
            $scope.StartGame = function () {
                if ($scope.intervalId == null) {
                    $scope.intervalId = setInterval(() => {
                        $scope.Game.TimeSpent = $scope.Game.TimeSpent + 100;
                        if ($scope.Game.TimeSpent % 10000 == 0) {
                            if ($scope.Game.Player1.Lose == true)
                                return
                            var bonus = parseInt($scope.Game.TimeSpent / 10000);
                            $scope.Game.Player1.Coin = $scope.Game.Player1.Coin + bonus * 100;
                            angular.element(document.getElementsByClassName("timer")[0]).addClass("animated flash")
                            setTimeout(() => {
                                angular.element(document.getElementsByClassName("timer")[0]).removeClass("animated flash")
                                $scope.$apply();
                            }, 300);
                        }
                        $scope.$apply();
                    }, 100);
                }
                $scope.StartSoundTimeouts.forEach(element => {
                    clearTimeout(element)
                });
                if ($scope.Game.Player1.Coin == 0) {
                    $scope.Game.Player1.Coin = parseInt(Math.random() * 1000 + 1)
                    $scope.fib.db.ref("Users").child($scope.los.get("User").uid).update({ Coins: $scope.Game.Player1.Coin }).then(function () {
                        setTimeout(() => {
                            $scope.$apply()
                        }, 100);
                    })
                }
                $scope.StartSound()
                setTimeout(() => {
                    $scope.Sound.GameSound.volume = 0;
                    $scope.Sound.GameSound.volume.loop = true
                    $scope.Sound.GameSound.play()
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
            $scope.ToInvite = function (invite) {
                $scope.state.go('Invites', { inviter: JSON.stringify(invite) });
            }
            $scope.DismissInvite = function (op) {
                angular.element(document.getElementsByClassName("WarAlertBox")[0]).addClass("animated bounceOutDown")
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
                var percentage = nv != "" ? Math.ceil(100 * parseInt(nv) / 380) : 0
                $scope.determinateValue = percentage
                console.log($scope.determinateValue, "Percentage");
                if ($scope.GameVersus == null) {
                    if ($scope.Game.Turn == 1) {
                        $scope.ChallengeCoin = Math.ceil(percentage * $scope.Game.Player1.Coin / 100)
                        console.log($scope.ChallengeCoin)
                    }
                    else {
                        $scope.ChallengeCoin = Math.ceil(percentage * $scope.Game.Player2.Coin / 100)
                        console.log($scope.ChallengeCoin)
                    }
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

            $scope.fib.auth.onAuthStateChanged(function (user) {
                if (user) {
                    // User is signed in.
                    $scope.los.set("User", user)
                    $scope.fib.db.ref("Users").child(user.uid).update(
                        {
                            Uid: user.uid,
                            Status: 1,
                            Uuid: device.uuid,
                            Serial: device.serial,
                            Manufacturer: device.manufacturer,
                            Email: user.email
                        }
                    )
                    $scope.fib.db.ref("Users").child($scope.los.get("User").uid).on("value", function (snapshot) {
                        if (snapshot.val().Coins != null && snapshot.val().Coins >= 0) {
                            $scope.Game.Player1.Coin = snapshot.val().Coins;
                        }
                        else {
                            $scope.Game.Player1.Coin = coin1
                            $scope.fib.db.ref("Users").child($scope.los.get("User").uid).update({ Coins: $scope.Game.Player1.Coin }).then(function () {
                                setTimeout(() => {
                                    $scope.$apply()
                                }, 100);
                            })
                        }
                        setTimeout(() => {
                            $scope.$apply()
                        }, 100);
                    })
                    $scope.Settings.SoundRef = $scope.fib.db.ref("Settings").child($scope.los.get("User").uid);
                    $scope.Settings.SoundRef.once("value").then(function (snapshot) {
                        if (snapshot.hasChildren() == false) {
                            $scope.Settings.Sound = { Mute: false, ComputerLevel: 1 }
                            $scope.Settings.SoundRef.set($scope.Settings.Sound)
                        }
                        else
                            $scope.Settings.Sound = snapshot.val()

                        setTimeout(() => {
                            $scope.$apply()
                        }, 100);
                    })
                    $scope.InvitesRef.orderByChild("GuestUid").equalTo($scope.los.get("User").uid).on("value", function (snapshot) {
                        $scope.Settings.Invites = []
                        snapshot.forEach(function (val) {
                            if (moment.duration(moment().diff(val.val().InviteDate)).asMinutes() < 5) {
                                $scope.Settings.Invites.push(val.val())
                                $scope.Game.Invited = false;
                            }


                        })

                        if ($scope.Settings.Invites.length == 1) {
                            $scope.Game.Invited = true;
                            angular.element(document.getElementsByClassName("WarAlertBox")[0]).addClass("animated bounceInDown")
                        }

                        setTimeout(() => {
                            $scope.$apply()
                        }, 100);
                    })
                    $scope.GamesRef.orderByChild("Player2/Uid").equalTo($scope.los.get("User").uid).on("value", function (snapshot) {
                        snapshot.forEach(function (val) {
                            $scope.GameVersus = val.val()
                            if ($scope.GameVersus.Loser == "") {
                                $scope.GameVersusKey = val.key;

                                setTimeout(() => {
                                    $scope.$apply();
                                    $scope.state.go("Versus")

                                }, 100);
                            }
                        })
                    })
                    $scope.GamesRef.orderByChild("Player1/Uid").equalTo($scope.los.get("User").uid).on("value", function (snapshot) {
                        snapshot.forEach(function (val) {
                            $scope.GameVersus = val.val()
                            if ($scope.GameVersus.Loser == "") {
                                $scope.GameVersusKey = val.key;

                                if ($scope.GameVersus.Turn == 2 && $scope.GameVersus.ChallengeCoin != null)
                                    $scope.ChallengeCoin = val.val().ChallengeCoin;
                                $scope.state.go("Versus")
                            }
                        })
                    })
                    $scope.state.go("Home")
                } else {
                    // No user is signed in.
                    $scope.state.go("Register")
                }
            });

            $scope.$watch("Settings.Sound.Mute", function (nv, ov) {
                if (nv == true && ov == false) {
                    for (var elem in $scope.Sound) {
                        $scope.StartSoundTimeouts.forEach(element => {
                            clearTimeout(element)
                        });
                        if ($scope.Sound[elem].volume != null)
                            $scope.Sound[elem].pause()
                    }
                }
                if (nv == false && ov == true) {
                    for (var elem in $scope.Sound) {
                        if ($scope.Sound[elem].volume != null) {
                            $scope.Sound[elem].volume = 1;
                            if (elem == "GameSound") {
                                $scope.Sound[elem].play()
                            }
                        }
                    }
                }
            })
            $transitions.onSuccess({}, function (transition) {
                console.log(
                    "Successful Transition from " + transition.from().name +
                    " to " + transition.to().name
                );
                if ($scope.los.get("User") == null) {
                    $scope.state.go("Register")
                }
            });
        })

        app.controller("SettingsController", function ($scope, $state) {

            $scope.Settings.SoundRef.once("value").then(function (snapshot) {
                if (snapshot.hasChildren() == false) {
                    $scope.Settings.Sound = { Mute: false, ComputerLevel: 1 }
                }
                $scope.Settings.Sound = snapshot.val()
                setTimeout(() => {
                    $scope.$apply()
                }, 100);
            })
            $scope.Mute = function () {
                var Settings = angular.copy($scope.Settings.Sound);
                Settings.Mute = !Settings.Mute;
                $scope.Settings.SoundRef.set(Settings).then(function () {
                    setTimeout(() => {
                        $scope.Settings.Sound = Settings
                        $scope.$apply()
                    }, 100);
                })
            }
            $scope.CL = function (i) {
                $scope.Settings.Sound.CL = i;
                $scope.Settings.SoundRef.set($scope.Settings.Sound).then(function () {
                    setTimeout(() => {
                        $scope.$apply()
                    }, 100);
                })
            }
            $scope.Logout = function () {
                firebase.auth().signOut().then(function () {
                    $scope.los.clearAll();
                    setTimeout(() => {
                        $scope.state.go("Register")
                        $scope.$apply()
                    }, 100);
                })
            }
        })

        app.controller("OpponentsController", function ($scope) {
            $scope.Battle = { ShowInvite: false };

            $scope.OpponentsRef = $scope.fib.db.ref("Users").orderByChild("Status").equalTo(1).on("value", function (snapshot) {
                $scope.Opponents = [];
                snapshot.forEach((val) => {
                    $scope.Opponents.push(val.val())
                })
                setTimeout(() => {
                    $scope.$apply()
                }, 100);
            })
            $scope.SendInvite = function (oppo) {
                $scope.InvitesRef.orderByChild("I_G").equalTo($scope.los.get("User").uid + "_" + oppo.Uid).once("value").then(function (snapshot) {
                    snapshot.forEach(function (val) {
                        $scope.InvitesRef.child(val.key).set(null)
                    })
                    var key = $scope.InvitesRef.push().key;
                    var Invite = {
                        InviterUid: $scope.los.get("User").uid, InviterEmail: $scope.los.get("User").email, InviteDate: moment().valueOf(),
                        GuestUid: oppo.Uid, GuestEmail: oppo.Email, AcceptDate: null, I_G: $scope.los.get("User").uid + "_" + oppo.Uid,
                        IsExpired: false
                    }
                    $scope.InvitesRef.child(key).set(angular.copy(Invite)).then(function () {
                        setTimeout(() => {
                            $scope.ToastManager.show("Battle Invite Sent!", "short", "center")
                            $scope.$apply()
                        }, 100);
                    });
                })

            }
        })
        app.controller("RegisterController", function ($scope, $state) {
            $scope.state = $state
            $scope.Greeting = "Selam Kayıt Ekranı";
            $scope.Register = { Login: true };
            $scope.user = {};
            $scope.RegisterView = function () {
                $scope.Register.Register = true;
                $scope.Register.Login = false;
                $scope.Register.ForgotPass = false;
            }
            $scope.LoginView = function () {
                $scope.Register.Register = false;
                $scope.Register.Login = true;
                $scope.Register.ForgotPass = false;
            }
            $scope.ForgotPasswordView = function () {
                $scope.Register.Register = false;
                $scope.Register.Login = false;
                $scope.Register.ForgotPass = true;
            }
            $scope.RegisterUser = function () {

                if ($scope.user.Email == "") {
                    alert("Email required")
                    return
                }

                if ($scope.user.Password == "") {
                    alert("Password required")
                    return
                }

                if ($scope.user.PasswordRepeat == "") {
                    alert("Password-repeat required")
                    return
                }

                if ($scope.user.Password != $scope.user.PasswordRepeat) {
                    alert("both passwords must be equal")
                    return
                }
                console.log("Kayıt oldunuz.");
                if ($scope.user.EulaAccepted == false || $scope.user.EulaAccepted == null) {
                    alert("Sözleşmeyi kabul ediniz.");
                    return
                }
                firebase
                    .auth()
                    .createUserWithEmailAndPassword(
                        $scope.user.Email,
                        $scope.user.Password
                    )
                    .catch(function (error) {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        // ...
                        $scope.UserError = errorMessage;
                    })
                    .then(function (user) {
                        if ($scope.UserError == null) {
                            console.log("Kullanıcı kaydedildi.--->", firebase.auth().currentUser.email);

                            firebase.auth().currentUser.sendEmailVerification().then(function () {
                                // Email sent.
                                alert("you registered. We sent you a confirmation email.")
                                $scope.los.set("User", firebase.auth().currentUser);
                                $scope.Settings.SoundRef = $scope.fib.db.ref("Settings").child($scope.los.get("User").uid);

                                $scope.state.go("Home")
                            }).catch(function (error) {
                                // An error happened.
                            });
                        } else {
                            alert($scope.UserError)
                            $scope.UserError = null
                        }
                    });
            };
            $scope.ResetUser = function () {
                auth.sendPasswordResetEmail($scope.user.Email).then(function () {
                    // Email sent.
                    alert("Reset email sent")
                }).catch(function (error) {
                    // An error happened.
                });
            }
            $scope.LoginUser = function () {
                var error = "";
                firebase.auth().signInWithEmailAndPassword($scope.user.Email, $scope.user.Password).catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // ...
                    error = errorMessage;
                    alert(errorMessage)
                }).then(function () {
                    if (error == "") {
                        $scope.state.go("Home")
                    }
                });
            }
        })
        app.controller("ChatsController", function ($scope) {
            $scope.MessagesRef.on("value", (snapshot) => {
                $scope.Messages = [];
                snapshot.forEach((val) => {
                    $scope.Messages.push(val.val())
                })
                setTimeout(() => {
                    $scope.$apply()
                }, 100);
            })

            $scope.fib.db.ref("Users").orderByChild("Status").equalTo(1).on("value", function (snapshot) {
                $scope.Users = [];
                snapshot.forEach((val) => {
                    $scope.Users.push(val.val())
                })
                setTimeout(() => {
                    $scope.$apply()
                }, 100);
            })

        })
        app.controller("InvitesController", function ($scope, $state, $filter) {

            $scope.InvitesRef.orderByChild("GuestUid").equalTo($scope.los.get("User").uid).on("value", function (snapshot) {
                $scope.Invites = []

                snapshot.forEach(function (val) {
                    if (moment.duration(moment().diff(val.val().InviteDate)).asMinutes() < 5) {
                        $scope.Invites.push(val.val())
                    }
                })
                setTimeout(() => {
                    $scope.$apply()
                }, 100);
            })
            $scope.AcceptInvite = function (invite) {
                $scope.Game.Versus = 1;
                $scope.Game.Player1.Name = $filter('SubToAt')(invite.InviterEmail);
                $scope.Game.Player1.Uid = invite.InviterUid;
                $scope.Game.Player2.Name = $filter('SubToAt')($scope.los.get("User").email);
                $scope.Game.Player2.Uid = $scope.los.get("User").uid;
                $scope.Game.Winner = "";
                $scope.Game.Loser = "";
                $scope.Game.StartDate = moment().valueOf();
                $scope.fib.db.ref("Users").child(invite.InviterUid).child("Coins").once("value").then((snapshot) => {
                    $scope.Game.Player1.Coin = snapshot.val();

                    var key = $scope.fib.db.ref("Games").push().key;
                    $scope.GamesRef.child(key).set($scope.Game).then(function () {
                        $scope.$apply();
                    })
                })
            }
            if ($scope.state.params.inviter) {
                $scope.Inviter = JSON.parse($state.params.inviter);
                $scope.AcceptInvite($scope.Inviter);
            }
        })

        app.controller("VersusController", function ($scope) {
            console.log("ccsx")

            $scope.$watch("GameVersus.ChallengeCoin", function (nv, ov) {
                $scope.ChallengeCoin = nv;
                console.log("cc", $scope.ChallengeCoin)
                var percentage = 0;
                if ($scope.GameVersus.Turn == 1) {
                    percentage = parseInt(100 * $scope.ChallengeCoin / $scope.GameVersus.Player1.Coin)
                }
                else {
                    percentage = parseInt(100 * $scope.ChallengeCoin / $scope.GameVersus.Player2.Coin)
                }
                var challengeCoinWidth = parseInt(380 * percentage / 100);
                angular.element(document.getElementsByClassName("ChallengeIcon")[0]).css("left", challengeCoinWidth + "px")
            })

        })

        app.config(function ($stateProvider, $urlRouterProvider, localStorageServiceProvider) {

            localStorageServiceProvider
                .setPrefix('sarlatan')
                .setNotify(true, true);
            var homeState = {
                name: "Home",
                url: "/Home",
                templateUrl: "Templates/Home.html"
            };

            var eulaState = {
                name: "Eula",
                url: '/Eula',
                templateUrl: "Templates/Eula.html",
                controller: function ($scope, $state) {
                    $scope.state = $state;
                }
            }
            var settingsState = {
                name: "Settings",
                url: '/Settings',
                templateUrl: "Templates/Settings.html",
                controller: "SettingsController"
            }
            var registerState = {
                name: "Register",
                url: "/Register",
                templateUrl: "Templates/Register.html",
                controller: "RegisterController"
            };
            var opponentsState = {
                name: "Opponents",
                url: '/Opponents',
                templateUrl: "Templates/Opponents.html",
                controller: "OpponentsController"
            }
            var chatsState = {
                name: "Chats",
                url: '/Chats',
                templateUrl: "Templates/Chats.html",
                controller: "ChatsController"
            }
            var invitesState = {
                name: "Invites",
                url: '/Invites?inviter',
                templateUrl: "Templates/Invites.html",
                controller: "InvitesController"
            }

            var versusState = {
                name: "Versus",
                url: '/Versus',
                templateUrl: "Templates/Versus.html",
                controller: "VersusController"
            }

            $stateProvider.state(homeState);

            $stateProvider.state(registerState);
            $stateProvider.state(eulaState);
            $stateProvider.state(settingsState);
            $stateProvider.state(opponentsState);
            $stateProvider.state(chatsState);
            $stateProvider.state(invitesState);
            $stateProvider.state(versusState);
            $urlRouterProvider.otherwise("/Home");
        });

        app.filter("SubToAt", function () {
            return function (val) {
                if (val != null)
                    return val.toString().substr(0, val.toString().indexOf("@"))
            }
        })

        window.screen.orientation.lock("landscape")
        angular.element(document).ready(function () {
            angular.bootstrap(document, ["SarlatanApp"]);
        });
        //device ready ends


        window.addEventListener('beforeunload', () => {

            firebase.database().ref("Users").child(JSON.parse(localStorage.getItem('sarlatan.User')).uid).update(
                { status: 0 });
            localStorage.setItem("sarlatan.paused", false);
        });
    }

};
function onPause($scope) {
    // Handle the pause event
    firebase.database().ref("Users").child(JSON.parse(localStorage.getItem('sarlatan.User')).uid).update(
        { status: 0 });
    localStorage.setItem("sarlatan.paused", true);

}
function onResume() {
    // console.log("resumed",new Date())
    // Handle the resume event
    firebase.database().ref("Users").child(JSON.parse(localStorage.getItem('sarlatan.User')).uid).update(
        { status: 1 });
    localStorage.setItem("sarlatan.paused", false);
}
function onMenuKeyDown() {
    // Handle the menubutton event
    firebase.database().ref("Users").child(JSON.parse(localStorage.getItem('sarlatan.User')).uid).update(
        { status: 0 });
    localStorage.setItem("sarlatan.paused", false);
}
app.initialize();