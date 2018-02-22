function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

if(IsJsonString($("#bio-text").html())){
    quill.setContents(JSON.parse($("#bio-text").html()));
}

window.onload = function() {
    // setup session cookie data. This is Django-related
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    // end session cookie data setup.

    var options =
    {
        imageBox: '.imageBox',
        thumbBox: '.thumbBox',
        spinner: '.spinner',
        imgSrc: 'avatar.png'
    }
    var cropper;

    document.querySelector('#file').addEventListener('change', function(){
        var reader = new FileReader();
        reader.onload = function(e) {
            options.imgSrc = e.target.result;
            cropper = new cropbox(options);
        }
        reader.readAsDataURL(this.files[0]);
        this.files = [];
    })
    document.querySelector('#crop').addEventListener('click', function(){
        $("#loadingModal").modal({backdrop: "static"});
        var avatar = cropper.getBlob();
        avatar.name = document.getElementById("file").files[0].name
        avatar.lastModifiedDate = new Date();
        uploadFile(avatar);
    })
    document.querySelector('#btnZoomIn').addEventListener('click', function(){
        cropper.zoomIn();
    })
    document.querySelector('#btnZoomOut').addEventListener('click', function(){
        cropper.zoomOut();
    })
};

$("#first").blur(function() {
    $("#fname").val($("#first").html());
})
$("#last").blur(function() {
    $("#lname").val($("#last").html());
})
$("#email-display").blur(function() {
    $("#email").val($("#email-display").html());
})


function constructFormPolicyData(policyData, fileItem) {
    var contentType = fileItem.type != '' ? fileItem.type : 'application/octet-stream'
    var url = policyData.url
    var filename = policyData.filename
    var repsonseUser = policyData.user
    // var keyPath = 'www/' + repsonseUser + '/' + filename
    var keyPath = policyData.file_bucket_path
    var fd = new FormData()
    fd.append('key', keyPath + filename);
    fd.append('acl','private');
    fd.append('Content-Type', contentType);
    fd.append("AWSAccessKeyId", policyData.key)
    fd.append('Policy', policyData.policy);
    fd.append('filename', filename);
    fd.append('Signature', policyData.signature);
    fd.append('file', fileItem);
    return fd
}

function fileUploadComplete(fileItem, policyData){
    filedata = {
        uploaded: true,
        fileSize: fileItem.size,
        file: policyData.file_id,
    }
    $.ajax({
        method:"POST",
        data: filedata,
        url: "/api/files/complete/",
        success: function(successdata){
            imgurl = policyData.url + policyData.file_bucket_path + policyData.filename;
            $("#avatar").attr("src", imgurl);
            $("#myModal").modal("hide");
        },
        error: function(jqXHR, textStatus, errorThrown){ 
        	console.log(errorThrown);
            alert("An error occured, please refresh the page.")
        }
    })
}

function uploadFile(fileItem){
        var policyData;
        var newLoadingItem;
        // get AWS upload policy for each file uploaded through the POST method
        // Remember we're creating an instance in the backend so using POST is
        // needed.
        $.ajax({
            method:"POST",
            data: {
                filename: fileItem.name
            },
            url: "/api/files/avatar/",
            success: function(data){
                policyData = data
            },
            error: function(data){
            	console.log(data)
                alert("An error occured, please try again later")
            }
        }).done(function(){
            // construct the needed data using the policy for AWS
            var fd = constructFormPolicyData(policyData, fileItem)

            // use XML http Request to Send to AWS. 
            var xhr = new XMLHttpRequest()

            // construct callback for when uploading starts
            xhr.upload.onloadstart = function(event){
                fileItem.xhr = xhr
                // $('.modal-header').html('Image Loading...');
                // if (type == "post"){
                //     $(".modal").modal("show");
                // }
                // fileItem.id = imgOrder;
            }

            xhr.upload.addEventListener("load", function(event){
                // handle FileItem Upload being complete.
                fileUploadComplete(fileItem, policyData);
            })
            xhr.open('POST', policyData.url , true);
            xhr.send(fd);
        })
};

$(document).ready(function(){
    // setup session cookie data. This is Django-related
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    // end session cookie data setup.

    $("#first").html($("#fname").val());
    $("#last").html($("#lname").val());
    $("#email-display").html($("#email").val());
});

$(".imageBox").mouseenter(function(){
    document.onmousewheel = function(){ stopWheel(); } /* IE7, IE8 */
    if(document.addEventListener){ /* Chrome, Safari, Firefox */
        document.addEventListener('DOMMouseScroll', stopWheel, false);
    }
}).mouseleave(function(){
    document.onmousewheel = null;  /* IE7, IE8 */
    if(document.addEventListener){ /* Chrome, Safari, Firefox */
        document.removeEventListener('DOMMouseScroll', stopWheel, false);
    }
});

function stopWheel(e){
    if(!e){ e = window.event; } /* IE7, IE8, Chrome, Safari */
    if(e.preventDefault) { e.preventDefault(); } /* Chrome, Safari, Firefox */
    e.returnValue = false; /* IE7, IE8 */
}

setInterval(function(){
    jscontent = quill.getContents();
    strcontent = JSON.stringify(jscontent.ops);
    $("#id_bio").val(strcontent);
}, 100);

$("#save").click(function(){
    console.log(profileid);
    const userdata = new FormData();
    const profiledata = new FormData();

    userdata.set("first_name", $("#fname").val());
    userdata.set("last_name", $("#lname").val());
    userdata.set("email", $("#email").val());

    jscontent = quill.getContents();
    strcontent = JSON.stringify(jscontent.ops);

    profiledata.set("bio", strcontent);
    profiledata.set("avatar", $("#avatar").attr("src"));

    $.ajax({
        url: '/api/accounts/'+profileid+'/profile/',
        processData: false,
        method: 'PUT',
        dataType: "json",
        contentType: false,
        data: profiledata,
        success: function(t) {
            console.log(t);
            $.ajax({
                url: '/api/accounts/'+userid+'/user/',
                processData: false,
                method: 'PUT',
                dataType: "json",
                contentType: false,
                data: userdata,
                success: function(t) {
                    location.reload();
                },error: function(t) {
                    console.log(t);
                }
            });
        },error: function(t) {
            console.log(t);
        }
    });
});

$("#fname").change(function() {
    console.log($("#fname").innerWidth());
})