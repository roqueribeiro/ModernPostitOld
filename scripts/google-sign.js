var gapi;
var auth2;
var googleUser = {};
var gapiAuthUser = function () {
    gapi.load("auth2", function () {

        auth2 = gapi.auth2.init({
            client_id: "642143382565-j6b4pmt6l2btqogs74g3o3ga9k28jbk4.apps.googleusercontent.com",
            cookiepolicy: "single_host_origin"
        });

        auth2.isSignedIn.listen(function (signState) {
            if (!signState) {
                $("nav a[data-action=postit-account]").parent().hide();
                $("nav a[data-action=postit-signingoogle]").parent().fadeIn("slow");
            } else {
                $("nav a[data-action=postit-account]").parent().fadeIn("slow");
                $("nav a[data-action=postit-signingoogle]").parent().hide();
            }
        });

        auth2.currentUser.listen(function (googleUser) {
            if (googleUser.getBasicProfile())
                gapiUserProfile(googleUser.getBasicProfile());
        });

        if (auth2.isSignedIn.get() != true) {
            $("nav a[data-action=postit-account]").parent().hide();
            $("nav a[data-action=postit-signingoogle]").parent().fadeIn("slow");
            auth2.attachClickHandler(document.getElementById("signinGoogle"), {}, function (googleUser) {
                if (googleUser.getBasicProfile()) {
                    gapiUserProfile(googleUser.getBasicProfile());
                    $(".notification").jnotifyAddMessage({
                        text: "Conta Google conectada com sucesso!",
                        type: "success",
                        permanent: false
                    });
                }
            }, function (error) {
                //alert(JSON.stringify(error, undefined, 2));
                if (error.error != "popup_closed_by_user") {
                    console.log(error);
                    $.swOpenDynamicModal({
                        title: "Ocorreu um problema...",
                        content: "Erro ao se comunicar com a sua conta Google! Tente novamente.",
                        buttons: {
                            cancel: {
                                btntext: "Fechar",
                                btnclass: "btn-link",
                                callback: function (element) {
                                    $.swOpenDynamicModal({
                                        closeid: $(element).data("id")
                                    });
                                }
                            }
                        }
                    });
                }
            });
        }
    });
};

var gapiUserProfile = function (profile) {
    $("body").data("userprofile", {
        "userid": profile.getId(),
        "username": profile.getName(),
        "usergivenname": profile.getGivenName(),
        "userfamilyname": profile.getFamilyName(),
        "userphoto": profile.getImageUrl(),
        "useremail": profile.getEmail()
    });
    if ($("._area ._postit").length == 0) restoreDatabaseFromServer();
}

var gapiLogout = function () {
    $.swOpenDynamicModal({
        title: "Desconectar?",
        content: "Você deseja desvincular sua conta Google?",
        buttons: {
            cancel: {
                btntext: "Não",
                btnclass: "btn-link",
                callback: function (element) {
                    $.swOpenDynamicModal({
                        closeid: $(element).data("id")
                    });
                }
            },
            confirm: {
                btntext: "Sim",
                btnclass: "btn-link",
                callback: function (element) {
                    $.swOpenDynamicModal({
                        closeid: $(element).data("id")
                    });
                    $.swOpenDynamicModal({
                        closeid: $(".modal").attr("id")
                    });
                    gapi.auth2.getAuthInstance().disconnect();
                    $(".notification").jnotifyAddMessage({
                        text: "Conta desconectada com sucesso! Seus dados não serão mais sincronizados com o servidor.",
                        type: "success",
                        permanent: false
                    });
                }
            }
        }
    });
}