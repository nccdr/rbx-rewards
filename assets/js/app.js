$("#join-group-button").click(function() {
    $(this).remove();
    $("#join-group-div").html('<a href="/offers"><button type="button" class="btn btn-inverse btn-bordered waves-effect w-md waves-light m-b-5"><i class="fa fa-check"></i> Done</button></a>')
});

$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});


var notifs = {};
var types = {
    "reward": {
        icon: "fa fa-smile-o",
        bg: "bg-success"
    },
    "withdraw": {
        icon: "fa fa-send-o",
        bg: "bg-info"
    },
    "site": {
        icon: "mdi mdi-information-outline",
        bg: "bg-warning"
    }
};

function notification(type, message, time, id, from_obj, animate) {
    from_obj = from_obj || false;
    animate = animate || true;

    $notifc = $(".notif-count");
    if(!from_obj) {
        if($notifc.html() == "") {
            $notifc.html("1");
            $(".notif-count-icon").show();
            $(".notifs-list").show();
        } else {
            $notifc.html(parseInt($notifc.html()) + 1);
        }
    }

    if($(".notifs-list-ul").children().length - 2 >= 3) {
            return notifs[id] = {type: type, message: message, created: time, id: id};
            
    } 

    $notif = $("#notif-template").clone();
    $notif.attr("id", "notif-block");
    $notif.attr("data-notif-id", id);
    $notif.find(".icon-bg").addClass(types[type].bg);
    $notif.find("#notif-icon").attr("class", types[type].icon);
    $notif.find(".name").html(message);
    $notif.find(".time").html(time);
    $notif.insertAfter(".notifs-title");
    $notif.show();  
    animate ? $(".notifs-list").animateCss("bounce") : null;
}

io.socket.on("connect", function() {
    io.socket.get("/notifications/subscribe", function(data) {
        if(data.length > 0) {
            for(var i = 0; i < data.length; i++) {
                notification(data[i].type, data[i].message, data[i].created, data[i].id);
            }
        }

    
        io.socket.on("nNotification", function(data) {
            notification(data.type, data.message, data.created, data.id);
        });
    });

    io.socket.get("/user/balance", function() {
        io.socket.on("balance", function(data) {
            $(".user-balance").html(data.balance);
            $(".user-balance").counterUp();
        });
    })
});

io.socket.on("reconnect", function() {
    location.reload();
});

$(document).on("click", "#notif-block", function() {
    var id = $(this).data("notif-id");
    $(this).remove();

    $notifc = $(".notif-count");
    if($notifc.html() == "1") {
        $notifc.html("");
        $(".notif-count-icon").hide();
        $(".notifs-list").hide();
    } else {
        $notifc.html(parseInt($notifc.html()) - 1);
        if(Object.keys(notifs).length > 0) {
            var keys = Object.keys(notifs);
            var new_notif = notifs[keys[keys.length-1]];
            notification(new_notif.type, new_notif.message, new_notif.created, new_notif.id, true, false);
            delete notifs[new_notif.id];
        }
    }

    io.socket.get("/notifications/remove", {id: $(this).data("notif-id")});
});

$(".btn-withdraw").click(function() {
    var amt = $(this).data("withdraw-amt");
    if($(this).hasClass("disabled")) return;
     swal({
        title: "Are you sure?", 
        text: "Are you sure that you want to withdraw "+amt+" robux? This will cost "+amt*10+" gems", 
        type: "warning",
        showCancelButton: true,
        closeOnConfirm: false,
        confirmButtonText: "Confirm",
        confirmButtonColor: "#4bd396"
     }, function() {
         io.socket.get("/redeem/new", {amt: amt}, function(res) {
             if(res.error == null) {
                swal("Success!", "Your Robux was credited to your Roblox account!", "success");
             } else {
               swal("Error!", res.error, "error");  
             }
         });

     });
});

$('.counter').counterUp();