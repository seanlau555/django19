let Delta = Quill.import('delta');
let Inline = Quill.import('blots/inline');
let Block = Quill.import('blots/block');
let BlockEmbed = Quill.import('blots/block/embed');
let Parchment = Quill.import('parchment');

class DividerBlot extends BlockEmbed { }
DividerBlot.blotName = 'divider';
DividerBlot.tagName = 'hr';

class ImageBlot extends BlockEmbed {
    static create(value) {
        let node = super.create();
        node.innerHTML = "<img class='image' src='"+value.url+"' alt='"+value.alt+"'><br><input class='"+value.url+"' type='text' placeholder='Caption (optional)' value='"+value.text+"' style='text-align: center; border-style: none; color: #bbbbbb; font-style: italic;'><br>";
        return node;
    }

    static value(node) {
        if (node.querySelector(".image")){
            return {
                alt: "VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEaLtcApTiOn",
                url: node.querySelector(".image").getAttribute('src'),
                text: "VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEcApTiOn"
            };
        }else{
            return {
                alt: "VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEaLtcApTiOn",
                url: "",
                text: "VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEcApTiOn"
            };
        }
    }
}
ImageBlot.blotName = 'imagewithcaption';
ImageBlot.tagName = 'div';

class ProgressBlot extends BlockEmbed {
    static create(value) {
        let node = super.create();
        node.setAttribute('id', value.id);
        node.innerHTML = value.name + "<br/>" + "<div class=\"progress\">" + "<div class=\"progress-bar progress-bar-striped active\" role=\"progressbar\" style='width:" + value.progress + "%' aria-valuenow='" + value.progress + "' aria-valuemin=\"0\" aria-valuemax=\"100\"></div></div>";
        return node;
    }
}
ProgressBlot.blotName = 'progress';
ProgressBlot.tagName = 'div';

class YTVideoBlot extends BlockEmbed {
    static create(url) {
    let node = super.create();
    node.setAttribute('src', url);
    node.setAttribute('frameborder', '0');
    node.setAttribute('allowfullscreen', true);
    return node;
    }

    static formats(node) {
        let format = {};
        if (node.hasAttribute('height')) {
            format.height = node.getAttribute('height');
        }
        if (node.hasAttribute('width')) {
            format.width = node.getAttribute('width');
        }
        return format;
    }

    static value(node) {
        return node.getAttribute('src');
    }

    format(name, value) {
        if (name === 'height' || name === 'width') {
            if (value) {
                this.domNode.setAttribute(name, value);
            } else {
                this.domNode.removeAttribute(name, value);
            }
        } else {
            super.format(name, value);
        }
    }
}
YTVideoBlot.blotName = 'ytvideo';
YTVideoBlot.tagName = 'iframe';

class VideoBlot extends BlockEmbed {
    static create(value) {
        let node = super.create();
        node.innerHTML = "<video class='video' preload='auto' autoplay='autoplay' loop='loop' muted='muted' src='"+value.url+"'></video><br><input class='"+value.url+"' type='text' placeholder='Caption (optional)' value='"+value.text+"' style='text-align: center; border-style: none; color: #bbbbbb; font-style: italic;'><br>";
        return node;
    }

    static value(node) {
        if (node.querySelector(".video")){
            return {
                url: node.querySelector(".video").getAttribute('src'),
                text: "VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEvIdeOcApTiOn"
            };
        }else{
            return {
                url: "",
                text: "VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEvIdeOcApTiOn"
            };
        }
    }
}
VideoBlot.blotName = 'videowithcaption';
VideoBlot.tagName = 'div';

Quill.register(ImageBlot);
Quill.register(YTVideoBlot);
Quill.register(VideoBlot);
Quill.register(DividerBlot);
Quill.register(ProgressBlot);

let quill = new Quill('#bio-container', {
    modules: {
        clipboard: {
            matchers: [
                ['div', function(node, delta) {
                    divcontent = new Delta();
                    for (i = 0; i < node.children.length; i++){
                        if (node.children[i].tagName == "IMG"){
                            img = node.children[i];
                            divcontent.insert({imagewithcaption: {alt: img.alt, url: img.src, text: img.alt}}, {"align": "center"});
                        }else if (node.children[i].tagName == "VIDEO"){
                            video = node.children[i];
                            divcontent.insert({videowithcaption: {url: video.src, text: ""}}, {"align": "center"});
                        }else{
                            if (node.children[i].querySelectorAll("img").length != 0){
                                for (j = 0; j < node.children[i].querySelectorAll("img").length; j++){
                                    img = node.children[i].querySelectorAll("img")[j];
                                    divcontent.insert({imagewithcaption: {alt: img.alt, url: img.src, text: img.alt}}, {"align": "center"});
                                }
                            }
                            if (node.children[i].querySelectorAll("video").length != 0){
                                for (j = 0; j < node.children[i].querySelectorAll("video").length; j++){
                                    video = node.children[i].querySelectorAll("video")[j];
                                    divcontent.insert({videowithcaption: {url: video.src, text: ""}}, {"align": "center"});
                                }
                            }
                            if (node.children[i].textContent){
                                divcontent.insert(node.children[i].textContent).insert("\n");
                            }
                        }
                    }
                    return divcontent;
                }],
                ['img', function(node, delta) {
                    // var url = node.src;
                    // var xhr = new XMLHttpRequest();
                    // xhr.open('GET', url, true);
                    // xhr.onload = function(e) {
                    //     if (this.status == 200) {
                    //         var imgFile = this.response;
                    //         imgFile.lastModifiedDate = new Date();
                    //         imgFile.name = (node.alt) ? node.alt : "copiedImg";
                    //         console.log(imgFile);
                    //         copyalt = (node.alt) ? node.alt : "";
                    //         uploadFile(imgFile, "post");
                    //     }
                    // };
                    // xhr.send();

                    if (node.src){
                        if (node.alt){
                            alttext = node.alt;
                        }else{
                            alttext = "";
                        }
                        return new Delta().insert({imagewithcaption: {alt: node.alt, url: node.src, text: node.alt}}, {"align": "center"});
                    }
                    return new Delta();
                }],
            ]
        },
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
        ]
    },
    scrollingContainer: '#scrolling-container',
    placeholder: 'Insert text here',
    theme: 'bubble'
});

setInterval(function(){
    jscontent = quill.getContents();
    strcontent = JSON.stringify(jscontent.ops);
	$("#id_bio").val(strcontent);
}, 100);

window.onload = function() {
	$("input").addClass("form-control");

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
    document.querySelector('#file').classList.remove("form-control");
    document.querySelector('#btnZoomIn').classList.remove("form-control");
    document.querySelector('#btnZoomOut').classList.remove("form-control");

    document.querySelector('#file').addEventListener('change', function(){
        var reader = new FileReader();
        reader.onload = function(e) {
            options.imgSrc = e.target.result;
            cropper = new cropbox(options);
        }
        reader.readAsDataURL(this.files[0]);
        this.files = [];
    })
    document.querySelector('#submit').addEventListener('click', function(){
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
            $("#id_avatar").val(imgurl);
            $("#register").submit();
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
})

function stopWheel(e){
    if(!e){ e = window.event; } /* IE7, IE8, Chrome, Safari */
    if(e.preventDefault) { e.preventDefault(); } /* Chrome, Safari, Firefox */
    e.returnValue = false; /* IE7, IE8 */
}