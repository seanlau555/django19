    $(document).ready(function(){
        //image order
        imgOrder = 0;

        //initialize err indicators
        $('.err').css('visibility', 'hidden');

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
    });

    const data = new FormData();

    var feature = document.getElementById('image');

    feature.onchange = () => {
        const file = feature.files[0];
        // file type is only image.
        if (!(/^image\//.test(file.type))) {
            feature.value = "";
            alert('You could only upload images.');
        }else{
            uploadFile(feature.files[0], "feature");
        }
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

    function fileUploadComplete(fileItem, policyData, type){
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
                data.append('image', imgurl);
                if (type == "feature"){
                    $('.featureImg').html("<img id='feature' src='" + imgurl + "' alt='featureImg' width='100%'>")
                }else if (type == "post"){
                    saveToServer(imgurl, fileItem.range);
                }
            },
            error: function(jqXHR, textStatus, errorThrown){ 
                alert("An error occured, please refresh the page.")
            }
        })
    }

    function displayProgress(fileItem){
        var progress = $('.featureImg');
        progress.html("")
        var html_ = "<div class=\"progress\">" + "<div class=\"progress-bar progress-bar-striped active\" role=\"progressbar\" style='width:" + fileItem.progress + "%' aria-valuenow='" + fileItem.progress + "' aria-valuemin=\"0\" aria-valuemax=\"100\"></div></div>"
        progress.append(fileItem.name + "<br/>" + html_ + "<hr/>")
    }

    function modalProgress(fileItem){
        // var progress = $('.modal-body');
        // progress.html("")
        // var html_ = "<div class=\"progress\">" + "<div class=\"progress-bar progress-bar-striped active\" role=\"progressbar\" style='width:" + fileItem.progress + "%' aria-valuenow='" + fileItem.progress + "' aria-valuemin=\"0\" aria-valuemax=\"100\"></div></div>"
        // progress.append(fileItem.name + "<br/>" + html_ + "<hr/>");
        var cursor = quill.getSelection().index;
        let blot = Parchment.find(document.getElementById(fileItem.id));
        if (blot){
            fileItem.range = blot.offset(quill.scroll);
        }
        quill.deleteText(fileItem.range, 1);
        quill.insertEmbed(fileItem.range, 'progress', fileItem);
        if (document.getElementById(fileItem.id).nextSibling == null){
            quill.insertEmbed(fileItem.range + 1, '\n');
        }
        quill.setSelection(fileItem.range + 1, Quill.sources.SILENT);
    }

    function uploadFile(fileItem, type){
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
                url: "/api/files/policy/",
                success: function(data){
                        policyData = data
                },
                error: function(data){
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
                    fileItem.id = imgOrder;
                    imgOrder = imgOrder + 1;
                    console.log(fileItem.id);
                    if (type == "post"){
                        fileItem.range = quill.getSelection().index;
                    }
                }

                xhr.upload.addEventListener("progress", function(event){
                    if (type == "feature"){
                        if (event.lengthComputable) {
                            var progress = Math.round(event.loaded / event.total * 100);
                            fileItem.progress = progress
                            displayProgress(fileItem)
                        }
                    }else if (type == "post"){
                        if (event.lengthComputable) {
                            var progress = Math.round(event.loaded / event.total * 100);
                            fileItem.progress = progress
                            modalProgress(fileItem)
                        }
                    }
                })

                xhr.upload.addEventListener("load", function(event){
                    // handle FileItem Upload being complete.
                    setTimeout(()=>{
                        // $(".modal").modal("hide");
                        if (type == "post"){
                            quill.deleteText(fileItem.range, 1);
                        }
                        fileUploadComplete(fileItem, policyData, type);
                    }, 500);
                })
                xhr.open('POST', policyData.url , true);
                xhr.send(fd);
            })
    };

    $('#title').blur(function (){
        if (!$('#title').val()){
            $('#titleErr').css('visibility', 'visible');
        }else{
            $('#titleErr').css('visibility', 'hidden');
        }
    });
    setInterval(function(){
        if (!$("#now").prop("checked")){
            $("#future").css('visibility', 'visible');
        }else{
            $("#future").css('visibility', 'hidden');
            $('#pubErr').css('visibility', 'hidden');
        }
    }, 100);
    $('#publish').blur(function (){
        if (!$('#publish').val()){
            $('#pubErr').css('visibility', 'visible');
        }else{
            now = new Date;
            now = now.getFullYear() + '-' + ('0' + (now.getMonth()+1)).slice(-2) + "-" + ('0' + now.getDate()).slice(-2);
            if ($('#publish').val() < now){
                $('#pubErr').css('visibility', 'visible');
            }else{
                $('#pubErr').css('visibility', 'hidden');
            }
        }
    });
    $('#image').change(function (){
        setInterval(function(){
            if ($('.featureImg').find('img').length === 0){
                $('#featureErr').css('visibility', 'visible');
            }else{
                $('#featureErr').css('visibility', 'hidden');
            }
        }, 500)
    });
    $('#image').click(function (){
        if (!$('#image').val()){
            $('#featureErr').css('visibility', 'visible');
        }else{
            $('#featureErr').css('visibility', 'hidden');
        }
    });
    quill.on('selection-change', function(range, oldRange, source) {
        if (range === null && oldRange !== null) {
            if (quill.getText().trim().length === 0){
                $('#contentErr').css('visibility', 'visible');
            }else{
                $('#contentErr').css('visibility', 'hidden');
            }
        }
    });

    $('#image-button').click(function() {
        var input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.click();

        // Listen upload local image and save to server
        input.onchange = () => {
            const file = input.files[0];

            // file type is only image.
            if (/^image\//.test(file.type)) {
                copyalt = "";
                uploadFile(file, "post");
            } else {
                console.warn('You could only upload images.');
            }
        };
    });

    /**
    * Step2. save to server
    *
    * @param {File} file
    */
    function saveToServer(url, range) {
        const fd = new FormData();
        fd.set('imageid', pid);
        fd.set('image', url);

        $.ajax({
            url: '/api/posts/image/create/',
            processData: false,
            method: 'POST',
            dataType: "json",
            contentType: false,
            data: fd
            ,success: function(t) {
                insertToEditor(t.image, range);
            },error: function(t) {
                console.log(t);
            }
        })
    }

    /**
    * Step3. insert image url to rich editor.
    *
    * @param {string} url
    */
    function insertToEditor(url, range) {
    // push image url to rich editor.
        // quill.insertEmbed(range.index,"proc-link",{text: caption});
        // quill.setSelection(range, Quill.sources.SILENT);
        if (range != 0){
            quill.insertEmbed(range, '\n');
        }
        quill.insertEmbed(range, 'imagewithcaption', {alt: copyalt, url: url, text: ""});
        quill.formatLine(range, 1, 'align', 'center');
        quill.setSelection(range + 2, Quill.sources.SILENT);
        // content.clipboard.dangerouslyPasteHTML(range.index, '<img src="'+url+'" class="ql-embed-selected">');
        // content.clipboard.dangerouslyPasteHTML(range.index, '<input type="textbox">');
    }

    $('#video-button').click(function() {
        let range = quill.getSelection(true);
        let url = prompt('Enter link URL');
        url = url.replace("watch?v=", "embed/");
        url = url.replace("&", "?");
        quill.insertEmbed(range.index, 'ytvideo', url, Quill.sources.USER);
        quill.formatText(range.index + 1, 1, { height: '170', width: '400' });
        quill.setSelection(range.index + 1, Quill.sources.SILENT);
        // $('#sidebar-controls').hide();
    });

    $('#divider-button').click(function() {
        let range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'divider', true, Quill.sources.USER);
        quill.setSelection(range.index + 1, Quill.sources.SILENT);
        // $('#sidebar-controls').hide();
    });

    // $('#test').click(function() {
    //     preview = quill.getText();
    //     length = preview.length;
    //     preview = preview.replace(/[\r\n]+/g, " ").substr(0, 49);
    //     if (length > 50){
    //         preview = preview.concat("...");
    //     }
    //     console.log(preview);
    // });

    // var socialFloat = document.querySelector('#sidebar-controls');
    // var footer = document.querySelector('#footer');
    // console.log(socialFloat);
    // console.log(footer);

    // function checkOffset() {
    //     function getRectTop(el){
    //         var rect = el.getBoundingClientRect();
    //         return rect.top;
    //     }

    //     if((getRectTop(socialFloat) + document.body.scrollTop) + socialFloat.offsetHeight >= (getRectTop(footer) + document.body.scrollTop) - 10){
    //         socialFloat.style.position = 'absolute';
    //         socialFloat.style.bottom = document.querySelector("#contentContainer").getBoundingClientRect().top - document.querySelector("#contentContainer").getBoundingClientRect().bottom - socialFloat.getBoundingClientRect().top + socialFloat.getBoundingClientRect().bottom ;
    //     }
    //     if(document.body.scrollTop + window.innerHeight < (getRectTop(footer) + document.body.scrollTop)){
    //         socialFloat.style.position = 'fixed'; // restore when you scroll up
    //         socialFloat.style.bottom = 10;
    //     }
    // }

    // document.addEventListener("scroll", function(){
    //     checkOffset();
    // });